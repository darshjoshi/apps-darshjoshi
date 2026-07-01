"""
F1 Live router — WebSocket stream + REST health/state/control endpoints.

Final URL prefix (registered in main.py): /api/f1-live/...

Endpoints:
  GET  /api/f1-live/health   — connection status
  GET  /api/f1-live/state    — full current merged state (REST convenience)
  WS   /api/f1-live/stream   — snapshot-on-connect, then live deltas
  POST /api/f1-live/control  — debug: start | stop | replay the feed

Auth:
  REST routes: Depends(verify_api_key) — disabled in dev when API_KEY is unset.
  WebSocket: X-API-Key header OR ?key= query param; open in dev (API_KEY unset).

replay.py is gitignored (dev-only). The import is guarded: if the file is absent
(e.g. on Render), action=replay returns HTTP 503 cleanly.
"""

import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status

from app.config import settings
from app.dependencies import verify_api_key
from app.services.f1_live.manager import manager
from app.services.f1_live import schedule as _schedule_mod

# Guard: replay.py is listed in .gitignore and absent on Render.
# Import it if available; action=replay returns 503 when it's None.
try:
    from app.services.f1_live import replay as _replay_mod
except ImportError:
    _replay_mod = None  # type: ignore[assignment]

logger = logging.getLogger("f1live.router")

router = APIRouter(prefix="/f1-live", tags=["f1-live"])


# --- REST: health ---

@router.get("/health", dependencies=[Depends(verify_api_key)])
async def health():
    """Return current connection status of the live feed."""
    return {
        "connected": manager.connected,
        "session": manager.session_name,
        "client_count": manager.client_count,
        "topics_count": manager.topics_count,
        "token_present": manager.token_present,
    }


# --- REST: full state snapshot ---

@router.get("/state", dependencies=[Depends(verify_api_key)])
async def state():
    """Return the full current merged state for all subscribed topics."""
    return manager.get_full_state()


# --- Debug control endpoint ---

@router.post("/control", dependencies=[Depends(verify_api_key)])
async def control(
    action: str = Query(..., description="start | stop | replay"),
    tier: str = Query("a", description="a (no_auth=True) | b (requires F1_TV_TOKEN)"),
    loop: bool = Query(False, description="Replay: loop indefinitely (loop=1)"),
    limit: int = Query(_replay_mod and _replay_mod._DEFAULT_REPLAY_LIMIT or 200,
                       description="Replay: max lines to read per pass (0 = all)"),
):
    """Start, stop, or replay the live feed (development / debug use).

    action=start          — connect to F1 SignalR (Tier A: free; Tier B: F1_TV_TOKEN)
    action=stop           — disconnect
    action=replay         — feed saved capture through pipeline (200-line smoke default)
    action=replay&limit=0 — stream full 17 786-line capture
    action=replay&loop=1  — stream indefinitely (deltas repeat)
    """
    action = action.lower()
    tier = tier.lower()

    if action == "start":
        no_auth = tier != "b"
        if not no_auth and not manager.token_present:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tier B requires F1_TV_TOKEN env var to be set",
            )
        await manager.start(no_auth=no_auth)
        return {"status": "started", "tier": tier}

    elif action == "stop":
        await manager.stop()
        return {"status": "stopped"}

    elif action == "replay":
        if _replay_mod is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="replay.py not available in this environment (dev-only file is gitignored)",
            )
        asyncio.create_task(_replay_mod.run_replay(limit=limit, loop=loop))
        return {
            "status": "replay_started",
            "limit": limit or "all",
            "loop": loop,
            "note": "Connect a WS client to /stream to receive envelopes",
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown action '{action}'. Use: start | stop | replay",
        )


# --- WebSocket stream ---

async def _verify_ws_api_key(ws: WebSocket) -> bool:
    """Verify API key for a WebSocket connection.

    Accepts the key via:
    - X-API-Key header (set by URLSessionWebSocketTask on iOS)
    - ?key= query param (fallback for browser clients)

    If API_KEY is unset/empty (dev mode), all connections are allowed.
    """
    if not settings.API_KEY:
        return True  # dev mode: open

    # Check header first (iOS URLSessionWebSocketTask sends it here)
    key_from_header = ws.headers.get("x-api-key") or ws.headers.get("X-API-Key")
    if key_from_header == settings.API_KEY:
        return True

    # Check query param fallback
    key_from_query = ws.query_params.get("key")
    if key_from_query == settings.API_KEY:
        return True

    return False


@router.websocket("/stream")
async def stream(ws: WebSocket):
    """WebSocket endpoint: snapshot-on-connect, then streaming deltas.

    Message format (the cross-repo contract):
      {"type": "snapshot" | "delta", "topic": "<TopicName>", "data": <json>, "ts": "<iso8601>"}

    On connect:
      1. API key is verified (header or ?key=); rejected with 1008 if invalid.
      2. One snapshot envelope is sent per topic that has current state.
      3. Subsequent delta envelopes stream in real time as the feed updates.

    On disconnect:
      Client is unregistered; subsequent broadcasts skip it.
    """
    if not await _verify_ws_api_key(ws):
        await ws.close(code=1008)  # 1008 = Policy Violation
        logger.warning("WS connection rejected: invalid API key")
        return

    await ws.accept()
    await manager.register(ws)
    logger.info("WS client connected")

    try:
        while True:
            # Await any incoming message to keep the connection alive.
            # Client-to-server control messages are not yet implemented.
            await ws.receive_text()
    except WebSocketDisconnect:
        logger.info("WS client disconnected")
    except Exception as e:
        logger.warning(f"WS error: {e}")
    finally:
        manager.unregister(ws)


# --- REST: schedule (F1 calendar + per-session UTC times, for the app's notifications) ---

@router.get("/schedule", dependencies=[Depends(verify_api_key)])
async def get_schedule():
    """Season schedule (rounds + per-session UTC start times) for the app's race-start
    notifications. Cached server-side; sourced from Jolpica."""
    try:
        return await _schedule_mod.get_schedule()
    except Exception as e:
        logger.warning("schedule endpoint failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Schedule temporarily unavailable",
        )
