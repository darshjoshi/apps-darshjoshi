"""
Session-watcher STUB — auto-start/stop the live feed around F1 sessions.

This module is gated by env var F1_LIVE_AUTOSTART (default OFF) so the
always-on Render box does NOT hold a SignalR connection between sessions.
For development/testing, use the POST /api/f1-live/control endpoint instead.

TODO (real implementation):
  1. Poll the F1 schedule (pitwall get_schedule / Jolpica) every few minutes.
  2. Find the next upcoming session and compute start/end times.
  3. Call manager.start() ~5 minutes before the session starts.
  4. Call manager.stop() after the session status flips to "Finalised".
  5. Handle race weekend sessions in sequence (FP1→FP2→FP3→Quali→Sprint→Race).
  6. Retry on errors; log session name + start/stop times for observability.
  7. Cache the schedule to avoid hitting Jolpica on every poll cycle.

Session status values from F1 feed:
  "Inactive" → "Started" → "Aborted" | "Finished" → "Finalised"
  Disconnect after "Finalised" (a few minutes of buffer).
"""

import asyncio
import logging
import os

logger = logging.getLogger("f1live.session_watcher")


async def run_session_watcher() -> None:
    """Entry point for the session-watcher background task (stub).

    Reads F1_LIVE_AUTOSTART from env. If not "1" or "true", returns immediately.
    When enabled, would loop indefinitely managing feed lifecycle per session.
    """
    autostart = os.getenv("F1_LIVE_AUTOSTART", "0").lower()
    if autostart not in ("1", "true", "yes"):
        logger.info("Session watcher disabled (F1_LIVE_AUTOSTART not set). "
                    "Use POST /api/f1-live/control?action=start to connect manually.")
        return

    logger.info("Session watcher enabled — TODO: implement schedule polling")
    # TODO: implement real session polling loop here
    # Example skeleton:
    #   while True:
    #       schedule = await fetch_schedule()
    #       next_session = find_next_session(schedule)
    #       if next_session:
    #           await sleep_until(next_session.start - timedelta(minutes=5))
    #           await manager.start(no_auth=True)
    #           await wait_for_finalised()
    #           await manager.stop()
    #       await asyncio.sleep(300)  # poll every 5 min when idle
    await asyncio.sleep(0)  # minimal: yield control, then return
