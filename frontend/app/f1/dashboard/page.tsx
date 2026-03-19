'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { f1API } from '@/lib/api/apps/f1';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell,
  AreaChart, Area,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Race { name: string; location: string; country: string; }
interface Season { year: number; events: number; }

type DashboardTab =
  | 'results' | 'positions' | 'overtakes' | 'strategy' | 'pit-stops'
  | 'weather' | 'championship' | 'speed' | 'race-control' | 'head-to-head'
  | 'grid-finish' | 'history';

const TABS: { id: DashboardTab; label: string; }[] = [
  { id: 'results', label: 'RESULTS' },
  { id: 'positions', label: 'POSITION RIVER' },
  { id: 'overtakes', label: 'OVERTAKES' },
  { id: 'strategy', label: 'STRATEGY' },
  { id: 'pit-stops', label: 'PIT STOPS' },
  { id: 'speed', label: 'SPEED TRAPS' },
  { id: 'weather', label: 'WEATHER' },
  { id: 'championship', label: 'CHAMPIONSHIP' },
  { id: 'race-control', label: 'RACE CONTROL' },
  { id: 'head-to-head', label: 'H2H COMPARE' },
  { id: 'grid-finish', label: 'GRID VS FINISH' },
  { id: 'history', label: 'HISTORY' },
];

const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6', 'McLaren': '#FF8000', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Williams': '#64C4FF', 'RB': '#6692FF', 'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
};

function getTeamColor(team: string): string {
  return TEAM_COLORS[team] || '#666666';
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export default function F1Dashboard() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedRace, setSelectedRace] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('results');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load seasons on mount
  useEffect(() => {
    f1API.getSeasons().then(r => {
      setSeasons(r.data.seasons);
    }).catch(() => {});
  }, []);

  // Load races when year changes
  useEffect(() => {
    f1API.getRaces(selectedYear).then(r => {
      const raceList = r.data.races.filter((r: Race) =>
        r.name !== 'Pre-Season Testing' && r.name !== 'Pre-Season Test'
      );
      setRaces(raceList);
      if (raceList.length > 0 && !selectedRace) {
        setSelectedRace(raceList[raceList.length - 1].name);
      }
    }).catch(() => {});
  }, [selectedYear]);

  // Fetch data when race or tab changes
  const fetchData = useCallback(async () => {
    if (!selectedRace) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      let result;
      switch (activeTab) {
        case 'results':
          result = await f1API.getStandings(selectedYear, selectedRace);
          break;
        case 'positions':
          result = await f1API.getLapPositions(selectedYear, selectedRace);
          break;
        case 'overtakes':
          result = await f1API.getOvertakes(selectedYear, selectedRace);
          break;
        case 'strategy':
          result = await f1API.getStrategy(selectedYear, selectedRace);
          break;
        case 'pit-stops':
          result = await f1API.getPitStops(selectedYear, selectedRace);
          break;
        case 'weather':
          result = await f1API.getWeatherSeries(selectedYear, selectedRace);
          break;
        case 'championship':
          result = await f1API.getChampionshipPrediction(selectedYear, selectedRace);
          break;
        case 'speed':
          result = await f1API.getSpeedTraps(selectedYear, selectedRace);
          break;
        case 'race-control':
          result = await f1API.getRaceControl(selectedYear, selectedRace);
          break;
        case 'head-to-head':
          result = await f1API.getStandings(selectedYear, selectedRace);
          break;
        case 'grid-finish':
          result = await f1API.getGridVsFinish(selectedYear, selectedRace);
          break;
        case 'history':
          result = await f1API.getHistoricalStandings(selectedYear);
          break;
      }
      setData(result?.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load data. This feed may not be available for this session.');
    }
    setLoading(false);
  }, [selectedYear, selectedRace, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AppLayout appName="F1 EVERYTHING" backUrl="/f1">
      {/* Race Selector */}
      <section className="mb-6">
        <div className="border-2 border-black p-4 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Year */}
            <div className="flex-shrink-0">
              <label className="block text-xs font-mono font-bold mb-1">SEASON</label>
              <div className="flex flex-wrap gap-1">
                {seasons.map(s => (
                  <button key={s.year} onClick={() => { setSelectedYear(s.year); setSelectedRace(''); }}
                    className={`px-3 py-1.5 border-2 font-mono text-xs font-bold transition-colors ${
                      selectedYear === s.year
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-black hover:border-black'
                    }`}>
                    {s.year}
                  </button>
                ))}
              </div>
            </div>
            {/* Race */}
            <div className="flex-1">
              <label className="block text-xs font-mono font-bold mb-1">GRAND PRIX</label>
              <div className="flex flex-wrap gap-1">
                {races.map(r => (
                  <button key={r.name} onClick={() => setSelectedRace(r.name)}
                    className={`px-3 py-1.5 border-2 font-mono text-xs font-bold transition-colors ${
                      selectedRace === r.name
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-black hover:border-black'
                    }`}>
                    {r.location || r.country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-2 font-mono text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-black hover:border-black'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="border-2 border-black p-6 bg-white min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block px-4 py-2 border-2 border-black bg-black text-white text-sm font-mono font-bold animate-pulse">
                  LOADING DATA...
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block px-4 py-2 border-2 border-black text-sm font-mono font-bold text-red-600">
                  {error}
                </div>
              </div>
            </div>
          )}
          {!loading && !error && data && (
            <>
              {activeTab === 'results' && <ResultsPanel data={data} />}
              {activeTab === 'positions' && <PositionRiverPanel data={data} />}
              {activeTab === 'overtakes' && <OvertakesPanel data={data} />}
              {activeTab === 'strategy' && <StrategyPanel data={data} />}
              {activeTab === 'pit-stops' && <PitStopsPanel data={data} />}
              {activeTab === 'weather' && <WeatherPanel data={data} />}
              {activeTab === 'championship' && <ChampionshipPanel data={data} />}
              {activeTab === 'speed' && <SpeedPanel data={data} />}
              {activeTab === 'race-control' && <RaceControlPanel data={data} />}
              {activeTab === 'head-to-head' && <HeadToHeadPanel data={data} year={selectedYear} race={selectedRace} />}
              {activeTab === 'grid-finish' && <GridFinishPanel data={data} />}
              {activeTab === 'history' && <HistoryPanel data={data} />}
            </>
          )}
        </div>
      </section>
    </AppLayout>
  );
}

// ─── Panel: Results ──────────────────────────────────────────────────────────

function ResultsPanel({ data }: { data: any }) {
  const results = data?.results || [];
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{data?.race_name} {data?.year} — {data?.session_type}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 px-2">POS</th>
              <th className="text-left py-2 px-2">DRIVER</th>
              <th className="text-left py-2 px-2">TEAM</th>
              <th className="text-left py-2 px-2">GAP</th>
              <th className="text-left py-2 px-2">BEST LAP</th>
              <th className="text-left py-2 px-2">PITS</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r: any) => (
              <tr key={r.tla} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-2 font-bold">P{r.position}</td>
                <td className="py-2 px-2">
                  <span className="inline-block w-3 h-3 mr-2" style={{ backgroundColor: `#${r.team_colour}` }} />
                  <span className="font-bold">{r.tla}</span>
                  {r.retired && <span className="ml-2 px-1 bg-red-600 text-white text-xs">RET</span>}
                </td>
                <td className="py-2 px-2 text-gray-600">{r.team}</td>
                <td className="py-2 px-2">{r.gap_to_leader || 'LEADER'}</td>
                <td className="py-2 px-2">{r.best_lap_time}</td>
                <td className="py-2 px-2">{r.pit_stops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Panel: Position River ───────────────────────────────────────────────────

function PositionRiverPanel({ data }: { data: any }) {
  const positions = data?.positions || {};
  const drivers = Object.values(positions) as any[];
  if (drivers.length === 0) return <div className="text-gray-500 font-mono">No position data available for this session.</div>;

  const maxLaps = Math.max(...drivers.map(d => d.positions.length));
  const chartData = Array.from({ length: maxLaps }, (_, i) => {
    const point: any = { lap: i + 1 };
    drivers.forEach(d => { point[d.tla] = d.positions[i]; });
    return point;
  });

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Position River — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">Lap-by-lap positions for all drivers. Lower = better position.</p>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="lap" label={{ value: 'Lap', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 10 }} />
          <YAxis reversed domain={[1, 20]} label={{ value: 'Position', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          {drivers.map(d => (
            <Line key={d.tla} type="monotone" dataKey={d.tla} stroke={`#${d.team_colour}`}
              dot={false} strokeWidth={2} name={d.tla} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-2 mt-4">
        {drivers.map(d => (
          <span key={d.tla} className="flex items-center gap-1 text-xs font-mono">
            <span className="w-3 h-3 inline-block" style={{ backgroundColor: `#${d.team_colour}` }} />
            {d.tla}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Panel: Overtakes ────────────────────────────────────────────────────────

function OvertakesPanel({ data }: { data: any }) {
  const overtakes = data?.overtakes || {};
  const drivers = Object.values(overtakes) as any[];
  const sorted = [...drivers].sort((a, b) => b.total_overtakes - a.total_overtakes);

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Official Overtake Data — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">From F1&apos;s OvertakeSeries feed. First tool ever to use this data.</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sorted} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis dataKey="tla" type="category" width={40} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          <Bar dataKey="total_overtakes" name="Overtakes">
            {sorted.map((d, i) => (
              <Cell key={d.tla} fill={`#${d.team_colour}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Panel: Strategy ─────────────────────────────────────────────────────────

function StrategyPanel({ data }: { data: any }) {
  const strategies = data?.strategies || [];
  const COMPOUND_COLORS: Record<string, string> = {
    SOFT: '#FF3333', MEDIUM: '#FFC700', HARD: '#EEEEEE',
    INTERMEDIATE: '#39B54A', WET: '#0067FF',
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Tyre Strategy — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">Compound stints per driver. Width = stint length in laps.</p>
      <div className="space-y-1.5">
        {strategies.map((s: any) => {
          const totalLaps = s.stints.reduce((sum: number, st: any) => sum + (st.laps || 0), 0);
          return (
            <div key={s.tla} className="flex items-center gap-2">
              <span className="w-8 text-xs font-mono font-bold text-right">P{s.position}</span>
              <span className="w-10 text-xs font-mono font-bold">{s.tla}</span>
              <div className="flex-1 flex h-6 border border-gray-300">
                {s.stints.map((st: any, i: number) => (
                  <div key={i}
                    className="h-full flex items-center justify-center text-xs font-mono font-bold border-r border-white"
                    style={{
                      width: `${totalLaps > 0 ? (st.laps / totalLaps) * 100 : 0}%`,
                      backgroundColor: COMPOUND_COLORS[st.compound] || '#ccc',
                      color: st.compound === 'HARD' ? '#333' : '#fff',
                      minWidth: '20px',
                    }}
                    title={`${st.compound} — ${st.laps} laps${st.new ? ' (New)' : ' (Used)'}`}
                  >
                    {st.laps > 5 ? `${st.compound?.[0]}${st.laps}` : st.compound?.[0]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4">
        {Object.entries(COMPOUND_COLORS).map(([c, color]) => (
          <span key={c} className="flex items-center gap-1 text-xs font-mono">
            <span className="w-4 h-4 border border-gray-300" style={{ backgroundColor: color }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Panel: Pit Stops ────────────────────────────────────────────────────────

function PitStopsPanel({ data }: { data: any }) {
  const stops = data?.pit_stops || [];
  const chartData = stops.slice(0, 20).map((s: any, i: number) => ({
    ...s,
    time: parseFloat(s.pit_stop_time) || 0,
    laneTime: parseFloat(s.pit_lane_time) || 0,
    label: `${s.tla} L${s.lap}`,
  }));

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Pit Stops — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">{stops.length} stops total. Sorted by fastest stationary time.</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fontFamily: 'monospace' }} angle={-45} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 10 }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          <Bar dataKey="time" name="Stationary" fill="#000" />
          <Bar dataKey="laneTime" name="Pit Lane" fill="#999" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Panel: Weather ──────────────────────────────────────────────────────────

function WeatherPanel({ data }: { data: any }) {
  const series = (data?.series || []).map((s: any, i: number) => ({
    ...s,
    index: i,
    air: parseFloat(s.air_temp) || 0,
    track: parseFloat(s.track_temp) || 0,
    humidity: parseFloat(s.humidity) || 0,
    wind: parseFloat(s.wind_speed) || 0,
  }));

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Weather Data — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">{series.length} samples (~60s intervals). Nobody else analyzes this feed.</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="index" tick={{ fontSize: 9 }} label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
          <YAxis tick={{ fontSize: 10 }} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          <Area type="monotone" dataKey="track" name="Track Temp" fill="#FF4444" fillOpacity={0.2} stroke="#FF4444" />
          <Area type="monotone" dataKey="air" name="Air Temp" fill="#4444FF" fillOpacity={0.2} stroke="#4444FF" />
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={series}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="index" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#27F4D2" dot={false} />
          <Line type="monotone" dataKey="wind" name="Wind (km/h)" stroke="#FF8000" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Panel: Championship ─────────────────────────────────────────────────────

function ChampionshipPanel({ data }: { data: any }) {
  const drivers = Object.values(data?.drivers || {}) as any[];
  const teams = Object.values(data?.teams || {}) as any[];
  const sortedDrivers = [...drivers].sort((a, b) => (a.predicted_position || 99) - (b.predicted_position || 99));
  const sortedTeams = [...teams].sort((a, b) => (a.predicted_position || 99) - (b.predicted_position || 99));

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Championship Prediction — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">Live WDC/WCC projections from ChampionshipPrediction feed. Nobody else visualizes this.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold font-mono text-sm mb-2">DRIVERS CHAMPIONSHIP</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedDrivers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="tla" type="category" width={35} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
              <Bar dataKey="predicted_points" name="Predicted Pts" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="font-bold font-mono text-sm mb-2">CONSTRUCTORS CHAMPIONSHIP</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedTeams} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="team" type="category" width={80} tick={{ fontSize: 9, fontFamily: 'monospace' }} />
              <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
              <Bar dataKey="predicted_points" name="Predicted Pts" fill="#333" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Panel: Speed Traps ──────────────────────────────────────────────────────

function SpeedPanel({ data }: { data: any }) {
  const traps = (data?.speed_traps || []).map((s: any) => ({
    ...s,
    st: parseInt(s.ST) || 0,
    i1: parseInt(s.I1) || 0,
    i2: parseInt(s.I2) || 0,
    fl: parseInt(s.FL) || 0,
  }));
  const sortedByST = [...traps].sort((a, b) => b.st - a.st);

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Speed Traps — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">4 measurement points: Intermediate 1 & 2, Finish Line, Speed Trap.</p>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedByST}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="tla" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
          <YAxis domain={['dataMin - 10', 'dataMax + 5']} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }} />
          <Bar dataKey="st" name="Speed Trap (km/h)">
            {sortedByST.map((d: any) => (
              <Cell key={d.tla} fill={`#${d.team_colour}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-1 px-2">DRIVER</th>
              <th className="text-right py-1 px-2">I1</th>
              <th className="text-right py-1 px-2">I2</th>
              <th className="text-right py-1 px-2">FL</th>
              <th className="text-right py-1 px-2 font-bold">ST</th>
            </tr>
          </thead>
          <tbody>
            {sortedByST.map((s: any) => (
              <tr key={s.tla} className="border-b border-gray-100">
                <td className="py-1 px-2">
                  <span className="inline-block w-2 h-2 mr-1" style={{ backgroundColor: `#${s.team_colour}` }} />
                  {s.tla}
                </td>
                <td className="text-right py-1 px-2">{s.I1}</td>
                <td className="text-right py-1 px-2">{s.I2}</td>
                <td className="text-right py-1 px-2">{s.FL}</td>
                <td className="text-right py-1 px-2 font-bold">{s.ST}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Panel: Race Control ─────────────────────────────────────────────────────

function RaceControlPanel({ data }: { data: any }) {
  const messages = data?.messages || [];
  const [filter, setFilter] = useState('');
  const categories = [...new Set(messages.map((m: any) => m.category).filter(Boolean))] as string[];
  const filtered = filter ? messages.filter((m: any) => m.category === filter) : messages;

  const FLAG_COLORS: Record<string, string> = {
    GREEN: '#39B54A', YELLOW: '#FFC700', RED: '#FF0000', BLUE: '#0000FF',
    CHEQUERED: '#000', BLACK: '#000', 'BLACK AND WHITE': '#666',
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Race Control — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">{messages.length} messages total.</p>
      <div className="flex flex-wrap gap-1 mb-4">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1 border-2 font-mono text-xs font-bold ${!filter ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
          ALL ({messages.length})
        </button>
        {categories.map((c: string) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 border-2 font-mono text-xs font-bold ${filter === c ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
            {c} ({messages.filter((m: any) => m.category === c).length})
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-[500px] overflow-y-auto">
        {filtered.map((m: any, i: number) => (
          <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-100 text-sm">
            <span className="font-mono text-xs text-gray-400 w-8 shrink-0">L{m.lap}</span>
            {m.flag && (
              <span className="w-3 h-3 shrink-0 mt-0.5" style={{ backgroundColor: FLAG_COLORS[m.flag] || '#999' }} />
            )}
            <span className="font-mono text-xs">{m.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Panel: Head to Head ─────────────────────────────────────────────────────

function HeadToHeadPanel({ data, year, race }: { data: any; year: number; race: string }) {
  const results = data?.results || [];
  const [driverA, setDriverA] = useState('');
  const [driverB, setDriverB] = useState('');
  const [comparison, setComparison] = useState<any>(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  const compare = async () => {
    if (!driverA || !driverB) return;
    setH2hLoading(true);
    try {
      const r = await f1API.getDriverComparison(driverA, driverB, year, race);
      setComparison(r.data);
    } catch { }
    setH2hLoading(false);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Head-to-Head Comparison</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <div>
          <label className="block text-xs font-mono font-bold mb-1">DRIVER A</label>
          <div className="flex flex-wrap gap-1">
            {results.map((r: any) => (
              <button key={r.tla} onClick={() => setDriverA(r.tla)}
                className={`px-2 py-1 border-2 font-mono text-xs font-bold ${driverA === r.tla ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                {r.tla}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono font-bold mb-1">DRIVER B</label>
          <div className="flex flex-wrap gap-1">
            {results.map((r: any) => (
              <button key={r.tla} onClick={() => setDriverB(r.tla)}
                className={`px-2 py-1 border-2 font-mono text-xs font-bold ${driverB === r.tla ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                {r.tla}
              </button>
            ))}
          </div>
        </div>
      </div>
      {driverA && driverB && (
        <button onClick={compare} className="px-4 py-2 border-2 border-black bg-black text-white font-mono text-sm font-bold hover:bg-white hover:text-black transition-colors mb-4">
          COMPARE {driverA} vs {driverB}
        </button>
      )}
      {h2hLoading && <div className="font-mono text-sm animate-pulse">Loading comparison...</div>}
      {comparison && comparison.comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {comparison.comparison.map((d: any) => (
            <div key={d.tla} className="border-2 border-black p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-4 h-4" style={{ backgroundColor: `#${d.team_colour}` }} />
                <span className="text-lg font-bold">{d.tla}</span>
                <span className="text-sm text-gray-600">{d.team}</span>
              </div>
              <div className="space-y-1 text-sm font-mono">
                <div>Position: <span className="font-bold">P{d.position}</span></div>
                <div>Gap: <span className="font-bold">{d.gap_to_leader || 'LEADER'}</span></div>
                <div>Best Lap: <span className="font-bold">{d.best_lap_time}</span></div>
                <div>Laps: {d.laps} | Pits: {d.pit_stops}</div>
                <div>Strategy: {d.strategy?.map((s: any) => `${s.compound?.[0]}${s.laps}`).join(' → ')}</div>
                {d.pits?.map((p: any, i: number) => (
                  <div key={i} className="text-gray-500">Pit L{p.lap}: {p.time}s</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Panel: Grid vs Finish ───────────────────────────────────────────────────

function GridFinishPanel({ data }: { data: any }) {
  const allResults = data?.results || [];
  const withGrid = allResults.filter((r: any) => r.grid !== null && r.change !== null);
  const chartData = withGrid.map((r: any) => ({
    tla: r.tla,
    grid: r.grid,
    finish: r.finish,
    change: r.change,
    team_colour: r.team_colour,
  }));
  const hasGridData = chartData.length > 0;

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Grid vs Finish — {data?.race_name}</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">Who gained/lost the most positions on race day?</p>
      {hasGridData ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="tla" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: 'Positions Gained', angle: -90, position: 'insideLeft' }} />
              <Tooltip contentStyle={{ fontFamily: 'monospace', fontSize: 11 }}
                formatter={(value: any) => [value > 0 ? `+${value}` : value, 'Change']} />
              <Bar dataKey="change" name="Positions Changed">
                {chartData.map((d: any) => (
                  <Cell key={d.tla} fill={d.change > 0 ? '#39B54A' : d.change < 0 ? '#FF3333' : '#999'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-1 px-2">DRIVER</th>
                  <th className="text-right py-1 px-2">GRID</th>
                  <th className="text-right py-1 px-2">FINISH</th>
                  <th className="text-right py-1 px-2">CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {withGrid.map((r: any) => (
                  <tr key={r.tla} className="border-b border-gray-100">
                    <td className="py-1 px-2">
                      <span className="inline-block w-2 h-2 mr-1" style={{ backgroundColor: `#${r.team_colour}` }} />
                      {r.tla}
                    </td>
                    <td className="text-right py-1 px-2">P{r.grid}</td>
                    <td className="text-right py-1 px-2">P{r.finish}</td>
                    <td className={`text-right py-1 px-2 font-bold ${r.change > 0 ? 'text-green-600' : r.change < 0 ? 'text-red-600' : ''}`}>
                      {r.change > 0 ? `+${r.change}` : r.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-1 px-2">DRIVER</th>
                <th className="text-left py-1 px-2">TEAM</th>
                <th className="text-right py-1 px-2">FINISH</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((r: any) => (
                <tr key={r.tla} className="border-b border-gray-100">
                  <td className="py-1 px-2">
                    <span className="inline-block w-2 h-2 mr-1" style={{ backgroundColor: `#${r.team_colour}` }} />
                    {r.tla}
                  </td>
                  <td className="py-1 px-2 text-gray-600">{r.team}</td>
                  <td className="text-right py-1 px-2 font-bold">P{r.finish}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Panel: History ──────────────────────────────────────────────────────────

function HistoryPanel({ data }: { data: any }) {
  const standings = data?.standings || [];

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">{data?.season} {data?.type === 'driver' ? 'Driver' : 'Constructor'} Championship</h3>
      <p className="text-xs font-mono text-gray-500 mb-4">Historical data from Jolpica API (1950–present).</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 px-2">POS</th>
              <th className="text-left py-2 px-2">NAME</th>
              {data?.type === 'driver' && <th className="text-left py-2 px-2">TEAM</th>}
              <th className="text-right py-2 px-2">POINTS</th>
              <th className="text-right py-2 px-2">WINS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s: any) => (
              <tr key={s.position} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-2 font-bold">P{s.position}</td>
                <td className="py-2 px-2">{s.name}</td>
                {data?.type === 'driver' && <td className="py-2 px-2 text-gray-600">{s.constructor}</td>}
                <td className="text-right py-2 px-2 font-bold">{s.points}</td>
                <td className="text-right py-2 px-2">{s.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
