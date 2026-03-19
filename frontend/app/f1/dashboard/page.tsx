'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { f1API } from '@/lib/api/apps/f1';
import { Flag, Zap, Cloud, Trophy, Gauge, Timer, GitCompare, ArrowUpDown, Clock, BarChart3, Users, History, Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Race { name: string; location: string; country: string; }
interface Season { year: number; events: number; }

type DashboardTab =
  | 'results' | 'positions' | 'overtakes' | 'strategy' | 'pit-stops'
  | 'weather' | 'championship' | 'speed' | 'race-control' | 'head-to-head'
  | 'grid-finish' | 'history';

const TABS: { id: DashboardTab; label: string; icon: any }[] = [
  { id: 'results', label: 'RESULTS', icon: Trophy },
  { id: 'positions', label: 'POSITIONS', icon: BarChart3 },
  { id: 'overtakes', label: 'OVERTAKES', icon: Zap },
  { id: 'strategy', label: 'STRATEGY', icon: Timer },
  { id: 'pit-stops', label: 'PIT STOPS', icon: Clock },
  { id: 'speed', label: 'SPEED', icon: Gauge },
  { id: 'weather', label: 'WEATHER', icon: Cloud },
  { id: 'championship', label: 'CHAMP', icon: Trophy },
  { id: 'race-control', label: 'RACE CTRL', icon: Flag },
  { id: 'head-to-head', label: 'H2H', icon: GitCompare },
  { id: 'grid-finish', label: 'GRID/FINISH', icon: ArrowUpDown },
  { id: 'history', label: 'HISTORY', icon: History },
];

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#E8002D', MEDIUM: '#FFC700', HARD: '#EEEEEE',
  INTERMEDIATE: '#39B54A', WET: '#0067FF',
};

const CHART_TOOLTIP = {
  contentStyle: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 11,
    border: '2px solid #000',
    borderRadius: 0,
    backgroundColor: '#fff',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
    padding: '8px 12px',
  },
  cursor: { stroke: '#000', strokeDasharray: '4 4' },
};

const CHART_GRID = { strokeDasharray: '3 3', stroke: '#e5e5e5', strokeOpacity: 0.8 };
const CHART_AXIS = { fontSize: 10, fontFamily: 'var(--font-geist-mono), monospace', fill: '#666' };

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 p-2">
      <div className="h-6 bg-gray-200 w-1/3" />
      <div className="h-3 bg-gray-100 w-1/2" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="h-4 bg-gray-200 w-8" />
            <div className="h-4 bg-gray-100 flex-1" />
            <div className="h-4 bg-gray-200 w-16" />
          </div>
        ))}
      </div>
      <div className="h-[300px] bg-gray-50 border border-gray-200 mt-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    </div>
  );
}

// ─── Panel Header ────────────────────────────────────────────────────────────

function PanelHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold tracking-widest">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs font-mono text-gray-400">{subtitle}</p>
    </div>
  );
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

  useEffect(() => {
    f1API.getSeasons().then(r => setSeasons(r.data.seasons)).catch(() => {});
  }, []);

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

  const fetchData = useCallback(async () => {
    if (!selectedRace) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      let result;
      switch (activeTab) {
        case 'results': result = await f1API.getStandings(selectedYear, selectedRace); break;
        case 'positions': result = await f1API.getLapPositions(selectedYear, selectedRace); break;
        case 'overtakes': result = await f1API.getOvertakes(selectedYear, selectedRace); break;
        case 'strategy': result = await f1API.getStrategy(selectedYear, selectedRace); break;
        case 'pit-stops': result = await f1API.getPitStops(selectedYear, selectedRace); break;
        case 'weather': result = await f1API.getWeatherSeries(selectedYear, selectedRace); break;
        case 'championship': result = await f1API.getChampionshipPrediction(selectedYear, selectedRace); break;
        case 'speed': result = await f1API.getSpeedTraps(selectedYear, selectedRace); break;
        case 'race-control': result = await f1API.getRaceControl(selectedYear, selectedRace); break;
        case 'head-to-head': result = await f1API.getStandings(selectedYear, selectedRace); break;
        case 'grid-finish': result = await f1API.getGridVsFinish(selectedYear, selectedRace); break;
        case 'history': result = await f1API.getHistoricalStandings(selectedYear); break;
      }
      setData(result?.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Feed not available for this session.');
    }
    setLoading(false);
  }, [selectedYear, selectedRace, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AppLayout appName="F1 EVERYTHING" backUrl="/f1">
      {/* Race Selector */}
      <section className="mb-4">
        <div className="border-2 border-black bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-black to-red-500" />
          <div className="p-4 pt-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1.5 tracking-widest">SEASON</label>
                <div className="flex flex-wrap gap-1">
                  {seasons.map(s => (
                    <button key={s.year} onClick={() => { setSelectedYear(s.year); setSelectedRace(''); }}
                      className={`px-3 py-1.5 border-2 font-mono text-xs font-bold transition-all duration-150 cursor-pointer ${
                        selectedYear === s.year
                          ? 'border-black bg-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.2)]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black'
                      }`}>
                      {s.year}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1.5 tracking-widest">GRAND PRIX</label>
                <div className="flex flex-wrap gap-1">
                  {races.map(r => (
                    <button key={r.name} onClick={() => setSelectedRace(r.name)}
                      className={`px-3 py-1.5 border-2 font-mono text-xs font-bold transition-all duration-150 cursor-pointer ${
                        selectedRace === r.name
                          ? 'border-black bg-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.2)]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-black hover:text-black'
                      }`}>
                      {r.location || r.country}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Tabs */}
      <section className="mb-4">
        <div className="flex flex-wrap gap-0.5 bg-gray-100 border-2 border-black p-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)]'
                    : 'bg-white text-gray-500 hover:text-black hover:bg-gray-50'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="border-2 border-black bg-white min-h-[450px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-black" />
          <div className="p-6">
            {loading && <Skeleton />}
            {error && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-gray-300 flex items-center justify-center mx-auto mb-3">
                    <Flag className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-sm font-mono font-bold text-gray-500">{error}</div>
                </div>
              </div>
            )}
            {!loading && !error && data && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
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
              </div>
            )}
          </div>
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
      <PanelHeader title={`${data?.race_name} ${data?.year}`} subtitle={`${data?.session_type} Classification`} />
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b-2 border-black text-[10px] tracking-widest text-gray-400">
              <th className="text-left py-3 px-3">POS</th>
              <th className="text-left py-3 px-3">DRIVER</th>
              <th className="text-left py-3 px-3 hidden sm:table-cell">TEAM</th>
              <th className="text-left py-3 px-3">GAP</th>
              <th className="text-left py-3 px-3 hidden sm:table-cell">BEST LAP</th>
              <th className="text-center py-3 px-3">PITS</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r: any, i: number) => (
              <tr key={r.tla}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100 group"
                style={{ animationDelay: `${i * 30}ms` }}>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold ${
                    r.position <= 3 ? 'bg-black text-white' : 'border border-gray-200'
                  }`}>
                    {r.position}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-6 shrink-0" style={{ backgroundColor: `#${r.team_colour}` }} />
                    <span className="font-bold">{r.tla}</span>
                    {r.retired && (
                      <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold tracking-wider">RET</span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-gray-500 hidden sm:table-cell">{r.team}</td>
                <td className="py-2.5 px-3">
                  {r.gap_to_leader ? (
                    <span className="text-gray-600">+{r.gap_to_leader.replace('+', '')}</span>
                  ) : (
                    <span className="font-bold">LEADER</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-gray-500 hidden sm:table-cell">{r.best_lap_time}</td>
                <td className="py-2.5 px-3 text-center">{r.pit_stops}</td>
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
  if (drivers.length === 0) return <div className="text-gray-400 font-mono text-sm">No position data available.</div>;

  const maxLaps = Math.max(...drivers.map(d => d.positions.length));
  const chartData = Array.from({ length: maxLaps }, (_, i) => {
    const point: any = { lap: i + 1 };
    drivers.forEach(d => { point[d.tla] = d.positions[i]; });
    return point;
  });

  return (
    <div>
      <PanelHeader title={`Position River`} subtitle={`${data?.race_name} — ${maxLaps} laps, ${drivers.length} drivers`} badge="UNTAPPED" />
      <ResponsiveContainer width="100%" height={520}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="lap" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
            label={{ value: 'LAP', position: 'insideBottom', offset: -10, style: { ...CHART_AXIS, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' } }} />
          <YAxis reversed domain={[1, 20]} tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
            label={{ value: 'POSITION', angle: -90, position: 'insideLeft', offset: 5, style: { ...CHART_AXIS, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' } }} />
          <Tooltip {...CHART_TOOLTIP} />
          {drivers.map(d => (
            <Line key={d.tla} type="monotone" dataKey={d.tla} stroke={`#${d.team_colour}`}
              dot={false} strokeWidth={2.5} name={d.tla} strokeOpacity={0.85} />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 pt-4 border-t border-gray-200">
        {drivers.map(d => (
          <span key={d.tla} className="flex items-center gap-1.5 text-xs font-mono cursor-default hover:opacity-70 transition-opacity">
            <span className="w-3 h-1.5" style={{ backgroundColor: `#${d.team_colour}` }} />
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
      <PanelHeader title="Official Overtake Data" subtitle={`${data?.race_name} — OvertakeSeries feed`} badge="WORLD'S FIRST" />
      <ResponsiveContainer width="100%" height={Math.max(400, sorted.length * 26)}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 5 }}>
          <CartesianGrid {...CHART_GRID} horizontal={false} />
          <XAxis type="number" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis dataKey="tla" type="category" width={40} tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="total_overtakes" name="Overtakes" barSize={16}>
            {sorted.map((d) => (
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

  return (
    <div>
      <PanelHeader title="Tyre Strategy" subtitle={`${data?.race_name} — Width = stint length in laps`} />
      <div className="space-y-1">
        {strategies.map((s: any, idx: number) => {
          const totalLaps = s.stints.reduce((sum: number, st: any) => sum + (st.laps || 0), 0);
          return (
            <div key={s.tla} className="flex items-center gap-2 group hover:bg-gray-50 transition-colors duration-100 py-0.5 px-1 -mx-1"
              style={{ animationDelay: `${idx * 20}ms` }}>
              <span className="w-7 text-[10px] font-mono font-bold text-gray-400 text-right">P{s.position}</span>
              <span className="w-1 h-5 shrink-0" style={{ backgroundColor: `#${s.team_colour}` }} />
              <span className="w-10 text-xs font-mono font-bold">{s.tla}</span>
              <div className="flex-1 flex h-7 border-2 border-gray-200 group-hover:border-black transition-colors duration-150 overflow-hidden">
                {s.stints.map((st: any, i: number) => (
                  <div key={i}
                    className="h-full flex items-center justify-center text-[10px] font-mono font-bold border-r border-white/50 transition-all duration-150"
                    style={{
                      width: `${totalLaps > 0 ? (st.laps / totalLaps) * 100 : 0}%`,
                      backgroundColor: COMPOUND_COLORS[st.compound] || '#ccc',
                      color: st.compound === 'HARD' ? '#333' : '#fff',
                      minWidth: '18px',
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
      <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
        {Object.entries(COMPOUND_COLORS).map(([c, color]) => (
          <span key={c} className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider">
            <span className="w-4 h-3 border border-black/10" style={{ backgroundColor: color }} />
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
  const chartData = stops.slice(0, 20).map((s: any) => ({
    ...s,
    time: parseFloat(s.pit_stop_time) || 0,
    laneTime: parseFloat(s.pit_lane_time) || 0,
    label: `${s.tla} L${s.lap}`,
  }));

  return (
    <div>
      <PanelHeader title="Pit Stops" subtitle={`${data?.race_name} — ${stops.length} stops, sorted by fastest`} />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ bottom: 30 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="label" tick={{ ...CHART_AXIS, fontSize: 9 }} angle={-45} textAnchor="end" height={60}
            axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
            label={{ value: 'SECONDS', angle: -90, position: 'insideLeft', style: { ...CHART_AXIS, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' } }} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="time" name="Stationary" fill="#000" barSize={12} />
          <Bar dataKey="laneTime" name="Pit Lane" fill="#ccc" barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Panel: Weather ──────────────────────────────────────────────────────────

function WeatherPanel({ data }: { data: any }) {
  const series = (data?.series || []).map((s: any, i: number) => ({
    ...s, index: i,
    air: parseFloat(s.air_temp) || 0,
    track: parseFloat(s.track_temp) || 0,
    humidity: parseFloat(s.humidity) || 0,
    wind: parseFloat(s.wind_speed) || 0,
  }));

  return (
    <div>
      <PanelHeader title="Weather Data" subtitle={`${data?.race_name} — ${series.length} samples (~60s intervals)`} badge="UNTAPPED" />
      <div className="mb-6">
        <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-2">TEMPERATURE</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={series} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="index" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
              label={{ value: '°C', angle: -90, position: 'insideLeft', style: CHART_AXIS }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Area type="monotone" dataKey="track" name="Track" fill="#E8002D" fillOpacity={0.12} stroke="#E8002D" strokeWidth={2} />
            <Area type="monotone" dataKey="air" name="Air" fill="#3671C6" fillOpacity={0.12} stroke="#3671C6" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-2">CONDITIONS</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={series} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="index" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <Tooltip {...CHART_TOOLTIP} />
            <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#27F4D2" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="wind" name="Wind km/h" stroke="#FF8000" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
      <PanelHeader title="Championship Prediction" subtitle={`${data?.race_name} — Live projections`} badge="UNTAPPED" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-3">DRIVERS CHAMPIONSHIP</div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedDrivers} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid {...CHART_GRID} horizontal={false} />
              <XAxis type="number" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis dataKey="tla" type="category" width={35} tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="predicted_points" name="Predicted Pts" fill="#000" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-3">CONSTRUCTORS CHAMPIONSHIP</div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedTeams} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid {...CHART_GRID} horizontal={false} />
              <XAxis type="number" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis dataKey="team" type="category" width={80} tick={{ ...CHART_AXIS, fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="predicted_points" name="Predicted Pts" fill="#333" barSize={14} />
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
    ...s, st: parseInt(s.ST) || 0, i1: parseInt(s.I1) || 0, i2: parseInt(s.I2) || 0, fl: parseInt(s.FL) || 0,
  }));
  const sortedByST = [...traps].sort((a, b) => b.st - a.st);

  return (
    <div>
      <PanelHeader title="Speed Traps" subtitle={`${data?.race_name} — 4 measurement points`} />
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={sortedByST} margin={{ bottom: 5 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="tla" tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis domain={['dataMin - 10', 'dataMax + 5']} tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="st" name="Speed Trap km/h" barSize={18}>
            {sortedByST.map((d: any) => (
              <Cell key={d.tla} fill={`#${d.team_colour}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="overflow-x-auto mt-4 pt-4 border-t border-gray-200">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-[10px] tracking-widest text-gray-400 border-b-2 border-black">
              <th className="text-left py-2 px-2">DRIVER</th>
              <th className="text-right py-2 px-2">I1</th>
              <th className="text-right py-2 px-2">I2</th>
              <th className="text-right py-2 px-2">FL</th>
              <th className="text-right py-2 px-2">ST</th>
            </tr>
          </thead>
          <tbody>
            {sortedByST.map((s: any) => (
              <tr key={s.tla} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                <td className="py-1.5 px-2">
                  <span className="inline-block w-1 h-4 mr-2 align-middle" style={{ backgroundColor: `#${s.team_colour}` }} />
                  <span className="font-bold">{s.tla}</span>
                </td>
                <td className="text-right py-1.5 px-2 text-gray-500">{s.I1}</td>
                <td className="text-right py-1.5 px-2 text-gray-500">{s.I2}</td>
                <td className="text-right py-1.5 px-2 text-gray-500">{s.FL}</td>
                <td className="text-right py-1.5 px-2 font-bold">{s.ST}</td>
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
    GREEN: '#39B54A', YELLOW: '#FFC700', RED: '#FF0000', BLUE: '#0067FF',
    CHEQUERED: '#000', BLACK: '#000', 'BLACK AND WHITE': '#666',
  };

  return (
    <div>
      <PanelHeader title="Race Control" subtitle={`${data?.race_name} — ${messages.length} messages`} />
      <div className="flex flex-wrap gap-1 mb-4">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 border-2 font-mono text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer ${
            !filter ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black'
          }`}>
          ALL ({messages.length})
        </button>
        {categories.map((c: string) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 border-2 font-mono text-[10px] font-bold tracking-wider transition-all duration-150 cursor-pointer ${
              filter === c ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black'
            }`}>
            {c} ({messages.filter((m: any) => m.category === c).length})
          </button>
        ))}
      </div>
      <div className="space-y-0 max-h-[500px] overflow-y-auto border-t-2 border-black">
        {filtered.map((m: any, i: number) => (
          <div key={i} className="flex items-start gap-3 py-2 px-3 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100 group">
            <span className="font-mono text-[10px] text-gray-300 w-7 shrink-0 font-bold pt-0.5">L{m.lap}</span>
            {m.flag && (
              <span className="w-2.5 h-2.5 shrink-0 mt-1 border border-black/10" style={{ backgroundColor: FLAG_COLORS[m.flag] || '#999' }} />
            )}
            <span className="font-mono text-xs text-gray-700 group-hover:text-black transition-colors">{m.message}</span>
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
      <PanelHeader title="Head-to-Head" subtitle="Select two drivers to compare" />
      <div className="space-y-4 mb-6">
        {['A', 'B'].map(label => {
          const selected = label === 'A' ? driverA : driverB;
          const setSelected = label === 'A' ? setDriverA : setDriverB;
          return (
            <div key={label}>
              <label className="block text-[10px] font-mono font-bold text-gray-400 mb-1.5 tracking-widest">DRIVER {label}</label>
              <div className="flex flex-wrap gap-1">
                {results.map((r: any) => (
                  <button key={r.tla} onClick={() => setSelected(r.tla)}
                    className={`px-2.5 py-1.5 border-2 font-mono text-xs font-bold transition-all duration-150 cursor-pointer ${
                      selected === r.tla
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                    }`}>
                    {r.tla}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {driverA && driverB && (
        <button onClick={compare} disabled={h2hLoading}
          className="px-6 py-2.5 border-2 border-black bg-black text-white font-mono text-xs font-bold hover:bg-white hover:text-black transition-all duration-200 cursor-pointer disabled:opacity-50 mb-6">
          {h2hLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> LOADING...</span>
          ) : (
            `COMPARE ${driverA} vs ${driverB}`
          )}
        </button>
      )}
      {comparison?.comparison && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparison.comparison.map((d: any) => (
            <div key={d.tla} className="border-2 border-black p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: `#${d.team_colour}` }} />
              <div className="flex items-center gap-2 mb-4 mt-1">
                <span className="text-2xl font-bold">{d.tla}</span>
                <span className="text-xs text-gray-500 font-mono">{d.team}</span>
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between"><span className="text-gray-500">Position</span><span className="font-bold">P{d.position}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Gap</span><span className="font-bold">{d.gap_to_leader || 'LEADER'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Best Lap</span><span className="font-bold">{d.best_lap_time}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Laps / Pits</span><span>{d.laps} / {d.pit_stops}</span></div>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 text-xs">Strategy: </span>
                  <span className="text-xs font-bold">{d.strategy?.map((s: any) => `${s.compound?.[0]}${s.laps}`).join(' > ')}</span>
                </div>
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
  const hasGridData = withGrid.length > 0;

  return (
    <div>
      <PanelHeader title="Grid vs Finish" subtitle={`${data?.race_name} — Positions gained/lost on race day`} />
      {hasGridData ? (
        <>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={withGrid} margin={{ bottom: 5 }}>
              <CartesianGrid {...CHART_GRID} />
              <XAxis dataKey="tla" tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
              <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
              <Tooltip {...CHART_TOOLTIP} formatter={(value: any) => [value > 0 ? `+${value}` : value, 'Change']} />
              <Bar dataKey="change" name="Positions" barSize={18}>
                {withGrid.map((d: any) => (
                  <Cell key={d.tla} fill={d.change > 0 ? '#39B54A' : d.change < 0 ? '#E8002D' : '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="overflow-x-auto mt-4 pt-4 border-t border-gray-200">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-[10px] tracking-widest text-gray-400 border-b-2 border-black">
                  <th className="text-left py-2 px-2">DRIVER</th>
                  <th className="text-right py-2 px-2">GRID</th>
                  <th className="text-right py-2 px-2">FINISH</th>
                  <th className="text-right py-2 px-2">CHANGE</th>
                </tr>
              </thead>
              <tbody>
                {withGrid.map((r: any) => (
                  <tr key={r.tla} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                    <td className="py-1.5 px-2">
                      <span className="inline-block w-1 h-4 mr-2 align-middle" style={{ backgroundColor: `#${r.team_colour}` }} />
                      <span className="font-bold">{r.tla}</span>
                    </td>
                    <td className="text-right py-1.5 px-2 text-gray-500">P{r.grid}</td>
                    <td className="text-right py-1.5 px-2 text-gray-500">P{r.finish}</td>
                    <td className={`text-right py-1.5 px-2 font-bold ${r.change > 0 ? 'text-green-600' : r.change < 0 ? 'text-red-600' : ''}`}>
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
              <tr className="text-[10px] tracking-widest text-gray-400 border-b-2 border-black">
                <th className="text-left py-2 px-2">DRIVER</th>
                <th className="text-left py-2 px-2">TEAM</th>
                <th className="text-right py-2 px-2">FINISH</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((r: any) => (
                <tr key={r.tla} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                  <td className="py-1.5 px-2">
                    <span className="inline-block w-1 h-4 mr-2 align-middle" style={{ backgroundColor: `#${r.team_colour}` }} />
                    <span className="font-bold">{r.tla}</span>
                  </td>
                  <td className="py-1.5 px-2 text-gray-500">{r.team}</td>
                  <td className="text-right py-1.5 px-2 font-bold">P{r.finish}</td>
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
      <PanelHeader title={`${data?.season} ${data?.type === 'driver' ? 'Driver' : 'Constructor'} Championship`}
        subtitle="Historical data from Jolpica API (1950-present)" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-[10px] tracking-widest text-gray-400 border-b-2 border-black">
              <th className="text-left py-3 px-3">POS</th>
              <th className="text-left py-3 px-3">NAME</th>
              {data?.type === 'driver' && <th className="text-left py-3 px-3 hidden sm:table-cell">TEAM</th>}
              <th className="text-right py-3 px-3">POINTS</th>
              <th className="text-right py-3 px-3">WINS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s: any, i: number) => (
              <tr key={s.position} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold ${
                    parseInt(s.position) <= 3 ? 'bg-black text-white' : 'border border-gray-200'
                  }`}>
                    {s.position}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-bold">{s.name}</td>
                {data?.type === 'driver' && <td className="py-2.5 px-3 text-gray-500 hidden sm:table-cell">{s.constructor}</td>}
                <td className="text-right py-2.5 px-3 font-bold">{s.points}</td>
                <td className="text-right py-2.5 px-3">{s.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
