"""
F1 Everything API Routes
All endpoints for the F1 analytics dashboard.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services import f1_service

router = APIRouter(
    prefix="/f1",
    tags=["f1-everything"],
)


# =============================================================================
# HEALTH
# =============================================================================

@router.get("/health")
async def health():
    return {"status": "healthy", "app": "f1-everything"}


# =============================================================================
# SEASONS & CALENDAR
# =============================================================================

@router.get("/seasons")
async def seasons():
    """List available F1 seasons (2018-present)."""
    try:
        return f1_service.get_seasons()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/races")
async def races(year: int = Query(default=2026, ge=2018, le=2030)):
    """List all races and sessions for a season."""
    try:
        return f1_service.get_races(year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/race-info")
async def race_info(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get session details and available data feeds."""
    try:
        return f1_service.get_race_info(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# DRIVERS
# =============================================================================

@router.get("/drivers")
async def drivers(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get driver list with team colours and headshots."""
    try:
        return f1_service.get_drivers(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# STANDINGS / RESULTS
# =============================================================================

@router.get("/standings")
async def standings(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get race classification — positions, gaps, best laps."""
    try:
        return f1_service.get_standings(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# LAP TIMES
# =============================================================================

@router.get("/lap-times")
async def lap_times(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    driver: str = Query(default=""),
    session_type: str = Query(default="Race"),
    lap_start: int = Query(default=1),
    lap_end: int = Query(default=999),
):
    """Get lap-by-lap times for one or all drivers."""
    try:
        return f1_service.get_lap_times(year, race, driver, session_type, lap_start, lap_end)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# TELEMETRY
# =============================================================================

@router.get("/telemetry")
async def telemetry(
    driver: str = Query(..., description="Driver TLA (e.g. VER, HAM)"),
    year: int = Query(default=2026),
    race: str = Query(default=""),
    lap: int = Query(default=0, description="Lap number (0 = show available laps)"),
    session_type: str = Query(default="Race"),
):
    """Get car telemetry — speed, RPM, throttle, brake, gear, DRS for a specific lap."""
    try:
        return f1_service.get_telemetry(driver, year, race, lap, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# TYRE STRATEGY
# =============================================================================

@router.get("/strategy")
async def strategy(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get tyre strategy for every driver."""
    try:
        return f1_service.get_tyre_strategy(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# PIT STOPS
# =============================================================================

@router.get("/pit-stops")
async def pit_stops(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get all pit stops sorted by fastest stop time."""
    try:
        return f1_service.get_pit_stops(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# RACE CONTROL
# =============================================================================

@router.get("/race-control")
async def race_control(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
    category: str = Query(default="", description="Filter: Flag, SafetyCar, Drs, or empty for all"),
):
    """Get race control messages — flags, penalties, safety cars."""
    try:
        return f1_service.get_race_control(year, race, session_type, category)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# WEATHER
# =============================================================================

@router.get("/weather")
async def weather(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get latest weather conditions."""
    try:
        return f1_service.get_weather(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weather-series")
async def weather_series(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get full weather time series (~148 samples per race)."""
    try:
        return f1_service.get_weather_series(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# SPEED TRAPS
# =============================================================================

@router.get("/speed-traps")
async def speed_traps(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get speed trap readings at 4 measurement points."""
    try:
        return f1_service.get_speed_traps(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# DRIVER COMPARISON
# =============================================================================

@router.get("/driver-comparison")
async def driver_comparison(
    driver_a: str = Query(..., description="First driver TLA"),
    driver_b: str = Query(..., description="Second driver TLA"),
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Compare two drivers head-to-head."""
    try:
        return f1_service.get_driver_comparison(driver_a, driver_b, year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# LAP POSITIONS (Position River chart data)
# =============================================================================

@router.get("/lap-positions")
async def lap_positions(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get lap-by-lap positions for all drivers (Position River chart)."""
    try:
        return f1_service.get_lap_positions(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# OVERTAKES (official F1 data — world's first!)
# =============================================================================

@router.get("/overtakes")
async def overtakes(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get official overtake data from OvertakeSeries feed."""
    try:
        return f1_service.get_overtakes(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# CHAMPIONSHIP PREDICTION
# =============================================================================

@router.get("/championship-prediction")
async def championship_prediction(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get live championship prediction data."""
    try:
        return f1_service.get_championship_prediction(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# TIMING STATS (mini-sectors)
# =============================================================================

@router.get("/timing-stats")
async def timing_stats(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get timing stats including personal bests and speed data."""
    try:
        return f1_service.get_timing_stats(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# TRACK STATUS
# =============================================================================

@router.get("/track-status")
async def track_status(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get track status changes (flags, SC, VSC)."""
    try:
        return f1_service.get_track_status(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# RACE REPLAY
# =============================================================================

@router.get("/replay")
async def replay(
    year: int = Query(default=2025),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Get pre-computed lap-by-lap race data for replay mode."""
    try:
        return f1_service.get_replay_data(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# GRID VS FINISH
# =============================================================================

@router.get("/grid-vs-finish")
async def grid_vs_finish(
    year: int = Query(default=2026),
    race: str = Query(default=""),
    session_type: str = Query(default="Race"),
):
    """Compare starting grid to finishing positions."""
    try:
        return f1_service.get_grid_vs_finish(year, race, session_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# HISTORICAL (1950+)
# =============================================================================

@router.get("/historical/results")
async def historical_results(
    year: int = Query(default=0),
    race: str = Query(default=""),
    driver: str = Query(default=""),
):
    """Get historical race results from 1950 to present."""
    try:
        return f1_service.get_historical_results(year, race, driver)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historical/standings")
async def historical_standings(
    year: int = Query(default=0),
    standings_type: str = Query(default="driver", description="'driver' or 'constructor'"),
):
    """Get championship standings from 1950 to present."""
    try:
        return f1_service.get_championship_standings_historical(year, standings_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
