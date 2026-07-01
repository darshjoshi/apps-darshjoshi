"""F1 season schedule for the app's race-start notifications.

Fetches the calendar (with per-session UTC times) from Jolpica (the Ergast successor),
normalizes it, and caches it in-memory. The app polls GET /api/f1-live/schedule and
schedules local notifications from it. Kept dumb: emit every session type Jolpica gives
and let the client filter to the ones it cares about.

Uses the same aiohttp + certifi idiom as signalr_client._negotiate() (aiohttp/certifi are
already deployed deps; requests is not on main).
"""
import logging
import ssl
import time
from typing import Any, Optional

import aiohttp
import certifi

logger = logging.getLogger("f1live.schedule")

_SEASON = 2026
_JOLPICA_URL = f"https://api.jolpi.ca/ergast/f1/{_SEASON}.json"
_CACHE_TTL = 6 * 3600  # seconds; the calendar barely changes

# module-level cache: {"data": <normalized>, "fetched_at": <monotonic seconds>}
_cache: dict[str, Any] = {}

# Jolpica session keys -> our normalized lowercase type names (race handled separately)
_SESSION_KEYS = {
    "FirstPractice": "practice1",
    "SecondPractice": "practice2",
    "ThirdPractice": "practice3",
    "SprintQualifying": "sprintqualifying",
    "Sprint": "sprint",
    "Qualifying": "qualifying",
}


def _ssl_context() -> ssl.SSLContext:
    return ssl.create_default_context(cafile=certifi.where())


def _combine(date: Optional[str], t: Optional[str]) -> Optional[str]:
    """Jolpica gives date '2026-07-05' + time '14:00:00Z' -> '2026-07-05T14:00:00Z'."""
    if not date or not t:
        return None
    return f"{date}T{t}"


def _normalize(payload: dict[str, Any]) -> dict[str, Any]:
    races = ((payload.get("MRData") or {}).get("RaceTable") or {}).get("Races") or []
    rounds = []
    for r in races:
        loc = ((r.get("Circuit") or {}).get("Location")) or {}
        sessions = []
        for key, name in _SESSION_KEYS.items():
            sess = r.get(key)
            if isinstance(sess, dict):
                start = _combine(sess.get("date"), sess.get("time"))
                if start:
                    sessions.append({"type": name, "startUTC": start})
        race_start = _combine(r.get("date"), r.get("time"))
        if race_start:
            sessions.append({"type": "race", "startUTC": race_start})
        rnd = r.get("round")
        rounds.append({
            "round": int(rnd) if str(rnd).isdigit() else rnd,
            "gpName": r.get("raceName"),
            "locality": loc.get("locality"),
            "country": loc.get("country"),
            "sessions": sessions,
        })
    return {"season": _SEASON, "rounds": rounds}


async def _fetch() -> dict[str, Any]:
    timeout = aiohttp.ClientTimeout(total=15)
    connector = aiohttp.TCPConnector(ssl=_ssl_context())
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        async with session.get(_JOLPICA_URL) as resp:
            resp.raise_for_status()
            return await resp.json(content_type=None)


async def get_schedule() -> dict[str, Any]:
    """Normalized season schedule, cached for _CACHE_TTL. Serves stale cache on fetch failure."""
    now = time.monotonic()
    cached = _cache.get("data")
    if cached is not None and (now - _cache.get("fetched_at", 0.0)) < _CACHE_TTL:
        return cached
    try:
        data = _normalize(await _fetch())
        _cache["data"] = data
        _cache["fetched_at"] = now
        logger.info("schedule refreshed from Jolpica: %d rounds", len(data.get("rounds", [])))
        return data
    except Exception as e:
        logger.warning("schedule fetch failed: %s", e)
        if cached is not None:
            return cached
        raise
