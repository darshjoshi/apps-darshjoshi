"""
LiveManager — singleton that owns one F1LiveClient and fans out envelopes
to all connected WebSocket clients.

Responsibilities:
- One F1LiveClient per session (F1 only ever runs one session at a time).
- on_all callback: each update → transform (if .z) → build delta envelope
  → broadcast to all connected WS clients.
- New WS client: send current state as one snapshot envelope per topic,
  then stream subsequent delta envelopes.
- start(no_auth) / stop(): open/close the SignalR connection in a background
  asyncio task.
- Expose status for the /health endpoint.

.z topic transform (applied on BOTH live and replay paths):
  CarData.z  → topic "CarData",  data { "<num>": {speed, rpm, gear, throttle, brake, drs, ts} }
  Position.z → topic "Position", data { "<num>": {x, y, z, status, ts} }
  Parsed state is held in LiveManager._parsed_state (separate from client._state).

Envelope contract (must match iOS LiveMessage exactly):
  {"type": "snapshot" | "delta", "topic": "<TopicName>", "data": <json>, "ts": "<iso8601>"}
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import WebSocket

from .merger import deep_merge
from .signalr_client import F1LiveClient

logger = logging.getLogger("f1live.manager")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_envelope(msg_type: str, topic: str, data: Any) -> str:
    """Serialize a single envelope to a JSON string ready to send over WS."""
    return json.dumps({
        "type": msg_type,
        "topic": topic,
        "data": data,
        "ts": _now_iso(),
    })


def _transform_z(topic: str, data: Any, ts: str) -> Optional[tuple[str, dict]]:
    """Transform a raw .z topic into a parsed per-driver dict.

    Called at the ingest chokepoint for BOTH live (on_update) and replay paths.
    Returns (base_topic, transformed_data) or None if not a .z topic.

    Output shapes (iOS contract):
      CarData  → { "<racingNumber>": {"speed": int, "rpm": int, "gear": int,
                                       "throttle": int, "brake": int, "drs": int|null,
                                       "ts": "<iso>"} }
      Position → { "<racingNumber>": {"x": int, "y": int, "z": int,
                                       "status": str, "ts": "<iso>"} }
    """
    if not topic.endswith(".z"):
        return None

    base_topic = topic[:-2]  # "CarData.z" → "CarData", "Position.z" → "Position"

    if not isinstance(data, dict):
        return None

    if base_topic == "CarData":
        # data = {"Entries": [{"Utc": "...", "Cars": {"<num>": {"Channels": {"0":..., "2":...}}}}]}
        # JSON object keys are always strings; channel ids: "0"=rpm, "2"=speed, "3"=gear,
        # "4"=throttle, "5"=brake, "45"=drs.
        out: dict[str, dict] = {}
        for entry in data.get("Entries", []):
            entry_ts = entry.get("Utc", ts)
            for driver_num, car in entry.get("Cars", {}).items():
                ch = car.get("Channels", {})
                out[driver_num] = {
                    "rpm":      ch.get("0"),
                    "speed":    ch.get("2"),
                    "gear":     ch.get("3"),
                    "throttle": ch.get("4"),
                    "brake":    ch.get("5"),
                    "drs":      ch.get("45"),   # absent if not transmitted → None
                    "ts":       entry_ts,
                }
        return (base_topic, out)

    if base_topic == "Position":
        # data = {"Position": [{"Timestamp": "...", "Entries": {"<num>": {"X":...,"Y":...,"Z":...,"Status":...}}}]}
        out = {}
        for frame in data.get("Position", []):
            frame_ts = frame.get("Timestamp", ts)
            for driver_num, pos in frame.get("Entries", {}).items():
                out[driver_num] = {
                    "x":      pos.get("X"),
                    "y":      pos.get("Y"),
                    "z":      pos.get("Z"),
                    "status": pos.get("Status", ""),
                    "ts":     frame_ts,
                }
        return (base_topic, out)

    # Unknown .z topic — pass through unchanged under base name
    logger.debug(f"Unknown .z topic '{topic}' — passing through as '{base_topic}'")
    return (base_topic, data)


class LiveManager:
    """Singleton managing the live F1 feed and all connected WS clients."""

    def __init__(self):
        self._client: Optional[F1LiveClient] = None
        self._connect_task: Optional[asyncio.Task] = None
        self._clients: set[WebSocket] = set()
        self._connected: bool = False
        self._session_name: Optional[str] = None
        # Holds parsed per-driver state for CarData and Position (transformed from .z)
        # Separate from _client._state which retains the raw merged .z dicts.
        self._parsed_state: dict[str, Any] = {}

    # --- Status (for /health) ---

    @property
    def connected(self) -> bool:
        return self._connected

    @property
    def session_name(self) -> Optional[str]:
        return self._session_name

    @property
    def client_count(self) -> int:
        return len(self._clients)

    @property
    def topics_count(self) -> int:
        # Count non-.z client topics + parsed topics
        count = 0
        if self._client is not None:
            count += sum(1 for t in self._client._state.topics() if not t.endswith(".z"))
        count += len(self._parsed_state)
        return count

    @property
    def token_present(self) -> bool:
        return bool(os.getenv("F1_TV_TOKEN"))

    # --- Lifecycle ---

    async def start(self, no_auth: bool = True) -> None:
        """Open the SignalR connection in a background task.

        Tier A: no_auth=True (free topics, no token required).
        Tier B: no_auth=False, reads F1_TV_TOKEN from env.
        """
        if self._connect_task and not self._connect_task.done():
            logger.info("LiveManager already running — ignoring start()")
            return

        auth_token = None if no_auth else os.getenv("F1_TV_TOKEN")
        self._client = F1LiveClient(no_auth=no_auth, auth_token=auth_token)
        self._client.on_all(self._on_update)

        self._connected = False

        async def _run():
            self._connected = True
            logger.info(f"LiveManager starting (no_auth={no_auth})")
            try:
                await self._client.connect()
            except asyncio.CancelledError:
                pass
            finally:
                self._connected = False
                logger.info("LiveManager connection closed")

        self._connect_task = asyncio.create_task(_run())

    async def stop(self) -> None:
        """Close the SignalR connection and cancel the background task."""
        if self._client:
            await self._client.stop()
        if self._connect_task and not self._connect_task.done():
            self._connect_task.cancel()
            try:
                await self._connect_task
            except asyncio.CancelledError:
                pass
        self._connected = False
        self._client = None
        self._connect_task = None
        self._parsed_state = {}
        logger.info("LiveManager stopped")

    # --- WebSocket client management ---

    async def register(self, ws: WebSocket) -> None:
        """Accept a new WS client and send current state as snapshot envelopes."""
        self._clients.add(ws)
        logger.debug(f"WS client registered; total={len(self._clients)}")

        try:
            # Non-.z topics from client state (raw timing, driver, weather, etc.)
            if self._client is not None:
                for topic in self._client._state.topics():
                    if topic.endswith(".z"):
                        continue  # raw .z not sent; CarData/Position come from _parsed_state
                    data = self._client.get_state(topic)
                    if data is not None:
                        await ws.send_text(_build_envelope("snapshot", topic, data))

            # Parsed CarData / Position snapshots
            for topic, data in self._parsed_state.items():
                await ws.send_text(_build_envelope("snapshot", topic, data))

        except Exception as e:
            logger.warning(f"Snapshot send failed: {e}")
            self._clients.discard(ws)

    def unregister(self, ws: WebSocket) -> None:
        """Remove a WS client on disconnect."""
        self._clients.discard(ws)
        logger.debug(f"WS client unregistered; total={len(self._clients)}")

    # --- Internal: fan-out callback ---

    def _on_update(self, topic: str, data: Any, timestamp: str) -> None:
        """Called by F1LiveClient on every live update.

        Transforms .z topics to parsed per-driver dicts, updates _parsed_state,
        then builds a delta envelope and broadcasts to all WS clients.
        """
        # Extract session name from SessionInfo
        if topic == "SessionInfo" and isinstance(data, dict):
            meeting = data.get("Meeting", {})
            session_type = data.get("Type", "")
            event_name = meeting.get("Name", "")
            if event_name:
                self._session_name = f"{event_name} — {session_type}".strip(" —")

        result = _transform_z(topic, data, timestamp or _now_iso())
        if result is not None:
            out_topic, out_data = result
            # Merge into parsed state (latest wins per driver)
            self._parsed_state[out_topic] = deep_merge(
                self._parsed_state.get(out_topic, {}), out_data
            )
            envelope = _build_envelope("delta", out_topic, out_data)
        else:
            envelope = _build_envelope("delta", topic, data)

        asyncio.create_task(self._broadcast(envelope))

    async def _broadcast(self, envelope: str) -> None:
        """Send an envelope to all connected clients; remove any that error."""
        dead: set[WebSocket] = set()
        for ws in self._clients:
            try:
                await ws.send_text(envelope)
            except Exception as e:
                logger.debug(f"Broadcast failed (removing client): {e}")
                dead.add(ws)
        self._clients -= dead

    # --- State access (for /state endpoint) ---

    def get_full_state(self) -> dict[str, Any]:
        """Return the full current merged state dict (all topics, .z excluded).

        Non-.z topics come from client._state; CarData/Position come from _parsed_state.
        """
        state: dict[str, Any] = {}
        if self._client is not None:
            for topic in self._client._state.topics():
                if not topic.endswith(".z"):
                    state[topic] = self._client.get_state(topic)
        state.update(self._parsed_state)
        return state


# Module-level singleton — imported by router and replay
manager = LiveManager()
