# F1 Analytics Dashboard — Full Spec

## What This Is

A data-driven F1 analytics dashboard built into the apps-darshjoshi platform at `/f1`. Zero LLM costs — all data comes from F1's free static API (32 feeds per session, 2018–2026). The backend pre-processes and caches feeds; the frontend renders interactive D3.js charts.

## Why It's Unique

Based on competitive research across 30+ existing F1 projects and all commercial products:

- **5 of 32 static API feeds have ZERO users worldwide** — nobody reads `OvertakeSeries`, `WeatherDataSeries`, `CurrentTyres`, `PitLaneTimeCollection`, or `TlaRcm`
- **3 more feeds are fetched but never analyzed** — `ChampionshipPrediction`, `LapSeries`, `DriverRaceInfo`
- **No paid consumer F1 analytics product exists** — F1 TV is viewing, AWS Insights are broadcast-only
- **TracingInsights is the closest competitor** (30+ chart types) but uses none of the untapped feeds

---

## Data Sources (All Free, No API Keys)

### F1 Static API

Base URL: `https://livetiming.formula1.com/static/{year}/{session_path}/`

Coverage: 2018–2026, ~33 feeds × 5 sessions × 22+ races per year

| Feed | Format | What's Inside | Used By Anyone? |
|---|---|---|---|
| `TimingData` | .json / .jsonStream | Position, gaps, sectors (3), mini-sector segments, speed traps, best/last lap times, pit status | Yes (FastF1, many) |
| `TimingDataF1` | .json / .jsonStream | Same as TimingData but F1-app variant | Rarely |
| `TimingStats` | .json | Personal best lap/sectors/speeds with ranking. **~25 mini-sector segments per driver** | Partially (mini-sectors unexploited) |
| `TimingAppData` | .json | Stint details: compound, lap counts, best lap per stint | Yes (FastF1) |
| `LapSeries` | .json | Position of every driver on every lap (pre-computed array) | **No** |
| `OvertakeSeries` | .json | Timestamped overtake events per driver with cumulative counts | **No** |
| `TyreStintSeries` | .json | All stints per driver: compound, new/used, total laps, start laps | Yes |
| `CurrentTyres` | .json | Compound + new/used status currently fitted per car | **No** |
| `PitStopSeries` | .json | Every pit stop: stationary time, pit lane time, lap, timestamp | Yes |
| `PitLaneTimeCollection` | .json | Detailed pit lane entry/exit timing breakdown | **No** |
| `PitStop` | .json | Most recent pit stop (single record) | Rarely |
| `DriverRaceInfo` | .json | Position, gap, interval, pit count, `IsOut` flag per driver | **No** |
| `ChampionshipPrediction` | .json | Live WDC/WCC points projection based on current race positions | **No** |
| `RaceControlMessages` | .json | Flags, penalties, SC, VSC, investigations (280+ msgs per race) | Yes |
| `TrackStatus` | .json | Green/yellow/VSC/SC/red flag status codes | Yes |
| `SessionData` | .json | Lap completion timestamps + track/session status changes timeline | Rarely |
| `WeatherData` | .json | Latest conditions: air/track temp, humidity, rain, wind | Yes |
| `WeatherDataSeries` | .json | **148 weather samples per race** (~60s intervals) with all conditions | **No** |
| `DriverList` | .json | Names, numbers, teams, team colours, headshot URLs | Yes |
| `TopThree` | .json | Podium positions with gaps, team colours | **No** |
| `SessionInfo` | .json | Meeting name, circuit, country, dates, GMT offset | Yes |
| `SessionStatus` | .json | Session lifecycle: Started/Finished/Finalised | Rarely |
| `LapCount` | .json | Current lap / total laps | Rarely |
| `ExtrapolatedClock` | .json | Server clock for remaining time sync | Rarely |
| `TlaRcm` | .json | Latest race control message with TLA | **No** |
| `CarData.z` | .json (compressed) | Speed, RPM, throttle, brake, gear, DRS @ ~4Hz per car. Base64 + raw deflate | Yes (FastF1) |
| `Position.z` | .json (compressed) | X/Y/Z GPS coordinates per car @ ~4Hz. Base64 + raw deflate | Yes (FastF1) |
| `AudioStreams` | .json | Live commentary HLS stream URLs | No |
| `ContentStreams` | .json | Media stream metadata | No |
| `Heartbeat` | .json | Server liveness timestamp | No |
| `ArchiveStatus` | .json | Whether session archive is complete | No |

### Jolpica-F1 API (Ergast Replacement)

Base URL: `https://api.jolpi.ca/ergast/f1/`

Coverage: 1950–2026 (race results, standings, schedules, circuits, winners)

### Pitwall MCP Server (Development-Time Data Source)

**What it is:** A connected MCP server with 69 tools that wraps both the F1 Static API and FastF1 (Python library). Available in the Claude Code development environment — can be called during development to fetch, validate, and prototype with real data without writing any backend code first.

**Coverage:** 2018–2026 (static API feeds) + 1950–present (Jolpica/Ergast historical data)

**Why this matters for the spec:**
- **Prototyping shortcut**: Every dashboard module can be prototyped by calling Pitwall tools to get real data shapes, then building the backend to replicate that data pipeline
- **Data validation**: Use Pitwall to verify feed schemas and edge cases before writing parsers
- **Additional processed data**: Pitwall provides pre-processed analyses that the spec's raw feeds don't — these can inform new modules or enrich existing ones

**Pitwall Tool Categories (69 tools total):**

| Category | Tools | What They Provide (beyond raw feeds) |
|---|---|---|
| **Session Discovery** | `list_seasons`, `list_races`, `get_race_info`, `get_schedule`, `get_session_info` | Session path resolution already solved — mirrors our `f1_fetcher.py` needs |
| **Results & Standings** | `get_standings`, `get_race_results`, `get_sprint_results`, `get_dnf_list`, `get_driver_standings`, `get_constructor_standings`, `get_championship_standings` | Race classification, DNF reasons, standings by round — Jolpica data pre-processed |
| **Lap Times** | `get_lap_times`, `get_lap_times_fastf1`, `get_personal_best_laps` | FastF1 variant includes **compound + tyre life per lap** (not in raw static feeds) |
| **Telemetry** | `get_telemetry`, `get_live_telemetry` | Speed/RPM/throttle/brake/gear/DRS at ~4Hz — same as `CarData.z` but pre-decompressed |
| **Tyre & Strategy** | `get_tyre_strategy`, `get_driver_tyre_detail`, `get_stint_analysis`, `compare_strategies`, `compare_tire_compounds`, `compare_tire_age_performance`, `analyze_starting_tires` | Stint degradation curves, compound comparison, fresh vs used tyre deltas — **pre-computed analysis not in raw feeds** |
| **Pit Stops** | `get_pit_stops`, `get_pit_stop_detail`, `get_fastest_pit_stops` | FastF1 pit detail includes **tyre compounds swapped** (not in raw `PitStopSeries`) |
| **Position & Overtakes** | `get_position_changes`, `detect_overtakes`, `get_gap_to_leader`, `compare_grid_to_finish` | Position-change-based overtake detection, gap evolution, grid-vs-finish delta |
| **Speed & Sectors** | `get_speed_traps`, `get_speed_trap_comparison`, `get_fastest_sectors`, `compare_sector_times` | Speed at 4 measurement points, sector-level driver comparison |
| **Race Control & Flags** | `get_race_control`, `get_race_control_messages`, `get_track_status`, `get_penalties`, `get_deleted_laps` | Penalties with details, deleted laps (track limits) — **`get_deleted_laps` is unique data** |
| **Weather** | `get_weather`, `get_weather_data`, `get_live_weather` | Session weather conditions (single snapshot, not the full series) |
| **Driver & Team** | `get_driver_info`, `get_driver_comparison`, `team_head_to_head`, `get_team_laps` | Head-to-head comparisons, team lap aggregation |
| **Circuit** | `get_circuit_info`, `get_track_record` | Corner positions, DRS zones, track records — **useful for Mini-Sector Battle Map** |
| **Advanced Analysis** | `analyze_lap_consistency`, `analyze_brake_points`, `analyze_rpm_data`, `analyze_drs_usage`, `analyze_long_run_pace` | Std deviation consistency scoring, braking patterns, RPM analysis, long-run pace — **none of these exist in raw feeds** |
| **Qualifying** | `get_qualifying_progression` | Q1/Q2/Q3 elimination breakdown |
| **Historical (1950+)** | `get_historical_results`, `get_championship_standings`, `get_race_winners_history` | Ergast/Jolpica data — extends coverage back to 1950 |
| **Visualization** | `plot_telemetry_comparison`, `plot_multi_telemetry_comparison`, `plot_driver_telemetry_comparison`, `plot_gear_shifts` | Server-side image generation (FastF1 matplotlib) — useful for reference/validation |
| **Live Session** | `get_live_session_status`, `get_live_positions`, `get_live_lap_times`, `get_live_sector_times`, `get_live_telemetry`, `get_live_weather` | Real-time data during active sessions |

### Feed Data Structures (Key Schemas)

**OvertakeSeries:**
```json
{
  "Overtakes": {
    "16": [{ "Timestamp": "2026-03-08T04:15:22", "count": 3 }],
    "63": [{ "Timestamp": "2026-03-08T04:16:01", "count": 1 }]
  }
}
```

**LapSeries:**
```json
{
  "63": { "RacingNumber": "63", "LapPosition": ["1","2","1","1","1",...] },
  "12": { "RacingNumber": "12", "LapPosition": ["2","1","2","2","2",...] }
}
```

**WeatherDataSeries:**
```json
{
  "Series": [{
    "Timestamp": "2026-03-08T03:05:00",
    "Weather": {
      "AirTemp": "23.1", "TrackTemp": "33.3", "Humidity": "55.2",
      "Pressure": "1011.5", "Rainfall": "0", "WindDirection": "117", "WindSpeed": "1.9"
    }
  }]
}
```

**ChampionshipPrediction:**
```json
{
  "Drivers": {
    "63": { "RacingNumber": "63", "CurrentPosition": 1, "PredictedPosition": 1, "CurrentPoints": 0, "PredictedPoints": 25.0 }
  },
  "Teams": {
    "Mercedes": { "TeamName": "Mercedes", "CurrentPosition": 1, "PredictedPosition": 1, "PredictedPoints": 43.0 }
  }
}
```

**TimingStats (with mini-sectors):**
```json
{
  "Lines": {
    "63": {
      "PersonalBestLapTime": { "Lap": 21, "Position": 2, "Value": "1:22.670" },
      "BestSectors": [{ "Position": 2, "Value": "28.901" }],
      "BestSpeeds": { "I1": { "Position": 5, "Value": "298" }, "ST": { "Position": 3, "Value": "312" } }
    }
  }
}
```

**PitStopSeries:**
```json
{
  "PitTimes": {
    "63": [{
      "Timestamp": "2026-03-08T04:10:15",
      "PitStop": { "RacingNumber": "63", "PitStopTime": "2.3", "PitLaneTime": "17.794", "Lap": "12" }
    }]
  }
}
```

**DriverList:**
```json
{
  "63": {
    "RacingNumber": "63", "BroadcastName": "G RUSSELL", "FullName": "George RUSSELL",
    "Tla": "RUS", "TeamName": "Mercedes", "TeamColour": "00D7B6",
    "HeadshotUrl": "https://..."
  }
}
```

---

## Dashboard Modules

### Module 1: Position River (Spaghetti Chart)

**Data:** `LapSeries` (pre-computed, instant)

**What it shows:** All 20 drivers' positions lap-by-lap as flowing lines. Click any line to highlight a driver. Hover for gap data.

**Why it's unique:** The most shared F1 chart on Reddit, but no interactive version exists covering 2018–2026. `LapSeries` provides pre-computed position data — no processing needed.

**Overlays:**
- Track status bar (green/yellow/VSC/SC/red) from `SessionData.StatusSeries`
- Pit stop markers from `PitStopSeries`

### Module 2: Overtake Map

**Data:** `OvertakeSeries` + `LapSeries`
**Pitwall enrichment:** `detect_overtakes` (position-change-based) + `compare_grid_to_finish` (grid-vs-finish delta)

**What it shows:**
- Bar chart: overtakes per driver per race
- Heatmap: which laps have the most position changes (Lap 1, post-pit, SC restart)
- Season leaderboard: most overtakes per driver across all races
- Circuit comparison: which tracks produce the most overtaking
- **NEW — Grid vs Finish:** scatter plot showing starting position vs finishing position per driver (who gains the most on race day?)

**Why it's unique:** First tool to use F1's official overtake data. Everyone else infers overtakes from position changes (which counts pit stops as "overtakes"). `compare_grid_to_finish` adds a "race day movers" dimension.

### Module 3: Weather Impact Engine

**Data:** `WeatherDataSeries` + `TimingData` (lap times)

**What it shows:**
- Scatter plot: track temperature vs fastest lap across all races since 2018
- Time series: temperature changes during a race overlaid with lap time evolution
- Rain effect: lap time delta when rainfall starts (per driver — who's the best rain driver?)
- Tyre deg by temperature: how compound degradation changes with track temp
- Circuit climate profiles: temperature/humidity patterns per track over 7 years

**Why it's unique:** 163K+ weather data points (148 samples/race × 1100+ sessions). Nobody has done weather-to-performance correlation analysis.

### Module 4: Championship Momentum

**Data:** `ChampionshipPrediction` (streamed during race)

**What it shows:**
- Line chart showing how WDC/WCC projected standings shifted lap-by-lap during each race
- "Swing moments" — the laps where championship predictions changed most dramatically
- Season view: overlay championship projections from every race

**Why it's unique:** `ChampionshipPrediction` is fetched by FastF1 but never analyzed by any project. Shows the narrative inside each race — "Hamilton was projected WDC leader on Lap 30 but dropped after the pit stop."

### Module 5: Strategy Scorecard

**Data:** `TyreStintSeries` + `LapSeries` + `PitStopSeries`
**Pitwall enrichment:** `compare_strategies`, `get_stint_analysis`, `compare_tire_compounds`, `compare_tire_age_performance`, `analyze_starting_tires`

**What it shows:**
- Strategy timeline: horizontal bars per driver showing compound stints
- Positions gained/lost: did the strategy work? Grade A-F
- Undercut/overcut detection: who benefited from pit timing?
- Strategy comparison: pick any two drivers, overlay their stints
- Season trends: which team makes the best strategy calls?
- **NEW — Compound performance:** avg lap time per compound across all drivers (which tyre was fastest?)
- **NEW — Tyre degradation curves:** fresh vs used tyre lap time delta per driver (who manages tyres best?)
- **NEW — Starting tyre analysis:** which compound did each driver start on, and did it correlate with race outcome?

**Why it's unique:** Everyone shows stint bars. Nobody grades strategy effectiveness, shows degradation curves per driver, or tracks strategic success rate across a season.

### Module 6: Pit Crew Leaderboard

**Data:** `PitStopSeries` + `PitLaneTimeCollection`

**What it shows:**
- Team rankings: avg stationary time, avg pit lane time (separate metrics)
- Season evolution: how each team's pit times changed race-by-race (crew improvement visible)
- Consistency score: std deviation of pit times per team
- Cross-season trends: pit crew performance 2018→2026
- Fastest stops: all-time and per-season records

**Why it's unique:** `PitLaneTimeCollection` gives pit entry → stationary → pit exit breakdown. Nobody has this granularity.

### Module 7: Mini-Sector Battle Map

**Data:** `TimingStats` (segments array = ~25 mini-sectors per driver)
**Pitwall enrichment:** `get_circuit_info` (corner positions + DRS zones), `compare_sector_times`, `analyze_brake_points`

**What it shows:**
- Track diagram color-coded by which driver is fastest in each mini-sector
- Side-by-side: compare two drivers' mini-sector times
- Where time is gained/lost at 10x the resolution of the standard 3-sector view
- **NEW — Corner annotations:** overlay corner numbers and DRS zones from `get_circuit_info` onto the track diagram
- **NEW — Braking analysis:** show braking points per corner for selected driver (where they brake late/early vs rivals)

**Why it's unique:** `TimingStats` contains ~25 mini-sector segments per driver. Every existing tool only shows 3 sectors. This is 10x the resolution. `get_circuit_info` provides corner and DRS zone positions to annotate the diagram.

### Module 8: Race Control Timeline

**Data:** `RaceControlMessages` + `TrackStatus` + `SessionData`
**Pitwall enrichment:** `get_penalties`, `get_deleted_laps`

**What it shows:**
- Visual timeline of all flags, penalties, investigations, SC/VSC deployments
- Filterable by category: flags, penalties, safety car, steward decisions
- Impact analysis: how each flag/SC affected gaps (overlaid with position data)
- **NEW — Penalty breakdown:** structured penalty data (time penalties, grid drops, reprimands) per driver per race
- **NEW — Track limits tracker:** deleted laps per driver per session — who pushes boundaries most?

**Why it's unique:** Several tools show race control messages as a list. Nobody visualizes them as a timeline overlaid with position/gap data. Track limits data from `get_deleted_laps` is completely untapped.

### Module 9: Driver Consistency Profile (NEW)

**Data:** Pitwall `analyze_lap_consistency` + `get_lap_times_fastf1` + `analyze_long_run_pace`

**What it shows:**
- Consistency score per driver: standard deviation of lap times (excluding pit/SC laps)
- Season ranking: most consistent drivers across all races
- Long-run pace analysis: average pace on stint laps 5–15 (true race pace, not qualifying trim)
- Consistency vs speed quadrant: plot consistency (Y) against average pace (X) — top-right = fast AND consistent
- Per-race consistency evolution: did a driver get more consistent as the season progressed?

**Why it's unique:** Raw feeds don't compute consistency metrics. Pitwall's `analyze_lap_consistency` provides std deviation and variation scoring. `analyze_long_run_pace` is a practice-session analysis tool that no existing F1 dashboard surfaces. Combined, this answers "who is the most metronomic driver?" — a question F1 engineers care about but fans never see.

### Module 10: Qualifying Deep Dive (NEW)

**Data:** Pitwall `get_qualifying_progression` + `get_deleted_laps` + `compare_sector_times` + `get_fastest_sectors`

**What it shows:**
- Q1 → Q2 → Q3 progression: who was eliminated and by how much
- Deleted laps impact: how many drivers had laps deleted that would have changed elimination
- Sector dominance: who was fastest in each sector across qualifying
- Head-to-head: teammate qualifying comparison across the season
- Pole position margin trend: how the gap from P1 to P2 has changed over time at each circuit

**Why it's unique:** Most tools show qualifying results as a flat list. Nobody visualizes the progression through sessions, the impact of deleted laps, or sector-level dominance patterns.

### Module 11: Teammate Battles (NEW)

**Data:** Pitwall `team_head_to_head` + `get_team_laps` + `get_driver_comparison`

**What it shows:**
- Season-long teammate H2H scorecard: qualifying wins, race finish wins, average gap
- Per-race comparison: lap time overlay for both teammates
- Strategy divergence: when teams split strategy between drivers, who benefited?
- "Internal battle" timeline: who led the intra-team fight race-by-race

**Why it's unique:** Teammate comparison is the most direct performance measure in F1 (same car, same conditions). Pitwall's `team_head_to_head` pre-computes this. No existing dashboard provides a season-long interactive teammate tracker.

### Module 12: Speed & Power Analysis (NEW)

**Data:** Pitwall `get_speed_traps` + `get_speed_trap_comparison` + `analyze_rpm_data` + `analyze_drs_usage`

**What it shows:**
- Speed trap leaderboard: top speeds at I1, I2, FL, ST measurement points
- DRS effectiveness: speed gain in DRS zones per car (which teams gain most from DRS?)
- RPM patterns: engine usage characteristics per team (rev ceiling, shift points)
- Season speed evolution: how top speeds changed across the calendar (aero vs power tracks)

**Why it's unique:** Speed traps are shown by a few tools as raw numbers. Nobody correlates DRS usage with speed gain, or tracks RPM patterns to infer engine characteristics. `analyze_drs_usage` and `analyze_rpm_data` are Pitwall-exclusive analyses.

---

## Architecture

### Backend (FastAPI — add to existing `backend/`)

```
backend/app/api/routes/f1.py          # All F1 API endpoints
backend/app/services/f1_fetcher.py    # Static API feed fetcher + cache
backend/app/services/f1_processor.py  # Feed parsing and pre-processing
```

**Endpoints:**
```
# Core (Phase 1–2)
GET /api/f1/seasons                          # Available seasons
GET /api/f1/races?year=2026                  # Races in a season
GET /api/f1/lap-positions?year=2026&race=australia    # LapSeries data
GET /api/f1/overtakes?year=2026&race=australia        # OvertakeSeries data
GET /api/f1/pit-stops?year=2026&race=australia        # PitStopSeries data
GET /api/f1/strategy?year=2026&race=australia         # TyreStintSeries processed
GET /api/f1/race-control?year=2026&race=australia     # RaceControlMessages
GET /api/f1/track-status?year=2026&race=australia     # SessionData.StatusSeries
GET /api/f1/drivers?year=2026&race=australia          # DriverList with team colours

# Extended (Phase 3–4)
GET /api/f1/weather-series?year=2026&race=australia   # WeatherDataSeries data
GET /api/f1/championship-prediction?year=2026&race=australia  # ChampionshipPrediction
GET /api/f1/timing-stats?year=2026&race=australia     # TimingStats with mini-sectors
GET /api/f1/circuit-info?year=2026&race=australia     # Corner positions + DRS zones

# New modules (Phase 5)
GET /api/f1/qualifying?year=2026&race=australia       # Q1/Q2/Q3 progression + deleted laps
GET /api/f1/consistency?year=2026&race=australia      # Lap consistency + long-run pace
GET /api/f1/teammate-battle?year=2026&race=australia  # Intra-team H2H comparison
GET /api/f1/speed-analysis?year=2026&race=australia   # Speed traps + DRS + RPM analysis
GET /api/f1/grid-vs-finish?year=2026&race=australia   # Grid position vs finishing position
GET /api/f1/penalties?year=2026&race=australia         # Structured penalty data
GET /api/f1/deleted-laps?year=2026&race=australia&session=Qualifying  # Track limits violations

# Historical (1950+, via Jolpica)
GET /api/f1/historical/results?year=2026              # Race results
GET /api/f1/historical/standings?year=2026&type=driver # Championship standings
GET /api/f1/historical/winners?race=monaco             # Race winners history
```

**Caching strategy:**
- Fetch from static API on first request
- Cache locally (file-based or SQLite) — data never changes after session completes
- Session path resolution: `{year}/Index.json` → find race → find session → build feed URL

### Frontend (Next.js — add to existing `frontend/`)

```
frontend/app/f1/page.tsx               # Landing page (white paper)
frontend/app/f1/try/page.tsx           # Dashboard entry point
frontend/app/f1/try/[module]/page.tsx  # Individual module pages (optional)
frontend/app/f1/layout.tsx             # Metadata
frontend/lib/api/apps/f1.ts            # F1 API client with types
```

**Chart library:** D3.js (for custom interactive charts) or Recharts/Plotly for rapid prototyping

### Data Flow

```
F1 Static API (free, 32 feeds per session)
         ↓ HTTP fetch
Python backend (parse, decompress .z feeds, normalize)
         ↓ cache to disk/SQLite
FastAPI endpoints (JSON responses)
         ↓ axios
Next.js frontend (D3.js / Recharts charts)
```

**Cost: $0 for data, $0 for LLM, existing Render hosting**

### Development Workflow with Pitwall MCP

```
1. PROTOTYPE: Call Pitwall MCP tools to get real data shapes for any race
   Example: mcp__pitwall__get_lap_times(year=2025, race="monaco")

2. VALIDATE: Compare Pitwall output against raw static API feed schemas
   Use get_race_info to see available feeds for a session

3. BUILD: Write f1_fetcher.py to replicate the same data pipeline
   Pitwall shows you the target output format

4. TEST: Compare backend endpoint output against Pitwall tool output
   They should return equivalent data
```

**Pitwall as reference implementation:** For every backend endpoint we build, there's a corresponding Pitwall tool that already returns processed data. Use it to validate our parsing is correct.

---

## Competitive Landscape Summary

### Existing Tools (30+ researched)

| Tool | Stars/Users | What It Does | What It Doesn't Do |
|---|---|---|---|
| **TracingInsights** | Large user base | 30+ chart types, 2018–2026 | No overtake data, no weather correlation, no mini-sectors, no championship prediction |
| **BoardF1** | Active | Results, strategy, pace | No telemetry, no real-time, limited depth |
| **f1-race-replay** | 5.3k stars | Desktop race replay with positions | Desktop only, no web, no analytics |
| **f1-dash** | 1.8k stars | Live timing web dashboard | Maintenance mode, GPS degraded since F1 paywall |
| **F1 Analytix** | Deployed | Monte Carlo sim, 3D track | Solo dev, sustainability unclear |
| **Undercut-F1** | 872 stars | Terminal live timing | Terminal only, no web UI |
| **MultiViewer** | Large | Multi-stream sync + overlays | Requires F1 TV sub, closed source |
| **OpenF1** | 1.3k stars | REST API (2023+) | API only, no consumer UI, paid for live |
| **F1 TV Pro** | Official | Live streaming + data channel | View-only, no analytics, not interactive |
| **AWS Insights** | Official | Broadcast graphics | Broadcast-only, non-interactive, director-controlled |

### What Nobody Does

**From untapped static API feeds:**
1. Uses `OvertakeSeries` for overtake analysis (everyone guesses from position changes)
2. Correlates `WeatherDataSeries` with lap performance (163K data points untouched)
3. Visualizes `ChampionshipPrediction` lap-by-lap swings
4. Shows `TimingStats` mini-sectors (~25 segments vs standard 3)
5. Breaks down pit lane timing from `PitLaneTimeCollection`
6. Uses `LapSeries` for instant position-per-lap charts (pre-computed)
7. Grades strategy effectiveness with A-F scores
8. Tracks pit crew improvement trends across seasons

**From Pitwall-style processed analysis (new opportunities):**
9. Lap consistency scoring with std deviation ranking across drivers/season
10. Long-run pace analysis from practice sessions (true race pace predictor)
11. DRS effectiveness per car (speed delta in DRS zones — infers aero efficiency)
12. RPM pattern analysis per team (engine usage characteristics, shift points)
13. Deleted laps / track limits tracker per driver per session
14. Tyre degradation curves: fresh vs used lap time delta per driver
15. Grid-to-finish position delta as a "race craft" metric
16. Qualifying session progression visualization (Q1→Q2→Q3 flow)
17. Teammate head-to-head season tracker with pace gaps

---

## Build Priority

| Phase | Modules | Why First |
|---|---|---|
| **Phase 1** | Position River + Overtake Map | Highest visual impact, uses 2 untapped feeds, simplest data processing |
| **Phase 2** | Strategy Scorecard + Pit Crew Leaderboard | Fan-favorite topics, unique grading system, enriched with Pitwall's degradation/compound analysis |
| **Phase 3** | Weather Impact Engine + Championship Momentum | Deep analysis, 163K data points, most unique |
| **Phase 4** | Mini-Sector Battle Map + Race Control Timeline | Requires track diagram rendering, most complex. Circuit info from Pitwall simplifies track rendering |
| **Phase 5** | Driver Consistency + Qualifying Deep Dive + Teammate Battles + Speed & Power | Pitwall-enabled modules — rely on pre-computed analyses (consistency scoring, H2H, RPM/DRS) that don't exist in raw feeds |

---

## Backend Dependencies (add to requirements.txt)

```
requests>=2.31.0        # HTTP client for static API
```

No additional deps needed — the static API returns JSON. Compressed feeds (CarData.z, Position.z) need `base64` + `zlib` (both stdlib). Caching can use filesystem or stdlib `sqlite3`.

## Frontend Dependencies (add to package.json)

```
d3                      # Interactive charts
@types/d3               # TypeScript types for D3
```

Or for faster prototyping:
```
recharts                # React chart components (simpler than raw D3)
```

---

## Key Design Decisions

1. **No LLM costs** — all analysis is deterministic data processing
2. **File-based caching** — static API data never changes after session; cache aggressively
3. **Brutalist design** — matches existing apps-darshjoshi design system (black/white, monospace, 2px borders)
4. **Session path resolution** — use `{year}/Index.json` to discover race paths, then construct feed URLs
5. **Progressive enhancement** — start with LapSeries + OvertakeSeries (simplest), add complex feeds later
6. **Mobile responsive** — charts must work on phone screens (fans watch races on mobile)
7. **Pitwall as development oracle** — use Pitwall MCP tools during development to validate data shapes, test edge cases, and prototype visualizations before writing backend parsers. The backend must ultimately fetch from static API directly (not depend on Pitwall at runtime)
8. **FastF1-equivalent processing** — Phase 5 modules require processed data (consistency scoring, degradation curves, RPM analysis) that mirror what FastF1 computes. Either install FastF1 as a backend dependency or reimplement the relevant computations. Pitwall's tool outputs define the target data shapes
9. **12 modules, not 8** — Pitwall analysis capabilities justify 4 additional modules (Consistency, Qualifying, Teammate Battles, Speed & Power) that provide unique insights no competitor offers
