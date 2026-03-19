'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { RaceSelector } from '@/components/f1/RaceSelector';
import { Skeleton } from '@/components/f1/Skeleton';
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, COMPOUND_COLORS } from '@/components/f1/chart-config';
import { f1API } from '@/lib/api/apps/f1';
import api from '@/lib/api/client';
import { Loader2, Play, Pause, ChevronRight, X } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Season { year: number; events: number; }
interface Race { name: string; location: string; country: string; }

const TRACK_STATUS_COLORS: Record<string, string> = {
  AllClear: '#39B54A', Green: '#39B54A', Yellow: '#FFC700',
  Red: '#FF0000', SafetyCar: '#FF8000', VSC: '#FF8000', VSCEnding: '#FFC700',
};

const SPEED_OPTIONS = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 5, label: '5x' },
  { value: 10, label: '10x' },
];

export default function ReplayPage() {
  // Race selection state
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedRace, setSelectedRace] = useState('');
  const [racePickerOpen, setRacePickerOpen] = useState(false);

  // Replay state
  const [replayData, setReplayData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLap, setCurrentLap] = useState(1);
  const [mode, setMode] = useState<'scrubber' | 'cinematic'>('scrubber');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Telemetry drawer
  const [telemetryDriver, setTelemetryDriver] = useState<string | null>(null);
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Load seasons
  useEffect(() => {
    f1API.getSeasons().then(r => setSeasons(r.data.seasons)).catch(() => {});
  }, []);

  // Load races
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

  // Fetch replay data
  const fetchReplay = useCallback(async () => {
    if (!selectedRace) return;
    setLoading(true);
    setError('');
    setReplayData(null);
    setCurrentLap(1);
    setPlaying(false);
    setTelemetryDriver(null);
    try {
      const r = await api.get(`/f1/replay?year=${selectedYear}&race=${selectedRace}&session_type=Race`);
      setReplayData(r.data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load replay data.');
    }
    setLoading(false);
  }, [selectedYear, selectedRace]);

  useEffect(() => { fetchReplay(); }, [fetchReplay]);

  // Cinematic mode auto-advance
  useEffect(() => {
    if (playing && replayData) {
      intervalRef.current = setInterval(() => {
        setCurrentLap(prev => {
          if (prev >= replayData.total_laps) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, replayData]);

  // Fetch telemetry for a driver
  const fetchTelemetry = async (driverTla: string) => {
    if (telemetryDriver === driverTla) {
      setTelemetryDriver(null);
      setTelemetryData(null);
      return;
    }
    setTelemetryDriver(driverTla);
    setTelemetryLoading(true);
    setTelemetryData(null);
    try {
      const r = await f1API.getTelemetry(driverTla, selectedYear, selectedRace, currentLap);
      setTelemetryData(r.data);
    } catch {
      setTelemetryData(null);
    }
    setTelemetryLoading(false);
  };

  const currentLapData = replayData?.laps?.[currentLap - 1];
  const trackStatus = currentLapData?.track_status || 'AllClear';
  const statusColor = TRACK_STATUS_COLORS[trackStatus] || '#39B54A';

  // Collect race control messages up to current lap for feed
  const rcMessages: any[] = [];
  if (replayData?.laps) {
    for (let i = Math.max(0, currentLap - 5); i < currentLap; i++) {
      const lap = replayData.laps[i];
      if (lap?.race_control) {
        lap.race_control.forEach((m: any) => rcMessages.push({ ...m, lap: lap.lap }));
      }
    }
  }

  return (
    <AppLayout appName="RACE REPLAY" backUrl="/f1">
      <RaceSelector
        seasons={seasons} races={races}
        selectedYear={selectedYear}
        setSelectedYear={(y) => { setSelectedYear(y); setSelectedRace(''); }}
        selectedRace={selectedRace} setSelectedRace={setSelectedRace}
        racePickerOpen={racePickerOpen} setRacePickerOpen={setRacePickerOpen}
      />

      {loading && (
        <div className="border-2 border-black bg-white p-6"><Skeleton /></div>
      )}

      {error && (
        <div className="border-2 border-black bg-white p-12 text-center">
          <div className="text-sm font-mono font-bold text-gray-500">{error}</div>
        </div>
      )}

      {!loading && !error && replayData && (
        <div className="space-y-3">
          {/* Track Status Banner */}
          <div className="h-2 w-full transition-colors duration-300" style={{ backgroundColor: statusColor }} />

          {/* Controls */}
          <div className="border-2 border-black bg-white p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex gap-1">
                {(['scrubber', 'cinematic'] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setPlaying(false); }}
                    className={`px-4 py-2 font-mono text-xs font-bold border-2 transition-all duration-150 cursor-pointer ${
                      mode === m ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500 hover:border-black'
                    }`}>
                    {m === 'scrubber' ? 'SCRUBBER' : 'CINEMATIC'}
                  </button>
                ))}
              </div>

              {/* Lap Slider */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3">
                  {mode === 'cinematic' && (
                    <button onClick={() => setPlaying(!playing)}
                      className="w-10 h-10 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all duration-150">
                      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                  <div className="flex-1">
                    <input
                      type="range" min={1} max={replayData.total_laps} value={currentLap}
                      onChange={(e) => setCurrentLap(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                    />
                  </div>
                  <span className="font-mono text-sm font-bold whitespace-nowrap">
                    LAP {currentLap} / {replayData.total_laps}
                  </span>
                </div>
              </div>

              {/* Speed selector (cinematic mode) */}
              {mode === 'cinematic' && (
                <div className="flex gap-1">
                  {SPEED_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => setSpeed(s.value)}
                      className={`px-3 py-2 font-mono text-xs font-bold border-2 transition-all duration-150 cursor-pointer ${
                        speed === s.value ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500 hover:border-black'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Leaderboard (2/3 width) */}
            <div className="lg:col-span-2 border-2 border-black bg-white">
              <div className="border-b-2 border-black px-4 py-2 flex items-center justify-between">
                <h3 className="font-bold text-sm font-mono">LEADERBOARD</h3>
                <span className="text-[10px] font-mono text-gray-400">CLICK DRIVER FOR TELEMETRY</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b-2 border-black text-[10px] tracking-widest text-gray-400">
                      <th className="text-left py-2 px-3">POS</th>
                      <th className="text-left py-2 px-3">DRIVER</th>
                      <th className="text-left py-2 px-3 hidden sm:table-cell">GAP</th>
                      <th className="text-left py-2 px-3 hidden sm:table-cell">INT</th>
                      <th className="text-left py-2 px-3">LAST LAP</th>
                      <th className="text-center py-2 px-3">TYRE</th>
                      <th className="text-center py-2 px-3 hidden sm:table-cell">PIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentLapData?.positions || []).map((p: any, i: number) => {
                      const isPitting = currentLapData?.pit_stops?.some((ps: any) => ps.tla === p.tla);
                      const isSelected = telemetryDriver === p.tla;
                      return (
                        <tr key={p.num || p.tla}
                          onClick={() => fetchTelemetry(p.tla)}
                          className={`border-b border-gray-100 cursor-pointer transition-all duration-100 ${
                            isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold ${
                              i < 3 ? 'bg-black text-white' : 'border border-gray-200'
                            }`}>
                              {p.position || i + 1}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-5 shrink-0" style={{ backgroundColor: `#${p.team_colour}` }} />
                              <span className="font-bold">{p.tla}</span>
                              {isSelected && <ChevronRight className="w-3 h-3 text-gray-400" />}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-500 hidden sm:table-cell text-xs">
                            {p.gap ? `+${p.gap.replace('+', '')}` : i === 0 ? 'LEADER' : ''}
                          </td>
                          <td className="py-2 px-3 text-gray-500 hidden sm:table-cell text-xs">{p.interval}</td>
                          <td className="py-2 px-3 text-xs">{p.last_lap}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-3 h-3 border border-black/10"
                                style={{ backgroundColor: COMPOUND_COLORS[p.compound] || '#ccc' }} />
                              <span className="text-[10px] text-gray-500">{p.tyre_age || ''}</span>
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center hidden sm:table-cell">
                            {isPitting && (
                              <span className="px-1.5 py-0.5 bg-yellow-400 text-black text-[10px] font-bold">PIT</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">
              {/* Race Control Feed */}
              <div className="border-2 border-black bg-white">
                <div className="border-b-2 border-black px-4 py-2">
                  <h3 className="font-bold text-sm font-mono">RACE CONTROL</h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {rcMessages.length > 0 ? (
                    rcMessages.reverse().map((m, i) => (
                      <div key={i} className="flex items-start gap-2 px-3 py-2 border-b border-gray-100 text-xs">
                        <span className="font-mono text-[10px] text-gray-300 font-bold shrink-0">L{m.lap}</span>
                        {m.flag && (
                          <span className="w-2 h-2 shrink-0 mt-1 border border-black/10" style={{
                            backgroundColor: m.flag === 'GREEN' ? '#39B54A' : m.flag === 'YELLOW' ? '#FFC700' : m.flag === 'RED' ? '#FF0000' : '#999'
                          }} />
                        )}
                        <span className="font-mono text-gray-600">{m.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs font-mono text-gray-300 text-center">NO MESSAGES</div>
                  )}
                </div>
              </div>

              {/* Weather Widget */}
              <div className="border-2 border-black bg-white p-4">
                <h3 className="font-bold text-sm font-mono mb-3">WEATHER</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'AIR', value: `${currentLapData?.weather?.air_temp || '\u2014'}\u00B0C` },
                    { label: 'TRACK', value: `${currentLapData?.weather?.track_temp || '\u2014'}\u00B0C` },
                    { label: 'HUMIDITY', value: `${currentLapData?.weather?.humidity || '\u2014'}%` },
                    { label: 'RAIN', value: currentLapData?.weather?.rainfall ? 'YES' : 'NO' },
                  ].map(w => (
                    <div key={w.label}>
                      <div className="text-[10px] font-mono text-gray-400 tracking-wider">{w.label}</div>
                      <div className="text-lg font-bold font-mono">{w.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pit Stops this lap */}
              {currentLapData?.pit_stops?.length > 0 && (
                <div className="border-2 border-yellow-400 bg-yellow-50 p-4">
                  <h3 className="font-bold text-sm font-mono mb-2">PIT STOPS — LAP {currentLap}</h3>
                  {currentLapData.pit_stops.map((ps: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs font-mono py-1">
                      <span className="font-bold">{ps.tla}</span>
                      <span>{ps.time}s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Drawer */}
          {telemetryDriver && (
            <div className="border-2 border-black bg-white">
              <div className="border-b-2 border-black px-4 py-2 flex items-center justify-between">
                <h3 className="font-bold text-sm font-mono">
                  {telemetryDriver} TELEMETRY — LAP {currentLap}
                </h3>
                <button onClick={() => { setTelemetryDriver(null); setTelemetryData(null); }}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                {telemetryLoading && (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}
                {!telemetryLoading && telemetryData?.telemetry && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Speed Chart */}
                    <div>
                      <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-2">SPEED (km/h)</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={telemetryData.telemetry}>
                          <CartesianGrid {...CHART_GRID} />
                          <XAxis tick={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                          <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                          <Tooltip {...CHART_TOOLTIP} />
                          <Line type="monotone" dataKey="speed" stroke="#E8002D" dot={false} strokeWidth={2} name="Speed" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Throttle/Brake Chart */}
                    <div>
                      <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest mb-2">THROTTLE / BRAKE</div>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={telemetryData.telemetry}>
                          <CartesianGrid {...CHART_GRID} />
                          <XAxis tick={false} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                          <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} domain={[0, 100]} />
                          <Tooltip {...CHART_TOOLTIP} />
                          <Line type="monotone" dataKey="throttle" stroke="#39B54A" dot={false} strokeWidth={2} name="Throttle" />
                          <Line type="monotone" dataKey="brake" stroke="#E8002D" dot={false} strokeWidth={2} name="Brake" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                {!telemetryLoading && !telemetryData?.telemetry && (
                  <div className="text-center py-8 text-sm font-mono text-gray-400">
                    No telemetry data available for this lap
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
