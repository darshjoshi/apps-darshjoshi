"""
F1 Static API Client — fetches and caches data from F1's free live timing archive.

Adapted from Pitwall MCP Server (github.com/darshjoshi/pitwall).
Coverage: 2018–present, ~33 feeds × 5 sessions × 22+ races per year.
No API keys needed.
"""

import json
import os
import copy
import hashlib
import zlib
import base64
import requests
from collections import defaultdict
from typing import Optional

STATIC_BASE = "https://livetiming.formula1.com/static"
JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

# File-based cache directory
CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "f1_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

_http = requests.Session()
_http.headers.update({"User-Agent": "F1Everything/1.0"})

# Channel mapping for CarData.z telemetry
CAR_CHANNELS = {0: "rpm", 2: "speed", 3: "gear", 4: "throttle", 5: "brake", 45: "drs"}

# GP name → Ergast circuitId mapping
CIRCUIT_MAP = {
    "australia": "albert_park", "melbourne": "albert_park",
    "bahrain": "bahrain", "sakhir": "bahrain",
    "saudi": "jeddah", "saudi arabia": "jeddah", "jeddah": "jeddah",
    "china": "shanghai", "shanghai": "shanghai", "chinese": "shanghai",
    "japan": "suzuka", "suzuka": "suzuka", "japanese": "suzuka",
    "miami": "miami",
    "emilia romagna": "imola", "imola": "imola",
    "monaco": "monaco",
    "canada": "villeneuve", "montreal": "villeneuve",
    "spain": "catalunya", "barcelona": "catalunya",
    "austria": "red_bull_ring", "spielberg": "red_bull_ring",
    "britain": "silverstone", "silverstone": "silverstone", "british": "silverstone",
    "hungary": "hungaroring", "budapest": "hungaroring",
    "belgium": "spa", "spa": "spa",
    "netherlands": "zandvoort", "dutch": "zandvoort",
    "italy": "monza", "monza": "monza", "italian": "monza",
    "azerbaijan": "baku", "baku": "baku",
    "singapore": "marina_bay",
    "united states": "americas", "usa": "americas", "austin": "americas", "cota": "americas",
    "mexico": "rodriguez", "mexico city": "rodriguez",
    "brazil": "interlagos", "sao paulo": "interlagos", "interlagos": "interlagos",
    "las vegas": "vegas", "vegas": "vegas",
    "qatar": "losail", "losail": "losail",
    "abu dhabi": "yas_marina",
    "portugal": "portimao",
    "turkey": "istanbul",
}


# =============================================================================
# CACHING LAYER
# =============================================================================

def _cache_key(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()


def _cache_get(url: str) -> Optional[dict]:
    path = os.path.join(CACHE_DIR, _cache_key(url) + ".json")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return None


def _cache_set(url: str, data):
    path = os.path.join(CACHE_DIR, _cache_key(url) + ".json")
    with open(path, "w") as f:
        json.dump(data, f)


# =============================================================================
# LOW-LEVEL API HELPERS
# =============================================================================

def _get_json(path: str) -> dict:
    """Fetch JSON from static API with caching."""
    url = f"{STATIC_BASE}/{path}"
    cached = _cache_get(url)
    if cached is not None:
        return cached
    resp = _http.get(url, timeout=15)
    resp.raise_for_status()
    resp.encoding = "utf-8-sig"
    data = resp.json()
    _cache_set(url, data)
    return data


def _find_session(year: int, race: str, session_type: str = "Race") -> tuple:
    """Find session path by fuzzy matching race name."""
    data = _get_json(f"{year}/Index.json")
    race_lower = race.lower()
    session_lower = session_type.lower()

    for m in data.get("Meetings", []):
        name = m.get("Name", "").lower()
        location = m.get("Location", "").lower()
        country = m.get("Country", {}).get("Name", "").lower()

        if race_lower not in name and race_lower not in location and race_lower not in country:
            continue

        sessions = m.get("Sessions", [])
        # Priority: exact name > partial name > type match
        for s in sessions:
            if s.get("Name", "").lower() == session_lower:
                return s["Path"], m["Name"]
        for s in sessions:
            if session_lower in s.get("Name", "").lower():
                return s["Path"], m["Name"]
        for s in sessions:
            if s.get("Type", "").lower() == session_lower:
                return s["Path"], m["Name"]

    return None, None


def _get_keyframe(session_path: str, feed_name: str) -> dict:
    """Get keyframe data for a specific feed, with caching."""
    cache_url = f"keyframe:{session_path}{feed_name}"
    cached = _cache_get(cache_url)
    if cached is not None:
        return cached

    feeds = _get_json(f"{session_path}Index.json").get("Feeds", {})
    if feed_name not in feeds:
        raise ValueError(f"Feed '{feed_name}' not available. Available: {list(feeds.keys())}")

    url = f"{STATIC_BASE}/{session_path}{feeds[feed_name]['KeyFramePath']}"
    resp = _http.get(url, timeout=15)
    resp.raise_for_status()
    resp.encoding = "utf-8-sig"

    if feed_name.endswith(".z"):
        raw = resp.json()
        if isinstance(raw, str):
            data = json.loads(zlib.decompress(base64.b64decode(raw), -zlib.MAX_WBITS))
        else:
            data = raw
    else:
        data = resp.json()

    _cache_set(cache_url, data)
    return data


def _get_stream(session_path: str, feed_name: str) -> str:
    """Get the stream content for incremental feeds."""
    cache_url = f"stream:{session_path}{feed_name}"
    cached = _cache_get(cache_url)
    if cached is not None:
        return cached

    feeds = _get_json(f"{session_path}Index.json").get("Feeds", {})
    if feed_name not in feeds:
        raise ValueError(f"Feed '{feed_name}' not available")

    sp = feeds[feed_name].get("StreamPath", "")
    if not sp:
        raise ValueError(f"No stream path for '{feed_name}'")

    url = f"{STATIC_BASE}/{session_path}{sp}"
    resp = _http.get(url, timeout=30)
    resp.raise_for_status()
    resp.encoding = "utf-8-sig"
    text = resp.text
    _cache_set(cache_url, text)
    return text


def _driver_map(session_path: str) -> dict:
    """Get driver number → info mapping."""
    drivers = _get_keyframe(session_path, "DriverList")
    return {
        num: {
            "name": d["FullName"],
            "tla": d.get("Tla", "?"),
            "team": d.get("TeamName", "?"),
            "team_colour": d.get("TeamColour", "000000"),
            "number": d.get("RacingNumber", num),
            "headshot": d.get("HeadshotUrl", ""),
        }
        for num, d in drivers.items()
        if isinstance(d, dict) and "FullName" in d
    }


def _deep_merge(base, update):
    """Deep merge two dicts (for incremental stream processing)."""
    if not isinstance(base, dict) or not isinstance(update, dict):
        return update
    merged = copy.copy(base)
    for k, v in update.items():
        if k in merged and isinstance(merged[k], dict) and isinstance(v, dict):
            merged[k] = _deep_merge(merged[k], v)
        else:
            merged[k] = v
    return merged


def _parse_stream_line(line: str):
    """Parse a single line from a .jsonStream file."""
    line = line.strip().rstrip("\x1e")
    if not line:
        return None, None
    if "\x1e" in line:
        parts = line.split("\x1e", 1)
        return parts[0].strip(), parts[1].strip()
    for i, ch in enumerate(line):
        if ch in ('{', '[', '"'):
            return line[:i].strip(), line[i:]
    return None, None


def _find_driver_num(driver: str, dm: dict) -> Optional[str]:
    """Find driver number by TLA or number."""
    d = driver.upper()
    for num, info in dm.items():
        if info["tla"] == d or num == d:
            return num
    return None


def _parse_car_data(data: dict) -> list:
    """Parse decompressed CarData.z into telemetry entries."""
    results = []
    for entry in data.get("Entries", []):
        ts = entry.get("Utc", "")
        for num, car in entry.get("Cars", {}).items():
            ch = car.get("Channels", {})
            row = {"timestamp": ts, "driver_number": num}
            for cid, name in CAR_CHANNELS.items():
                row[name] = ch.get(str(cid), ch.get(cid))
            results.append(row)
    return results


def _resolve_circuit_id(gp: str) -> Optional[str]:
    return CIRCUIT_MAP.get(gp.lower().strip())
