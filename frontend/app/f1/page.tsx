import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AppLayout';

const dashboards = [
  {
    id: 'position-river',
    name: 'Position River',
    tag: 'UNTAPPED DATA',
    description: 'All 20 drivers\' positions lap-by-lap as flowing lines. The most shared F1 chart on Reddit — now interactive, covering 2018–2026.',
    data: 'LapSeries (pre-computed, zero users worldwide)',
  },
  {
    id: 'overtake-map',
    name: 'Overtake Map',
    tag: 'WORLD\'S FIRST',
    description: 'Official overtake data from F1\'s OvertakeSeries feed. Everyone else guesses from position changes — we use the real data.',
    data: 'OvertakeSeries (zero users worldwide)',
  },
  {
    id: 'strategy-scorecard',
    name: 'Strategy Scorecard',
    tag: 'UNIQUE ANALYSIS',
    description: 'Tyre strategy timelines, compound stints, and strategy effectiveness grades. See which teams make the best calls.',
    data: 'TyreStintSeries + PitStopSeries',
  },
  {
    id: 'pit-crew',
    name: 'Pit Crew Leaderboard',
    tag: 'GRANULAR DATA',
    description: 'Team rankings by stationary time AND pit lane time. Track pit crew improvement across the season.',
    data: 'PitStopSeries + PitLaneTimeCollection',
  },
  {
    id: 'weather-impact',
    name: 'Weather Impact Engine',
    tag: '178 SAMPLES/RACE',
    description: 'Track temperature vs lap time correlation. Rain impact analysis. 163K+ weather data points nobody has analyzed.',
    data: 'WeatherDataSeries (zero users worldwide)',
  },
  {
    id: 'championship-momentum',
    name: 'Championship Momentum',
    tag: 'UNTAPPED DATA',
    description: 'Live WDC/WCC projected standings. See how championship predictions shifted during each race.',
    data: 'ChampionshipPrediction (zero users worldwide)',
  },
  {
    id: 'speed-traps',
    name: 'Speed & Power',
    tag: 'DEEP ANALYSIS',
    description: 'Speed trap readings at 4 measurement points. Compare top speeds, identify power vs downforce tracks.',
    data: 'TimingData.Speeds (I1, I2, FL, ST)',
  },
  {
    id: 'race-control',
    name: 'Race Control Timeline',
    tag: '113+ MSGS/RACE',
    description: 'Visual timeline of all flags, penalties, safety cars. Filterable by category with track status overlay.',
    data: 'RaceControlMessages + TrackStatus',
  },
  {
    id: 'head-to-head',
    name: 'Driver Head-to-Head',
    tag: 'COMPARE ANY TWO',
    description: 'Compare any two drivers — position, pace, strategy, pit stops. Side-by-side deep comparison.',
    data: 'Multiple feeds combined',
  },
  {
    id: 'grid-vs-finish',
    name: 'Grid vs Finish',
    tag: 'RACE CRAFT',
    description: 'Who gains the most on race day? Starting position vs finishing position with positions gained/lost.',
    data: 'TimingData + DriverRaceInfo',
  },
  {
    id: 'timing-stats',
    name: 'Timing Deep Dive',
    tag: 'MINI-SECTORS',
    description: 'Personal best laps, sector rankings, speed data. ~25 mini-sector segments vs the standard 3.',
    data: 'TimingStats (mini-sectors unexploited)',
  },
  {
    id: 'history',
    name: 'Historical Records',
    tag: 'SINCE 1950',
    description: 'Race results and championship standings from 1950 to present. 75+ years of F1 history.',
    data: 'Jolpica API (Ergast replacement)',
  },
];

export default function F1Landing() {
  return (
    <AppLayout appName="F1 EVERYTHING">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="border-2 border-black p-6 bg-white">
          <div className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-xs font-mono font-bold mb-4">
            DATA NOBODY ELSE USES
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-4xl font-bold">
              <span className="inline-block border-b-4 border-black pb-1">F1 Everything</span>
            </h1>
            <Link href="/f1/dashboard">
              <button className="px-6 py-3 border-2 border-black bg-black text-white font-mono font-bold hover:bg-white hover:text-black transition-colors">
                OPEN DASHBOARD →
              </button>
            </Link>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              F1 broadcasts 33 data feeds per session — live timing, telemetry, tyre compounds,
              pit stops, weather, race control messages, and more. Most F1 analytics tools use
              fewer than 10 of these feeds. <strong>5 feeds have zero users worldwide.</strong>
            </p>
            <p>
              F1 Everything is the first tool to use <strong>all of them</strong>. OvertakeSeries
              gives you official overtake counts (everyone else guesses from position changes).
              WeatherDataSeries provides 178 weather samples per race (nobody correlates this with
              lap performance). ChampionshipPrediction shows live WDC/WCC projections (fetched by
              FastF1 but never analyzed by any project).
            </p>
            <p>
              12 interactive dashboards. 2018–2026 coverage. Historical data back to 1950.
              Zero LLM costs — all analysis is deterministic data processing from F1&apos;s free
              static API. This is data-driven F1 analysis that makes you smarter than the TV commentary.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '33', label: 'DATA FEEDS PER SESSION' },
            { value: '5', label: 'FEEDS NOBODY ELSE USES' },
            { value: '163K+', label: 'WEATHER DATA POINTS' },
            { value: '1950', label: 'HISTORICAL DATA SINCE' },
          ].map((stat) => (
            <div key={stat.label} className="border-2 border-black p-4 bg-white text-center">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs font-mono font-bold text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Available Dashboards */}
      <section className="mb-12">
        <div className="border-2 border-black p-6 bg-white">
          <h2 className="text-3xl font-bold mb-6">12 Dashboards</h2>
          <p className="text-sm text-gray-600 mb-8">
            Each dashboard uses different combinations of F1&apos;s 33 data feeds.
            Select any race from 2018–2026 and explore.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboards.map((d) => (
              <div key={d.id} className="border-2 border-gray-300 p-4 hover:border-black transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{d.name}</h3>
                  <span className="px-2 py-0.5 bg-black text-white text-xs font-mono font-bold whitespace-nowrap ml-2">
                    {d.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{d.description}</p>
                <div className="text-xs font-mono text-gray-400">DATA: {d.data}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                STEP 1
              </div>
              <h3 className="text-lg font-bold mb-2">Pick a Race</h3>
              <p className="text-sm text-gray-700">
                Select any season (2018–2026) and race weekend. Every session is available —
                Practice, Qualifying, Sprint, Race.
              </p>
            </div>
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                STEP 2
              </div>
              <h3 className="text-lg font-bold mb-2">Choose a Dashboard</h3>
              <p className="text-sm text-gray-700">
                12 dashboards, each showing different aspects of the race. Position battles,
                strategy breakdowns, weather impact, speed analysis, and more.
              </p>
            </div>
            <div className="border-l-4 border-black pl-6">
              <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2">
                STEP 3
              </div>
              <h3 className="text-lg font-bold mb-2">Explore the Data</h3>
              <p className="text-sm text-gray-700">
                Interactive charts with hover details, filtering, and comparisons.
                Data that makes TV commentary feel basic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Nobody Else Does */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white">
          <h2 className="text-3xl font-bold mb-6">What Nobody Else Does</h2>
          <div className="space-y-3">
            {[
              'Uses OvertakeSeries for official overtake analysis (everyone else guesses)',
              'Correlates 163K+ weather data points with lap performance',
              'Visualizes live championship prediction swings lap-by-lap',
              'Grades strategy effectiveness with position-change analysis',
              'Tracks pit crew improvement trends across entire seasons',
              'Shows pre-computed lap positions (zero processing needed)',
              'Breaks down pit lane entry → stationary → exit timing',
              'Compares starting grid to finishing positions with delta scoring',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mt-0.5 shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-12">
        <div className="border-2 border-black p-8 bg-white text-center">
          <h2 className="text-3xl font-bold mb-4">See the Data Nobody Shows You</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-lg mx-auto">
            Free. No login. No API keys. Just F1 data processed and visualized
            in ways no other tool does.
          </p>
          <Link href="/f1/dashboard">
            <button className="px-8 py-4 border-2 border-black bg-black text-white font-mono font-bold text-lg hover:bg-white hover:text-black transition-colors">
              OPEN DASHBOARD →
            </button>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}
