"""
F1 Data Service — processes raw static API feeds into structured JSON for the frontend.

Each function returns a dict ready to be serialized as a JSON API response.
"""

import json
import zlib
import base64
import requests
from collections import defaultdict
from typing import Optional
from datetime import datetime

from app.services.f1_client import (
    _get_json, _find_session, _get_keyframe, _get_stream,
    _driver_map, _deep_merge, _parse_stream_line, _find_driver_num,
    _parse_car_data, _resolve_circuit_id,
    STATIC_BASE, JOLPICA_BASE, _http,
)


# =============================================================================
# SEASONS & CALENDAR
# =============================================================================

def get_seasons() -> dict:
    """List available seasons with event counts."""
    seasons = []
    for year in range(2018, datetime.now().year + 1):
        try:
            n = len(_get_json(f"{year}/Index.json").get("Meetings", []))
            seasons.append({"year": year, "events": n})
        except Exception:
            pass
    return {"seasons": seasons}


def get_races(year: int) -> dict:
    """List all races and sessions for a season."""
    meetings = _get_json(f"{year}/Index.json").get("Meetings", [])
    races = []
    for m in meetings:
        sessions = [
            {"name": s["Name"], "type": s.get("Type", ""), "date": s.get("StartDate", "")}
            for s in m.get("Sessions", [])
        ]
        races.append({
            "name": m["Name"],
            "location": m.get("Location", ""),
            "country": m.get("Country", {}).get("Name", ""),
            "sessions": sessions,
        })
    return {"year": year, "races": races}


def get_race_info(year: int, race: str, session_type: str = "Race") -> dict:
    """Get session details and available feeds."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError(f"No '{session_type}' found for '{race}' in {year}")
    info = _get_keyframe(path, "SessionInfo")
    feeds = _get_json(f"{path}Index.json").get("Feeds", {})
    return {
        "race_name": race_name,
        "session": info.get("Name", session_type),
        "path": path,
        "feeds": sorted(feeds.keys()),
    }


# =============================================================================
# DRIVERS
# =============================================================================

def get_drivers(year: int, race: str, session_type: str = "Race") -> dict:
    """Get driver list with team colours and headshots."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError(f"No session found for '{race}' in {year}")
    dm = _driver_map(path)
    drivers = []
    for num, d in dm.items():
        drivers.append({
            "number": num,
            "tla": d["tla"],
            "name": d["name"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "headshot": d["headshot"],
        })
    return {"year": year, "race_name": race_name, "drivers": drivers}


# =============================================================================
# STANDINGS / RESULTS
# =============================================================================

def get_standings(year: int, race: str, session_type: str = "Race") -> dict:
    """Get race classification — positions, gaps, best laps, pit stops."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError(f"No session found")
    dm = _driver_map(path)
    timing = _get_keyframe(path, "TimingData")
    classified = []
    for num, data in timing.get("Lines", {}).items():
        if not isinstance(data, dict) or "Position" not in data:
            continue
        d = dm.get(num, {"name": f"#{num}", "team": "?", "tla": "?", "team_colour": "000000"})
        classified.append({
            "position": int(data["Position"]),
            "tla": d["tla"],
            "name": d["name"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "gap_to_leader": data.get("GapToLeader", ""),
            "interval": data.get("IntervalToPositionAhead", {}).get("Value", "") if isinstance(data.get("IntervalToPositionAhead"), dict) else "",
            "best_lap_time": data.get("BestLapTime", {}).get("Value", ""),
            "laps": data.get("NumberOfLaps", 0),
            "pit_stops": data.get("NumberOfPitStops", 0),
            "retired": bool(data.get("Retired", False)),
        })
    classified.sort(key=lambda x: x["position"])
    return {"year": year, "race_name": race_name, "session_type": session_type, "results": classified}


# =============================================================================
# LAP TIMES
# =============================================================================

def get_lap_times(year: int, race: str, driver: str = "",
                  session_type: str = "Race", lap_start: int = 1, lap_end: int = 999) -> dict:
    """Get lap-by-lap times from the stream, optionally filtered by driver."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")

    dm = _driver_map(path)
    target = _find_driver_num(driver, dm) if driver else None
    stream_text = _get_stream(path, "TimingData")
    state = _get_keyframe(path, "TimingData")

    laps = defaultdict(list)
    prev_lap_num = {}

    for line in stream_text.strip().split("\n"):
        ts, ds = _parse_stream_line(line)
        if not ds:
            continue
        try:
            state = _deep_merge(state, json.loads(ds))
        except json.JSONDecodeError:
            continue
        for num, info in state.get("Lines", {}).items():
            if target and num != target:
                continue
            if not isinstance(info, dict):
                continue
            lap_num = info.get("NumberOfLaps")
            lt = info.get("LastLapTime", {})
            val = lt.get("Value", "") if isinstance(lt, dict) else ""
            if not val or not lap_num:
                continue
            if lap_num != prev_lap_num.get(num):
                prev_lap_num[num] = lap_num
                if lap_start <= lap_num <= lap_end:
                    d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
                    laps[num].append({
                        "lap": lap_num,
                        "time": val,
                        "tla": d["tla"],
                        "team": d["team"],
                    })

    result = {}
    for num, entries in laps.items():
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        result[d["tla"]] = {
            "driver": d["tla"],
            "team": d["team"],
            "team_colour": d.get("team_colour", "000000"),
            "laps": entries,
        }
    return {"year": year, "race_name": race_name, "drivers": result}


# =============================================================================
# TYRE STRATEGY
# =============================================================================

def get_tyre_strategy(year: int, race: str, session_type: str = "Race") -> dict:
    """Get tyre strategy for every driver."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    tyres = _get_keyframe(path, "TyreStintSeries").get("Stints", {})
    timing = _get_keyframe(path, "TimingData").get("Lines", {})
    classified = sorted(
        ((int(d["Position"]), n) for n, d in timing.items() if isinstance(d, dict) and "Position" in d),
        key=lambda x: x[0]
    )

    strategies = []
    for pos, num in classified:
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        stints = []
        for s in tyres.get(num, []):
            if isinstance(s, dict):
                stints.append({
                    "compound": s.get("Compound", "?"),
                    "laps": s.get("TotalLaps", 0),
                    "new": s.get("New") == "true",
                    "start_lap": s.get("StartLaps", 0),
                })
        strategies.append({
            "position": pos,
            "tla": d["tla"],
            "name": d.get("name", ""),
            "team": d["team"],
            "team_colour": d.get("team_colour", "000000"),
            "stints": stints,
        })
    return {"year": year, "race_name": race_name, "strategies": strategies}


# =============================================================================
# PIT STOPS
# =============================================================================

def get_pit_stops(year: int, race: str, session_type: str = "Race") -> dict:
    """Get all pit stops sorted by fastest stop time."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    pit_times = _get_keyframe(path, "PitStopSeries").get("PitTimes", {})
    stops = []
    for num, sl in pit_times.items():
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        for s in sl:
            ps = s.get("PitStop", {})
            stops.append({
                "tla": d["tla"],
                "team": d["team"],
                "team_colour": d.get("team_colour", "000000"),
                "lap": int(ps.get("Lap", 0)),
                "pit_stop_time": ps.get("PitStopTime", ""),
                "pit_lane_time": ps.get("PitLaneTime", ""),
                "timestamp": s.get("Timestamp", ""),
            })
    stops.sort(key=lambda x: float(x["pit_stop_time"]) if x["pit_stop_time"] else 999)
    return {"year": year, "race_name": race_name, "pit_stops": stops}


# =============================================================================
# RACE CONTROL
# =============================================================================

def get_race_control(year: int, race: str, session_type: str = "Race", category: str = "") -> dict:
    """Get race control messages."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    msgs = _get_keyframe(path, "RaceControlMessages").get("Messages", [])
    ml = msgs if isinstance(msgs, list) else list(msgs.values())
    if category:
        cl = category.lower()
        ml = [m for m in ml if isinstance(m, dict) and
              (m.get("Category", "").lower() == cl or m.get("Flag", "").lower() == cl)]
    messages = []
    for m in ml:
        if isinstance(m, dict):
            messages.append({
                "lap": m.get("Lap", ""),
                "category": m.get("Category", ""),
                "flag": m.get("Flag", ""),
                "message": m.get("Message", ""),
                "timestamp": m.get("Utc", ""),
            })
    return {"year": year, "race_name": race_name, "messages": messages}


# =============================================================================
# WEATHER
# =============================================================================

def get_weather(year: int, race: str, session_type: str = "Race") -> dict:
    """Get latest weather conditions."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    w = _get_keyframe(path, "WeatherData")
    return {
        "year": year, "race_name": race_name,
        "weather": {
            "air_temp": w.get("AirTemp", ""),
            "track_temp": w.get("TrackTemp", ""),
            "humidity": w.get("Humidity", ""),
            "rainfall": w.get("Rainfall", "0") != "0",
            "wind_speed": w.get("WindSpeed", ""),
            "wind_direction": w.get("WindDirection", ""),
            "pressure": w.get("Pressure", ""),
        }
    }


def get_weather_series(year: int, race: str, session_type: str = "Race") -> dict:
    """Get full weather time series (~148 samples per race)."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    data = _get_keyframe(path, "WeatherDataSeries")
    series = []
    for entry in data.get("Series", []):
        w = entry.get("Weather", {})
        series.append({
            "timestamp": entry.get("Timestamp", ""),
            "air_temp": w.get("AirTemp", ""),
            "track_temp": w.get("TrackTemp", ""),
            "humidity": w.get("Humidity", ""),
            "rainfall": w.get("Rainfall", "0") != "0",
            "wind_speed": w.get("WindSpeed", ""),
            "wind_direction": w.get("WindDirection", ""),
            "pressure": w.get("Pressure", ""),
        })
    return {"year": year, "race_name": race_name, "series": series}


# =============================================================================
# SPEED TRAPS
# =============================================================================

def get_speed_traps(year: int, race: str, session_type: str = "Race") -> dict:
    """Get speed trap readings at 4 measurement points."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    lines = _get_keyframe(path, "TimingData").get("Lines", {})
    data = []
    for num, d in lines.items():
        if not isinstance(d, dict) or "Position" not in d:
            continue
        dr = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        sp = d.get("Speeds", {})
        if sp:
            data.append({
                "position": int(d["Position"]),
                "tla": dr["tla"],
                "team": dr["team"],
                "team_colour": dr.get("team_colour", "000000"),
                "I1": sp.get("I1", {}).get("Value", ""),
                "I2": sp.get("I2", {}).get("Value", ""),
                "FL": sp.get("FL", {}).get("Value", ""),
                "ST": sp.get("ST", {}).get("Value", ""),
            })
    data.sort(key=lambda x: x["position"])
    return {"year": year, "race_name": race_name, "speed_traps": data}


# =============================================================================
# DRIVER COMPARISON
# =============================================================================

def get_driver_comparison(driver_a: str, driver_b: str, year: int, race: str,
                          session_type: str = "Race") -> dict:
    """Compare two drivers head-to-head."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    na = _find_driver_num(driver_a, dm)
    nb = _find_driver_num(driver_b, dm)
    if not na:
        raise ValueError(f"Driver '{driver_a}' not found")
    if not nb:
        raise ValueError(f"Driver '{driver_b}' not found")

    timing = _get_keyframe(path, "TimingData").get("Lines", {})
    tyres = _get_keyframe(path, "TyreStintSeries").get("Stints", {})
    pits = _get_keyframe(path, "PitStopSeries").get("PitTimes", {})
    abbr = {"SOFT": "S", "MEDIUM": "M", "HARD": "H", "INTERMEDIATE": "I", "WET": "W"}

    drivers_data = []
    for num in [na, nb]:
        d = dm[num]
        data = timing.get(num, {})
        if not isinstance(data, dict):
            continue
        stints = tyres.get(num, [])
        strategy = [
            {"compound": s.get("Compound", "?"), "laps": s.get("TotalLaps", 0)}
            for s in stints if isinstance(s, dict)
        ]
        pit_list = [
            {"lap": p.get("PitStop", {}).get("Lap", "?"),
             "time": p.get("PitStop", {}).get("PitStopTime", "?")}
            for p in pits.get(num, [])
        ]
        drivers_data.append({
            "tla": d["tla"],
            "name": d["name"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "position": data.get("Position", "?"),
            "gap_to_leader": data.get("GapToLeader", ""),
            "best_lap_time": data.get("BestLapTime", {}).get("Value", ""),
            "laps": data.get("NumberOfLaps", 0),
            "pit_stops": data.get("NumberOfPitStops", 0),
            "strategy": strategy,
            "pits": pit_list,
        })
    return {"year": year, "race_name": race_name, "comparison": drivers_data}


# =============================================================================
# LAP POSITIONS (for Position River chart)
# =============================================================================

def get_lap_positions(year: int, race: str, session_type: str = "Race") -> dict:
    """Get lap-by-lap positions from LapSeries feed."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    lap_series = _get_keyframe(path, "LapSeries")
    positions = {}
    for num, data in lap_series.items():
        if not isinstance(data, dict):
            continue
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        lp = data.get("LapPosition", [])
        positions[d["tla"]] = {
            "tla": d["tla"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "positions": [int(p) if p else None for p in lp],
        }
    return {"year": year, "race_name": race_name, "positions": positions}


# =============================================================================
# OVERTAKES (official data — first tool ever to use this!)
# =============================================================================

def get_overtakes(year: int, race: str, session_type: str = "Race") -> dict:
    """Get official overtake data from OvertakeSeries feed."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    overtake_data = _get_keyframe(path, "OvertakeSeries")
    overtakes = overtake_data.get("Overtakes", {})
    result = {}
    for num, events in overtakes.items():
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        entries = [
            {"timestamp": e.get("Timestamp", ""), "count": e.get("count", 0)}
            for e in events
        ] if isinstance(events, list) else []
        total = max((e["count"] for e in entries), default=0)
        result[d["tla"]] = {
            "tla": d["tla"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "total_overtakes": total,
            "events": entries,
        }
    return {"year": year, "race_name": race_name, "overtakes": result}


# =============================================================================
# CHAMPIONSHIP PREDICTION (live WDC/WCC projections during race)
# =============================================================================

def get_championship_prediction(year: int, race: str, session_type: str = "Race") -> dict:
    """Get championship prediction data."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    pred = _get_keyframe(path, "ChampionshipPrediction")
    drivers = {}
    for num, data in pred.get("Drivers", {}).items():
        if not isinstance(data, dict):
            continue
        d = dm.get(num, {"tla": f"#{num}", "team": "?"})
        drivers[d["tla"]] = {
            "tla": d["tla"],
            "team": d.get("team", "?"),
            "current_position": data.get("CurrentPosition"),
            "predicted_position": data.get("PredictedPosition"),
            "current_points": data.get("CurrentPoints", 0),
            "predicted_points": data.get("PredictedPoints", 0),
        }
    teams = {}
    for team_name, data in pred.get("Teams", {}).items():
        if not isinstance(data, dict):
            continue
        teams[team_name] = {
            "team": data.get("TeamName", team_name),
            "current_position": data.get("CurrentPosition"),
            "predicted_position": data.get("PredictedPosition"),
            "current_points": data.get("CurrentPoints", 0),
            "predicted_points": data.get("PredictedPoints", 0),
        }
    return {"year": year, "race_name": race_name, "drivers": drivers, "teams": teams}


# =============================================================================
# TIMING STATS (with mini-sectors)
# =============================================================================

def get_timing_stats(year: int, race: str, session_type: str = "Race") -> dict:
    """Get timing stats including personal bests and speed data."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    stats = _get_keyframe(path, "TimingStats")
    result = {}
    for num, data in stats.get("Lines", {}).items():
        if not isinstance(data, dict):
            continue
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        pb = data.get("PersonalBestLapTime", {})
        best_sectors = data.get("BestSectors", [])
        best_speeds = data.get("BestSpeeds", {})
        result[d["tla"]] = {
            "tla": d["tla"],
            "team": d["team"],
            "team_colour": d["team_colour"],
            "personal_best": {
                "lap": pb.get("Lap"),
                "position": pb.get("Position"),
                "value": pb.get("Value", ""),
            },
            "best_sectors": [
                {"position": s.get("Position"), "value": s.get("Value", "")}
                for s in best_sectors if isinstance(s, dict)
            ],
            "best_speeds": {
                k: {"position": v.get("Position"), "value": v.get("Value", "")}
                for k, v in best_speeds.items() if isinstance(v, dict)
            },
        }
    return {"year": year, "race_name": race_name, "stats": result}


# =============================================================================
# TRACK STATUS
# =============================================================================

def get_track_status(year: int, race: str, session_type: str = "Race") -> dict:
    """Get track status changes (flags, SC, VSC) from SessionData."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    session_data = _get_keyframe(path, "SessionData")
    status_series = session_data.get("StatusSeries", [])
    if isinstance(status_series, dict):
        status_series = list(status_series.values())
    statuses = []
    status_map = {
        "1": "AllClear", "2": "Yellow", "3": "Green",
        "4": "SafetyCar", "5": "Red", "6": "VSC", "7": "VSCEnding",
    }
    for s in status_series:
        if isinstance(s, dict):
            code = s.get("TrackStatus", "")
            statuses.append({
                "timestamp": s.get("Utc", ""),
                "status_code": code,
                "status": status_map.get(code, f"Unknown({code})"),
            })
    return {"year": year, "race_name": race_name, "statuses": statuses}


# =============================================================================
# RACE REPLAY (pre-computed lap-by-lap state)
# =============================================================================

def get_replay_data(year: int, race: str, session_type: str = "Race") -> dict:
    """Pre-compute entire race into lap-by-lap state for race replay."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError(f"No session found for '{race}' in {year}")

    dm = _driver_map(path)

    # 1. Process TimingData stream to get lap-by-lap state
    stream_text = _get_stream(path, "TimingData")
    state = _get_keyframe(path, "TimingData")

    lap_snapshots = {}  # lap_num -> snapshot of all drivers
    prev_lap_nums = {}  # driver_num -> last seen lap number
    max_lap = 0

    for line in stream_text.strip().split("\n"):
        ts, ds = _parse_stream_line(line)
        if not ds:
            continue
        try:
            state = _deep_merge(state, json.loads(ds))
        except json.JSONDecodeError:
            continue

        # Check if any driver completed a new lap
        for num, info in state.get("Lines", {}).items():
            if not isinstance(info, dict):
                continue
            lap_num = info.get("NumberOfLaps")
            if not lap_num:
                continue
            if lap_num != prev_lap_nums.get(num):
                prev_lap_nums[num] = lap_num
                if lap_num > max_lap:
                    max_lap = lap_num

                # Take snapshot of ALL drivers at this lap boundary
                if lap_num not in lap_snapshots:
                    snapshot = {}
                    for dnum, dinfo in state.get("Lines", {}).items():
                        if not isinstance(dinfo, dict):
                            continue
                        d = dm.get(dnum, {"tla": f"#{dnum}", "team": "?", "team_colour": "000000"})
                        lt = dinfo.get("LastLapTime", {})
                        last_lap_val = lt.get("Value", "") if isinstance(lt, dict) else ""
                        interval_data = dinfo.get("IntervalToPositionAhead", {})
                        interval_val = interval_data.get("Value", "") if isinstance(interval_data, dict) else ""
                        snapshot[dnum] = {
                            "num": dnum,
                            "tla": d["tla"],
                            "team": d["team"],
                            "team_colour": d.get("team_colour", "000000"),
                            "position": dinfo.get("Position"),
                            "gap": dinfo.get("GapToLeader", ""),
                            "interval": interval_val,
                            "last_lap": last_lap_val,
                            "laps": dinfo.get("NumberOfLaps", 0),
                        }
                    lap_snapshots[lap_num] = snapshot

    # 2. Build tyre lookup: (driver_num, lap) -> {compound, age}
    tyres = _get_keyframe(path, "TyreStintSeries").get("Stints", {})
    tyre_lookup = {}
    for num, stints in tyres.items():
        if not isinstance(stints, list):
            continue
        for s in stints:
            if not isinstance(s, dict):
                continue
            compound = s.get("Compound", "?")
            start = s.get("StartLaps", 0)
            total = s.get("TotalLaps", 0)
            for lap_offset in range(total):
                lap = start + lap_offset + 1
                tyre_lookup[(num, lap)] = {"compound": compound, "age": lap_offset + 1}

    # 3. Index pit stops by lap
    pit_times = _get_keyframe(path, "PitStopSeries").get("PitTimes", {})
    pit_by_lap = defaultdict(list)
    for num, stops in pit_times.items():
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        for s in stops:
            ps = s.get("PitStop", {})
            lap_val = ps.get("Lap", 0)
            lap = int(lap_val) if str(lap_val).isdigit() else 0
            if lap > 0:
                pit_by_lap[lap].append({
                    "tla": d["tla"],
                    "team": d["team"],
                    "time": ps.get("PitStopTime", ""),
                    "lane_time": ps.get("PitLaneTime", ""),
                })

    # 4. Index race control messages by lap
    msgs = _get_keyframe(path, "RaceControlMessages").get("Messages", [])
    if isinstance(msgs, dict):
        msgs = list(msgs.values())
    rc_by_lap = defaultdict(list)
    for m in msgs:
        if isinstance(m, dict):
            lap = m.get("Lap", "")
            rc_by_lap[lap].append({
                "message": m.get("Message", ""),
                "flag": m.get("Flag", ""),
                "category": m.get("Category", ""),
            })

    # 5. Track status timeline
    session_data = _get_keyframe(path, "SessionData")
    status_series = session_data.get("StatusSeries", [])
    if isinstance(status_series, dict):
        status_series = list(status_series.values())
    status_map = {
        "1": "AllClear", "2": "Yellow", "3": "Green",
        "4": "SafetyCar", "5": "Red", "6": "VSC", "7": "VSCEnding",
    }
    status_changes = []
    for s in status_series:
        if isinstance(s, dict):
            status_changes.append({
                "timestamp": s.get("Utc", ""),
                "status": status_map.get(s.get("TrackStatus", ""), "Unknown"),
            })

    # 6. Weather (latest snapshot)
    w = _get_keyframe(path, "WeatherData")
    weather = {
        "air_temp": w.get("AirTemp", ""),
        "track_temp": w.get("TrackTemp", ""),
        "humidity": w.get("Humidity", ""),
        "rainfall": w.get("Rainfall", "0") != "0",
        "wind_speed": w.get("WindSpeed", ""),
    }

    # Build laps array
    laps = []
    current_status = "AllClear"
    for lap_num in range(1, max_lap + 1):
        snap = lap_snapshots.get(lap_num, {})

        # Build positions list sorted by position
        positions = []
        for dnum, dsnap in snap.items():
            tyre = tyre_lookup.get((dnum, lap_num), {"compound": "?", "age": 0})
            positions.append({
                **dsnap,
                "compound": tyre["compound"],
                "tyre_age": tyre["age"],
            })
        positions.sort(key=lambda x: int(x["position"]) if x.get("position") and str(x["position"]).isdigit() else 99)

        laps.append({
            "lap": lap_num,
            "positions": positions,
            "pit_stops": pit_by_lap.get(lap_num, []),
            "race_control": rc_by_lap.get(lap_num, []) + rc_by_lap.get(str(lap_num), []),
            "track_status": current_status,
            "weather": weather,
        })

    # Build drivers dict
    drivers_dict = {}
    for num, d in dm.items():
        drivers_dict[num] = {
            "tla": d["tla"],
            "team": d["team"],
            "team_colour": d.get("team_colour", "000000"),
        }

    return {
        "race_name": race_name,
        "year": year,
        "total_laps": max_lap,
        "drivers": drivers_dict,
        "laps": laps,
    }


# =============================================================================
# TELEMETRY (per-lap CarData.z)
# =============================================================================

def get_telemetry(driver: str, year: int, race: str, lap: int = 0,
                  session_type: str = "Race") -> dict:
    """Get car telemetry for a specific driver and lap."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    target = _find_driver_num(driver, dm)
    if not target:
        available = ", ".join(d["tla"] for d in dm.values())
        raise ValueError(f"Driver '{driver}' not found. Available: {available}")

    d_info = dm[target]
    feeds = _get_json(f"{path}Index.json").get("Feeds", {})

    # Build lap boundaries from TimingData stream
    stream_text = _get_stream(path, "TimingData")
    state = _get_keyframe(path, "TimingData")
    boundaries = {}
    cur_lap = None

    for line in stream_text.strip().split("\n"):
        ts, ds = _parse_stream_line(line)
        if not ds:
            continue
        try:
            state = _deep_merge(state, json.loads(ds))
        except json.JSONDecodeError:
            continue
        info = state.get("Lines", {}).get(target, {})
        if not isinstance(info, dict):
            continue
        dl = info.get("NumberOfLaps")
        if dl and dl != cur_lap:
            if cur_lap and cur_lap in boundaries:
                boundaries[cur_lap]["end"] = ts
            boundaries[dl] = {"start": ts, "end": None}
            cur_lap = dl

    if lap == 0:
        total = max(boundaries.keys()) if boundaries else 0
        return {
            "driver": d_info["tla"],
            "team": d_info["team"],
            "race_name": race_name,
            "total_laps": total,
            "available_laps": sorted(boundaries.keys()),
        }

    if lap not in boundaries:
        raise ValueError(f"Lap {lap} not found. Available: {sorted(boundaries.keys())}")

    b = boundaries[lap]

    # Stream CarData.z for this lap
    car_stream = _get_stream(path, "CarData.z")
    samples = []
    in_window = False
    for line in car_stream.strip().split("\n"):
        ts, ds = _parse_stream_line(line)
        if not ds:
            continue
        if b["start"] and ts >= b["start"]:
            in_window = True
        if b["end"] and ts > b["end"]:
            break
        if not in_window:
            continue
        try:
            raw = json.loads(ds)
        except json.JSONDecodeError:
            continue
        if isinstance(raw, str):
            try:
                raw = json.loads(zlib.decompress(base64.b64decode(raw), -zlib.MAX_WBITS))
            except Exception:
                continue
        for e in _parse_car_data(raw) if isinstance(raw, dict) else []:
            if e["driver_number"] == target:
                samples.append(e)
        if len(samples) >= 100:
            break

    speeds = [s["speed"] for s in samples if s.get("speed") and s["speed"] > 0]
    return {
        "driver": d_info["tla"],
        "team": d_info["team"],
        "race_name": race_name,
        "lap": lap,
        "samples": len(samples),
        "max_speed": max(speeds) if speeds else 0,
        "min_speed": min(speeds) if speeds else 0,
        "avg_speed": round(sum(speeds) / len(speeds), 1) if speeds else 0,
        "telemetry": [
            {
                "timestamp": s.get("timestamp", ""),
                "speed": s.get("speed"),
                "rpm": s.get("rpm"),
                "throttle": s.get("throttle"),
                "brake": s.get("brake"),
                "gear": s.get("gear"),
                "drs": s.get("drs"),
            }
            for s in samples[:80]
        ],
    }


# =============================================================================
# HISTORICAL (Jolpica/Ergast — 1950+)
# =============================================================================

def get_historical_results(year: int = 0, race: str = "", driver: str = "") -> dict:
    """Get historical race results from 1950 to present."""
    if year and driver:
        url = f"{JOLPICA_BASE}/{year}/drivers/{driver}/results.json?limit=50"
    elif year:
        url = f"{JOLPICA_BASE}/{year}/results.json?limit=30"
    elif driver:
        url = f"{JOLPICA_BASE}/drivers/{driver}/results.json?limit=30"
    else:
        url = f"{JOLPICA_BASE}/current/results.json?limit=30"
    races = requests.get(url, timeout=10).json().get("MRData", {}).get("RaceTable", {}).get("Races", [])
    results = []
    for r in races[:20]:
        race_results = []
        for res in r.get("Results", [])[:10]:
            d = res["Driver"]
            c = res.get("Constructor", {})
            race_results.append({
                "position": res["position"],
                "driver": f"{d.get('givenName', '')} {d.get('familyName', '')}",
                "constructor": c.get("name", "?"),
                "points": res.get("points", "0"),
            })
        results.append({
            "season": r["season"],
            "race_name": r["raceName"],
            "round": r["round"],
            "results": race_results,
        })
    return {"races": results}


def get_championship_standings_historical(year: int = 0, standings_type: str = "driver") -> dict:
    """Get championship standings from 1950 to present."""
    season = str(year) if year else "current"
    if standings_type.lower() == "constructor":
        url = f"{JOLPICA_BASE}/{season}/constructorStandings.json"
    else:
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
    lists = requests.get(url, timeout=10).json().get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    if not lists:
        return {"season": season, "standings": []}
    s = lists[0]
    if standings_type.lower() == "constructor":
        entries = s.get("ConstructorStandings", [])
        standings = [
            {
                "position": e["position"],
                "name": e.get("Constructor", {}).get("name", "?"),
                "points": e["points"],
                "wins": e.get("wins", "0"),
            }
            for e in entries
        ]
    else:
        entries = s.get("DriverStandings", [])
        standings = [
            {
                "position": e["position"],
                "name": f"{e.get('Driver', {}).get('givenName', '')} {e.get('Driver', {}).get('familyName', '')}",
                "constructor": e.get("Constructors", [{}])[0].get("name", "?") if e.get("Constructors") else "?",
                "points": e["points"],
                "wins": e.get("wins", "0"),
            }
            for e in entries
        ]
    return {"season": s.get("season", "?"), "type": standings_type, "standings": standings}


# =============================================================================
# GRID VS FINISH
# =============================================================================

def get_grid_vs_finish(year: int, race: str, session_type: str = "Race") -> dict:
    """Compare starting grid to finishing positions using qualifying + race data."""
    path, race_name = _find_session(year, race, session_type)
    if not path:
        raise ValueError("No session found")
    dm = _driver_map(path)
    timing = _get_keyframe(path, "TimingData").get("Lines", {})

    # Build grid positions from qualifying session
    grid_map = {}  # driver_num -> grid position

    # Method 1: Try DriverRaceInfo
    try:
        race_info = _get_keyframe(path, "DriverRaceInfo")
        for num, dri in race_info.items():
            if isinstance(dri, dict) and dri.get("GridPosition"):
                grid_map[num] = int(dri["GridPosition"])
    except ValueError:
        pass

    # Method 2: If no grid data from DriverRaceInfo, derive from qualifying
    if not grid_map:
        try:
            quali_path, _ = _find_session(year, race, "Qualifying")
            if quali_path:
                quali_timing = _get_keyframe(quali_path, "TimingData").get("Lines", {})
                for num, data in quali_timing.items():
                    if isinstance(data, dict) and "Position" in data:
                        grid_map[num] = int(data["Position"])
        except (ValueError, Exception):
            pass

    results = []
    for num, data in timing.items():
        if not isinstance(data, dict) or "Position" not in data:
            continue
        d = dm.get(num, {"tla": f"#{num}", "team": "?", "team_colour": "000000"})
        finish = int(data["Position"])
        grid = grid_map.get(num)
        change = (grid - finish) if grid is not None else None
        results.append({
            "tla": d["tla"],
            "team": d["team"],
            "team_colour": d.get("team_colour", "000000"),
            "grid": grid,
            "finish": finish,
            "change": change,
        })
    results.sort(key=lambda x: x["finish"])
    return {"year": year, "race_name": race_name, "results": results}
