# F1 Live — Real-Time iOS App Spec

> **Status:** Requirements / concept. No code yet. This is the living source of truth for the *live* F1 product, the real-time sibling to the static analytics dashboard in `f1-dashboard-spec.md`.

## What This Is

A **native iOS command center** that streams a live F1 session (Practice, Qualifying, Sprint, Sprint Quali, Race) in real time — centered on a personal **driver watchlist**, with proactive **push alerts** for the moments that matter, and eventually a **Dynamic Island / lock-screen Live Activity** that updates while the phone is in your pocket.

**One line:** *Glance at your phone, see the race move — and get buzzed the instant something matters to your drivers.*

This is a **personal app** (built for the owner first; ship publicly only if it proves itself), so it deliberately skips App Store review, F1 data licensing, and multi-user push scale for v1.

## Relationship to the Static `/f1` Dashboard

| | Static `/f1` dashboard (`f1-dashboard-spec.md`) | **F1 Live (this doc)** |
|---|---|---|
| Purpose | Study a race *afterwards* | Follow a session *as it happens* |
| Data source | F1 **static/archive** API (`/static/...`) | F1 **SignalR live** feed (`/signalr`) |
| Data philosophy | Fetch once, **cache forever** (immutable) | **Nothing cached** — stream "what's true now" |
| Client | Web (Next.js + D3) | **Native iOS (SwiftUI)** |
| Shape | Request → fetch → render charts | Long-running stateful connection → snapshot + deltas |

**Decision:** Live is **THE current focus**; the 12-module static web dashboard is **on hold**. The live engine is built first. Later synergy: the static spec's Module 4 (Championship Momentum, *"streamed during race"*) could be fed by this same live engine — **one live engine, two clients** — but that's not in scope now.

## Confirmed Decisions (brainstorm results)

| Decision | Choice |
|---|---|
| Primary live surface | Full app first; Live Activity / Dynamic Island as a later phase |
| Data backbone | The owner's own stack — port pitwall's SignalR client into the apps-darshjoshi backend |
| App stack | **Native SwiftUI** (ActivityKit is Swift-native; the widget is the endgame) |
| Data transport | Streaming (WebSocket/SSE), "as good as it gets" |
| Live config | **Full custom dashboard builder** (recommended to *sequence* — cards first, grid later) |
| Audience | Personal now; ship if it's good |
| Feed connection | **Always-on during every session**, auto-driven by the F1 schedule |
| Data scope | **Everything live, including telemetry + GPS track map** (platform forces a two-tier split — see below) |
| Personalization | **Watchlist** — a custom set of pinned drivers across teams, highlighted everywhere they appear |
| Alerts | **Full suite** — session start, flags/SC, watchlist-driver events, race milestones |
| Session end | **Final results summary, then idle** |
| Repo structure | **Separate iOS repo**; live backend added as a module to apps-darshjoshi (reuses Render always-on) |

## Data Source: F1 SignalR Live Feed

The live source is F1's **SignalR push feed** (`https://livetiming.formula1.com/signalr`), distinct from the static archive used by the web dashboard. It sends an **initial state snapshot** on subscribe, then a continuous stream of **deltas**.

**The hard part is already built — in `pitwall/`:**
- `signalr_client.py` — speaks the live SignalR protocol
- `auth_setup.py` — connection negotiation/auth
- `decompressor.py` — inflates the compressed `.z` feeds (`CarData.z`, `Position.z`: base64 + raw deflate)
- `merger.py` — merges deltas into a current merged state
- `topics.py` — the feed/topic catalog (enables **selective subscription**)

**Design principle (inherited from the static spec, #7):** the backend must **not depend on pitwall at runtime**. So the SignalR client logic is **ported into the apps-darshjoshi backend** as a long-running module; pitwall remains the **dev-time oracle** for validating data shapes.

## Architecture

```
F1 SignalR live feed ──(snapshot + deltas)──▶ apps-darshjoshi backend (FastAPI · Render · always-on, 512MB)
   • session-watcher:  reads the F1 schedule, connects ~5 min before a session, disconnects at "Finalised"
   • live state:       holds the current merged race state in memory (ports pitwall's signalr pipeline)
   • lazy topics:      subscribes to HEAVY topics (CarData/Position) only when a client's telemetry view is open
   • event engine:     detects alert-worthy moments from the delta stream
        │  WebSocket (snapshot-on-connect, then deltas)        │  APNs push (alerts; later: Live Activity updates)
        ▼                                                       ▼
   iOS SwiftUI app  ◀───────────────────────────────────────  (push reaches the phone even when app is closed)
```

### Backend live engine (new, bolted onto the existing FastAPI app)
- **Session-watcher loop** — uses the F1 schedule (pitwall `get_schedule` / Jolpica) to auto-connect/disconnect per session. This is what makes "always-on during every session" real.
- **Stateful connection** — one SignalR connection per live session (F1 only ever runs one session at a time → no concurrency).
- **In-memory current state** — merged snapshot so a phone connecting mid-race gets the full picture immediately, then deltas.
- **Lazy heavy-topic subscription** — keep idle connections cheap on the 512MB box; subscribe to `CarData.z`/`Position.z` only when telemetry is actually being viewed.
- **Event engine** — watches deltas, emits alerts, calls APNs.

### Transport
- **WebSocket** from backend → app: snapshot-on-connect, then deltas. SwiftUI consumes via `URLSessionWebSocketTask`.
- **Auth:** reuse the platform's `X-API-Key` pattern (or a token) on the WebSocket handshake. Single user → simple.

### iOS client
- **SwiftUI**, native. Live dashboard + (later) ActivityKit Live Activity.
- Watchlist + dashboard layout persisted locally (e.g. `UserDefaults`/SwiftData) — single user, no server-side prefs needed.

## Repository Structure

**Two repos, split by toolchain — not a monorepo.** The app↔backend link is a network API (WebSocket + REST), not shared code, and Swift/Python share nothing importable, so co-location buys nothing.

```
apps-darshjoshi/  (existing web platform repo — Netlify + Render)
  backend/app/api/routes/f1_live.py     # net-new live router/module
  backend/app/services/f1_live/...      # ported SignalR pipeline, session-watcher, event engine
  f1-live-spec.md                       # this doc (lives here)

f1-live-ios/  (NEW separate repo — Xcode/Swift)
  SwiftUI app, ActivityKit Live Activity, Xcode-native .gitignore
  ships via TestFlight / App Store Connect (independent of Netlify/Render)
```

**Why split:** disjoint toolchains (Xcode/TestFlight vs Next.js-uvicorn/Netlify-Render), avoids triggering irrelevant web deploys on iOS commits, keeps the web platform's repo identity clean.

**Contract-drift mitigation (the one cost of two repos):** treat the backend's auto-generated **OpenAPI schema** (`/api/docs`) + a documented WebSocket message schema as the single contract; generate Swift models from it so the app's types track the backend.

**Backend placement:** stays in apps-darshjoshi to reuse the always-on Render box. Flag for later: if the always-on SignalR loop starts straining the shared 512MB, split the live backend into its own service (the "three repos" option) — not needed now.

## The Two Data Tiers (platform-forced)

"Everything live" splits into two tiers **by physics, not preference**:

### Tier A — light, always-on, push-survivable → *future Live Activity content*
Positions · gaps/intervals · tyres & stints · pit activity · sectors/mini-sectors · race control (flags/SC/penalties) · weather · session clock / lap count · live championship projection.
Small payloads, low frequency. **This is the layer that can keep updating in the Dynamic Island when the app is closed.**

### Tier B — heavy, foreground-only
`CarData.z` (speed/RPM/throttle/brake/gear/DRS @ ~4Hz × 20 cars) + `Position.z` (GPS @ ~4Hz × 20 cars) ≈ ~160 msg/sec.
**Cannot live in a Live Activity** (Apple won't push at 4Hz, and the battery cost is brutal). Streams **only while the app is open and the telemetry/track-map view is active**. A 20-dot track map animating at 4Hz for a 2-hour race will warm the phone — that's the cost of the cool factor, accepted deliberately.

**512MB survival rules:** keep only *current* values + **bounded ring buffers** (e.g. last ~30s for a live speed trace). Never retain full-session history in memory.

## Live Dashboard — Card Catalog

The dashboard composes from modular cards. Each maps to live feed data (feed names per `f1-dashboard-spec.md`):

| Card | Tier | Live feed(s) |
|---|---|---|
| Leaderboard (pos, gaps, intervals) | A | `TimingData`, `DriverRaceInfo` |
| Watchlist strip (pinned drivers: pos / gap / last lap / tyre) | A | derived from above + `TimingAppData` |
| Tyres & Stints | A | `TimingAppData`, `CurrentTyres`, `TyreStintSeries` |
| Pit activity | A | `PitStop`, `PitLaneTimeCollection` |
| Race-control timeline (flags/SC/VSC/penalties) | A | `RaceControlMessages`, `TrackStatus` |
| Sectors / mini-sectors | A | `TimingData`, `TimingStats` |
| Speed traps | A | `TimingData` speeds, `TimingStats.BestSpeeds` |
| Weather | A | `WeatherData` |
| Session clock / lap count | A | `ExtrapolatedClock`, `LapCount`, `SessionStatus` |
| Championship momentum (live projection) | A | `ChampionshipPrediction` |
| Telemetry trace | **B** | `CarData.z` |
| Live track map (moving cars) | **B** | `Position.z` + circuit info |

**Phasing note:** v1 ships these as **toggle + reorder cards** (a vertical stack). The **full drag-resize grid builder** is built *on top of* the same card system in a later phase — start simple, earn the grid.

**Session-awareness:** card behavior adapts per session type — Quali shows Q1/Q2/Q3 segments + elimination zone; Race shows leader gap / lap count / pit windows; Practice emphasizes long-run pace. The builder should support per-session-type layouts.

## Personalization — Watchlist

- A custom set of **pinned drivers across any teams** (not a single driver, not one team).
- Watchlisted drivers are **visually highlighted wherever they appear** (leaderboard rows, sector battles, pit activity, etc.).
- A dedicated **Watchlist strip** pins their key stats up top.
- The watchlist also **drives notifications** ("my driver events" = any watchlisted driver).

## Notifications & Alerts

**Delivery:** to reach the phone when the app is **closed**, the backend's event engine detects events and **pushes via APNs**. This pulls APNs setup (Apple Developer account + push key + device-token registration) into **v1** — but regular push notifications are the *easy* end of the push spectrum, and they lay the exact groundwork the Live Activity needs later. So the widget becomes a smaller leap, not a from-scratch effort.

**Event → feed mapping** (almost all are stated outright by the feed; only watchlist overtake needs derivation):

| Alert | Source | Complexity |
|---|---|---|
| Session start / "starting soon" | F1 schedule | Easy |
| Lights out | `SessionStatus` / `RaceControlMessages` | Easy |
| Flags / SC / VSC / red flag | `TrackStatus`, `RaceControlMessages` | Easy |
| Penalty (watchlist or any) | `RaceControlMessages` | Easy |
| Watchlist driver pits | `PitStop`, `TimingAppData` | Easy |
| Fastest lap | `TimingData` / `TimingStats` | Easy |
| Watchlist driver DNF | `DriverRaceInfo.IsOut` / race-control retirement | Easy–medium |
| Watchlist driver overtake / position change | position deltas (or `OvertakeSeries`) | **Medium (derive)** |
| Race milestones (podium settling, chequered) | `SessionStatus`, `TopThree` | Easy |

## App States & Lifecycle UX

The state machine is the UX backbone:

1. **No live session** (between race weekends) — next-session countdown + weekend schedule + last result.
2. **Pre-session** (within ~30 min) — countdown, current/expected weather, session info, "starting soon."
3. **Live** — the dashboard.
4. **Post-session** — final results summary + key stats, then **quietly idle** until the next session.

### Connection & staleness states (must exist on every live view)
`connecting` · `live (fresh)` · **`stale — "data 8s old"`** · `reconnecting` · `feed down`. The owner is never left guessing whether what's on screen is current.

## Build Phases

Sequenced so **live data is never blocked by the layout engine**:

| Phase | Deliverable | Note |
|---|---|---|
| **0** | Backend live engine: SignalR port + session-watcher + in-memory state + WebSocket (snapshot+deltas) | Nothing is visible until this exists |
| **1** | SwiftUI app: Tier A dashboard as **toggle+reorder cards**, connection/staleness states, results-then-idle | The first "I can see the race" moment |
| **2** | Push notifications (APNs) — the full alert suite | Lays the push groundwork the widget reuses |
| **3** | Tier B — live telemetry + moving track map (foreground-only) | The geek-out layer |
| **4** | **Full custom dashboard builder** (drag-resize grid) on top of the card system | Recommended to land here, not in Phase 1 |
| **5** | Live Activity / Dynamic Island | Reuses Phase-2 APNs infra |

## Open Questions / Risks

- **Feed fragility (top risk):** the SignalR feed is unofficial/reverse-engineered — F1 can change it and break the app mid-season. Personal use lowers stakes; this risk is already carried via pitwall.
- **Feed auth:** confirm exactly what `auth_setup.py` needs (negotiate token / cookies) to sustain a live connection *from Render*, not just from a laptop.
- **512MB ceiling:** telemetry must use bounded ring buffers; watch memory during a live race.
- **Background reality:** Tier B dies when the app backgrounds — by design; the widget covers the "pocket" case with Tier A only.
- **Time sync:** use `ExtrapolatedClock` for an accurate "time remaining," not the device clock.
- **Latency target:** "a few seconds behind broadcast" is acceptable (often *ahead* of a delayed stream). Prioritize freshness over completeness.
- **Device:** Dynamic Island needs iPhone 14 Pro or newer; lock-screen Live Activities work more broadly. *(Confirm the owner's model.)*

## Prerequisites & Costs

- **Apple Developer Program — $99/yr** (gates push notifications + Live Activities). Free sideloading works for the basic app, but not for the widget/push dream.
- **Mac + Xcode** — already available (darwin).
- **Render** — already $7/mo Starter Plus, always-on (good: no cold starts for the live connection).
- **APNs key** setup for push.

## Reuse Map (what already exists vs. what's net-new)

| Need | Status |
|---|---|
| SignalR live protocol client | ✅ `pitwall/signalr_client.py` (port into backend) |
| Feed decompression (`.z`) | ✅ `pitwall/decompressor.py` |
| Delta merge → current state | ✅ `pitwall/merger.py` |
| Topic/feed catalog | ✅ `pitwall/topics.py` |
| Connection auth | ✅ `pitwall/auth_setup.py` (verify Render compatibility) |
| Always-on FastAPI host | ✅ Render Starter Plus |
| Schedule data | ✅ pitwall `get_schedule` / Jolpica |
| Session-watcher scheduler | ❌ net-new |
| WebSocket stream endpoint | ❌ net-new |
| Event-detection engine | ❌ net-new (mostly easy per mapping above) |
| APNs push integration | ❌ net-new |
| SwiftUI app + dashboard | ❌ net-new |
| ActivityKit Live Activity | ❌ net-new (Phase 5) |
