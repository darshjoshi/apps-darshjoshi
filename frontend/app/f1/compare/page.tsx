'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { RaceSelector } from '@/components/f1/RaceSelector';
import { Skeleton } from '@/components/f1/Skeleton';
import { CHART_TOOLTIP, CHART_GRID, CHART_AXIS, COMPOUND_COLORS } from '@/components/f1/chart-config';
import { f1API } from '@/lib/api/apps/f1';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Season { year: number; events: number; }
interface Race { name: string; location: string; country: string; }
interface Driver { tla: string; team: string; team_colour: string; number: string; name: string; }

type CompareType = 'driver-vs-driver' | 'cross-year' | 'team-vs-team';
type Metric = 'lap-times' | 'strategy' | 'pit-stops' | 'speed-traps';

const COMPARE_TYPES: { value: CompareType; label: string; desc: string }[] = [
  { value: 'driver-vs-driver', label: 'DRIVER vs DRIVER', desc: 'Same race, two drivers' },
  { value: 'cross-year', label: 'DRIVER CROSS-YEAR', desc: 'Same driver, same track, different years' },
  { value: 'team-vs-team', label: 'TEAM vs TEAM', desc: 'Same race, two teams' },
];

const METRICS: { value: Metric; label: string }[] = [
  { value: 'lap-times', label: 'LAP TIMES' },
  { value: 'strategy', label: 'STRATEGY' },
  { value: 'pit-stops', label: 'PIT STOPS' },
  { value: 'speed-traps', label: 'SPEED TRAPS' },
];

// Parse lap time string to seconds
function parseTime(t: string): number | null {
  if (!t) return null;
  const parts = t.split(':');
  if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  return parseFloat(t) || null;
}

export default function ComparePage() {
  const [step, setStep] = useState(1);
  const [compareType, setCompareType] = useState<CompareType>('driver-vs-driver');

  // Race selection
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedRace, setSelectedRace] = useState('');
  const [racePickerOpen, setRacePickerOpen] = useState(false);

  // Cross-year: additional years
  const [crossYears, setCrossYears] = useState<number[]>([2024]);

  // Drivers/Teams
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Metrics
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(['lap-times']);

  // Results
  const [results, setResults] = useState<any>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

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
    }).catch(() => {});
  }, [selectedYear]);

  // Load drivers when race selected
  useEffect(() => {
    if (selectedRace) {
      f1API.getDrivers(selectedYear, selectedRace).then(r => {
        setDrivers(r.data.drivers || []);
      }).catch(() => {});
    }
  }, [selectedYear, selectedRace]);

  const toggleDriver = (tla: string) => {
    if (compareType === 'driver-vs-driver') {
      setSelectedDrivers(prev =>
        prev.includes(tla) ? prev.filter(d => d !== tla) :
        prev.length < 2 ? [...prev, tla] : [prev[1], tla]
      );
    } else if (compareType === 'cross-year') {
      setSelectedDrivers([tla]);
    }
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) :
      prev.length < 2 ? [...prev, team] : [prev[1], team]
    );
  };

  const toggleMetric = (m: Metric) => {
    setSelectedMetrics(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const toggleCrossYear = (y: number) => {
    setCrossYears(prev =>
      prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]
    );
  };

  // Fetch results
  const fetchResults = async () => {
    setResultsLoading(true);
    setResults(null);
    try {
      const data: any = {};

      if (compareType === 'driver-vs-driver') {
        const promises: Promise<any>[] = [];
        if (selectedMetrics.includes('lap-times')) {
          selectedDrivers.forEach(d => promises.push(
            f1API.getLapTimes(selectedYear, selectedRace, d).then(r => ({ type: 'laps', driver: d, data: r.data }))
          ));
        }
        if (selectedMetrics.includes('strategy')) {
          promises.push(f1API.getStrategy(selectedYear, selectedRace).then(r => ({ type: 'strategy', data: r.data })));
        }
        if (selectedMetrics.includes('pit-stops')) {
          promises.push(f1API.getPitStops(selectedYear, selectedRace).then(r => ({ type: 'pits', data: r.data })));
        }
        if (selectedMetrics.includes('speed-traps')) {
          promises.push(f1API.getSpeedTraps(selectedYear, selectedRace).then(r => ({ type: 'speed', data: r.data })));
        }
        const results = await Promise.all(promises);
        results.forEach(r => {
          if (r.type === 'laps') {
            if (!data.laps) data.laps = {};
            data.laps[r.driver] = r.data;
          } else {
            data[r.type] = r.data;
          }
        });
      } else if (compareType === 'cross-year') {
        const allYears = [selectedYear, ...crossYears];
        const promises: Promise<any>[] = [];
        allYears.forEach(y => {
          if (selectedMetrics.includes('lap-times')) {
            promises.push(
              f1API.getLapTimes(y, selectedRace, selectedDrivers[0])
                .then(r => ({ type: 'laps', year: y, data: r.data }))
                .catch(() => ({ type: 'laps', year: y, data: null }))
            );
          }
          if (selectedMetrics.includes('strategy')) {
            promises.push(
              f1API.getStrategy(y, selectedRace)
                .then(r => ({ type: 'strategy', year: y, data: r.data }))
                .catch(() => ({ type: 'strategy', year: y, data: null }))
            );
          }
          if (selectedMetrics.includes('speed-traps')) {
            promises.push(
              f1API.getSpeedTraps(y, selectedRace)
                .then(r => ({ type: 'speed', year: y, data: r.data }))
                .catch(() => ({ type: 'speed', year: y, data: null }))
            );
          }
        });
        const results = await Promise.all(promises);
        data.byYear = {};
        results.forEach(r => {
          if (!data.byYear[r.year]) data.byYear[r.year] = {};
          data.byYear[r.year][r.type] = r.data;
        });
        data.years = allYears;
        data.driver = selectedDrivers[0];
      } else if (compareType === 'team-vs-team') {
        const promises: Promise<any>[] = [];
        if (selectedMetrics.includes('lap-times')) {
          // Get all lap times and filter by team
          promises.push(f1API.getLapTimes(selectedYear, selectedRace).then(r => ({ type: 'laps', data: r.data })));
        }
        if (selectedMetrics.includes('strategy')) {
          promises.push(f1API.getStrategy(selectedYear, selectedRace).then(r => ({ type: 'strategy', data: r.data })));
        }
        if (selectedMetrics.includes('pit-stops')) {
          promises.push(f1API.getPitStops(selectedYear, selectedRace).then(r => ({ type: 'pits', data: r.data })));
        }
        if (selectedMetrics.includes('speed-traps')) {
          promises.push(f1API.getSpeedTraps(selectedYear, selectedRace).then(r => ({ type: 'speed', data: r.data })));
        }
        const results = await Promise.all(promises);
        results.forEach(r => { data[r.type] = r.data; });
        data.teams = selectedTeams;
      }

      data.compareType = compareType;
      data.selectedDrivers = selectedDrivers;
      data.selectedMetrics = selectedMetrics;
      setResults(data);
    } catch (e) {
      console.error('Compare fetch error:', e);
    }
    setResultsLoading(false);
    setStep(5);
  };

  const uniqueTeams = [...new Set(drivers.map(d => d.team))];

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return !!selectedRace;
      case 3:
        if (compareType === 'team-vs-team') return selectedTeams.length === 2;
        if (compareType === 'cross-year') return selectedDrivers.length === 1 && crossYears.length > 0;
        return selectedDrivers.length === 2;
      case 4: return selectedMetrics.length > 0;
      default: return false;
    }
  };

  return (
    <AppLayout appName="COMPARE" backUrl="/f1">
      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`h-1 flex-1 transition-all duration-300 ${
              s <= step ? 'bg-black' : 'bg-gray-200'
            }`} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-mono text-gray-400">TYPE</span>
          <span className="text-[10px] font-mono text-gray-400">RESULTS</span>
        </div>
      </div>

      {/* Step 1: Compare Type */}
      {step === 1 && (
        <div className="border-2 border-black bg-white p-6">
          <h2 className="text-xl font-bold mb-1">What do you want to compare?</h2>
          <p className="text-xs font-mono text-gray-400 mb-6">SELECT COMPARISON TYPE</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {COMPARE_TYPES.map(t => (
              <button key={t.value} onClick={() => { setCompareType(t.value); setSelectedDrivers([]); setSelectedTeams([]); }}
                className={`p-6 border-2 text-left transition-all duration-150 cursor-pointer ${
                  compareType === t.value ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                }`}>
                <div className="font-mono text-sm font-bold mb-2">{t.label}</div>
                <div className={`text-xs ${compareType === t.value ? 'text-gray-300' : 'text-gray-500'}`}>{t.desc}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={() => setStep(2)}
              className="px-6 py-3 border-2 border-black bg-black text-white font-mono text-xs font-bold hover:bg-white hover:text-black transition-all duration-200 cursor-pointer flex items-center gap-2">
              NEXT <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Race Selection */}
      {step === 2 && (
        <div>
          <RaceSelector
            seasons={seasons} races={races}
            selectedYear={selectedYear}
            setSelectedYear={(y) => { setSelectedYear(y); setSelectedRace(''); }}
            selectedRace={selectedRace} setSelectedRace={setSelectedRace}
            racePickerOpen={racePickerOpen} setRacePickerOpen={setRacePickerOpen}
          />
          {compareType === 'cross-year' && (
            <div className="border-2 border-black bg-white p-6 mt-3">
              <h3 className="font-bold text-sm mb-1">Compare Years</h3>
              <p className="text-xs font-mono text-gray-400 mb-4">SELECT ADDITIONAL YEARS TO COMPARE</p>
              <div className="flex flex-wrap gap-2">
                {seasons.filter(s => s.year !== selectedYear).map(s => (
                  <button key={s.year} onClick={() => toggleCrossYear(s.year)}
                    className={`px-4 py-2 border-2 font-mono text-xs font-bold transition-all duration-150 cursor-pointer ${
                      crossYears.includes(s.year) ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500 hover:border-black'
                    }`}>
                    {s.year}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-between">
            <button onClick={() => setStep(1)}
              className="px-6 py-3 border-2 border-gray-300 font-mono text-xs font-bold hover:border-black transition-all duration-200 cursor-pointer flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> BACK
            </button>
            <button onClick={() => setStep(3)} disabled={!canProceed()}
              className="px-6 py-3 border-2 border-black bg-black text-white font-mono text-xs font-bold hover:bg-white hover:text-black transition-all duration-200 cursor-pointer disabled:opacity-30 flex items-center gap-2">
              NEXT <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Select Subjects */}
      {step === 3 && (
        <div className="border-2 border-black bg-white p-6">
          {compareType === 'team-vs-team' ? (
            <>
              <h2 className="text-xl font-bold mb-1">Select Two Teams</h2>
              <p className="text-xs font-mono text-gray-400 mb-6">{selectedTeams.length}/2 SELECTED</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {uniqueTeams.map(team => {
                  const teamDriver = drivers.find(d => d.team === team);
                  return (
                    <button key={team} onClick={() => toggleTeam(team)}
                      className={`p-4 border-2 text-left transition-all duration-150 cursor-pointer ${
                        selectedTeams.includes(team) ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                      }`}>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-6" style={{ backgroundColor: `#${teamDriver?.team_colour || '000'}` }} />
                        <span className="font-mono text-xs font-bold">{team}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-1">
                {compareType === 'cross-year' ? 'Select Driver' : 'Select Two Drivers'}
              </h2>
              <p className="text-xs font-mono text-gray-400 mb-6">
                {selectedDrivers.length}/{compareType === 'cross-year' ? 1 : 2} SELECTED
              </p>
              <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {drivers.map(d => (
                  <button key={d.tla} onClick={() => toggleDriver(d.tla)}
                    className={`p-3 border-2 text-center transition-all duration-150 cursor-pointer ${
                      selectedDrivers.includes(d.tla) ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                    }`}>
                    <span className="w-full h-1 block mb-2" style={{ backgroundColor: `#${d.team_colour}` }} />
                    <span className="font-mono text-xs font-bold">{d.tla}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(2)}
              className="px-6 py-3 border-2 border-gray-300 font-mono text-xs font-bold hover:border-black transition-all duration-200 cursor-pointer flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> BACK
            </button>
            <button onClick={() => setStep(4)} disabled={!canProceed()}
              className="px-6 py-3 border-2 border-black bg-black text-white font-mono text-xs font-bold hover:bg-white hover:text-black transition-all duration-200 cursor-pointer disabled:opacity-30 flex items-center gap-2">
              NEXT <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Select Metrics */}
      {step === 4 && (
        <div className="border-2 border-black bg-white p-6">
          <h2 className="text-xl font-bold mb-1">Select Metrics</h2>
          <p className="text-xs font-mono text-gray-400 mb-6">CHOOSE WHAT TO COMPARE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {METRICS.map(m => (
              <label key={m.value}
                className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all duration-150 ${
                  selectedMetrics.includes(m.value) ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                }`}>
                <input type="checkbox" checked={selectedMetrics.includes(m.value)}
                  onChange={() => toggleMetric(m.value)} className="w-4 h-4" />
                <span className="font-mono text-xs font-bold">{m.label}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(3)}
              className="px-6 py-3 border-2 border-gray-300 font-mono text-xs font-bold hover:border-black transition-all duration-200 cursor-pointer flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> BACK
            </button>
            <button onClick={fetchResults} disabled={!canProceed() || resultsLoading}
              className="px-8 py-3 border-2 border-black bg-black text-white font-mono text-xs font-bold hover:bg-white hover:text-black transition-all duration-200 cursor-pointer disabled:opacity-30 flex items-center gap-2">
              {resultsLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> LOADING...</> : <>COMPARE <ArrowRight className="w-3 h-3" /></>}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Results */}
      {step === 5 && results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Results</h2>
            <button onClick={() => { setStep(1); setResults(null); setSelectedDrivers([]); setSelectedTeams([]); }}
              className="px-4 py-2 border-2 border-black font-mono text-xs font-bold hover:bg-black hover:text-white transition-all duration-200 cursor-pointer">
              NEW COMPARISON
            </button>
          </div>

          {/* Lap Times Comparison */}
          {selectedMetrics.includes('lap-times') && (
            <div className="border-2 border-black bg-white p-6">
              <h3 className="text-lg font-bold mb-1">Lap Times</h3>
              <p className="text-xs font-mono text-gray-400 mb-4">OVERLAY COMPARISON</p>
              <LapTimesChart results={results} drivers={drivers} />
            </div>
          )}

          {/* Strategy Comparison */}
          {selectedMetrics.includes('strategy') && (
            <div className="border-2 border-black bg-white p-6">
              <h3 className="text-lg font-bold mb-1">Tyre Strategy</h3>
              <p className="text-xs font-mono text-gray-400 mb-4">STINT COMPARISON</p>
              <StrategyChart results={results} drivers={drivers} />
            </div>
          )}

          {/* Pit Stops */}
          {selectedMetrics.includes('pit-stops') && results.pits && (
            <div className="border-2 border-black bg-white p-6">
              <h3 className="text-lg font-bold mb-1">Pit Stops</h3>
              <p className="text-xs font-mono text-gray-400 mb-4">COMPARISON TABLE</p>
              <PitStopsTable results={results} />
            </div>
          )}

          {/* Speed Traps */}
          {selectedMetrics.includes('speed-traps') && (
            <div className="border-2 border-black bg-white p-6">
              <h3 className="text-lg font-bold mb-1">Speed Traps</h3>
              <p className="text-xs font-mono text-gray-400 mb-4">TOP SPEED COMPARISON</p>
              <SpeedChart results={results} drivers={drivers} />
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function LapTimesChart({ results, drivers }: { results: any; drivers: Driver[] }) {
  if (results.compareType === 'driver-vs-driver' && results.laps) {
    // Merge lap times into chart data
    const allLaps: Record<number, any> = {};
    Object.entries(results.laps).forEach(([driverTla, dData]: [string, any]) => {
      const driverLaps = Object.values(dData?.drivers || {})[0] as any;
      driverLaps?.laps?.forEach((l: any) => {
        if (!allLaps[l.lap]) allLaps[l.lap] = { lap: l.lap };
        const t = parseTime(l.time);
        if (t && t < 200) allLaps[l.lap][driverTla] = t;
      });
    });
    const chartData = Object.values(allLaps).sort((a: any, b: any) => a.lap - b.lap);
    const colors = results.selectedDrivers.map((tla: string) => {
      const d = drivers.find(d => d.tla === tla);
      return `#${d?.team_colour || '000'}`;
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="lap" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
            label={{ value: 'LAP', position: 'insideBottom', offset: -10, style: { ...CHART_AXIS, fontWeight: 700 } }} />
          <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: 'SECONDS', angle: -90, position: 'insideLeft', style: { ...CHART_AXIS, fontWeight: 700 } }} />
          <Tooltip {...CHART_TOOLTIP} formatter={(v: any) => [`${Number(v).toFixed(3)}s`, '']} />
          {results.selectedDrivers.map((tla: string, i: number) => (
            <Line key={tla} type="monotone" dataKey={tla} stroke={colors[i]} dot={false} strokeWidth={2.5} name={tla} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (results.compareType === 'cross-year' && results.byYear) {
    const allLaps: Record<number, any> = {};
    results.years.forEach((y: number) => {
      const yearData = results.byYear[y]?.laps;
      if (!yearData) return;
      const driverData = Object.values(yearData.drivers || {})[0] as any;
      driverData?.laps?.forEach((l: any) => {
        if (!allLaps[l.lap]) allLaps[l.lap] = { lap: l.lap };
        const t = parseTime(l.time);
        if (t && t < 200) allLaps[l.lap][`${y}`] = t;
      });
    });
    const chartData = Object.values(allLaps).sort((a: any, b: any) => a.lap - b.lap);
    const yearColors = ['#E8002D', '#3671C6', '#FF8000', '#39B54A', '#FFC700'];

    return (
      <div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="lap" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
            <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip {...CHART_TOOLTIP} formatter={(v: any) => [`${Number(v).toFixed(3)}s`, '']} />
            {results.years.map((y: number, i: number) => (
              <Line key={y} type="monotone" dataKey={`${y}`} stroke={yearColors[i % yearColors.length]} dot={false} strokeWidth={2.5} name={`${y}`} />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200">
          {results.years.map((y: number, i: number) => (
            <span key={y} className="flex items-center gap-1.5 text-xs font-mono font-bold">
              <span className="w-4 h-1.5" style={{ backgroundColor: yearColors[i % yearColors.length] }} />
              {y}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (results.compareType === 'team-vs-team' && results.laps) {
    const allLaps: Record<number, any> = {};
    const teamDrivers = results.teams || [];
    Object.entries(results.laps?.drivers || {}).forEach(([tla, dData]: [string, any]) => {
      if (!teamDrivers.includes(dData.team)) return;
      dData.laps?.forEach((l: any) => {
        if (!allLaps[l.lap]) allLaps[l.lap] = { lap: l.lap };
        const t = parseTime(l.time);
        if (t && t < 200) allLaps[l.lap][tla] = t;
      });
    });
    const chartData = Object.values(allLaps).sort((a: any, b: any) => a.lap - b.lap);

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="lap" tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip {...CHART_TOOLTIP} />
          {Object.entries(results.laps?.drivers || {}).map(([tla, dData]: [string, any]) => {
            if (!teamDrivers.includes(dData.team)) return null;
            return <Line key={tla} type="monotone" dataKey={tla} stroke={`#${dData.team_colour}`} dot={false} strokeWidth={2} name={tla} />;
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return <div className="text-sm font-mono text-gray-400">No lap time data available</div>;
}

function StrategyChart({ results, drivers }: { results: any; drivers: Driver[] }) {
  const strategyData = results.compareType === 'cross-year'
    ? null  // Cross-year strategy handled separately
    : results.strategy;

  if (!strategyData && results.compareType !== 'cross-year') {
    return <div className="text-sm font-mono text-gray-400">No strategy data</div>;
  }

  const strategies = strategyData?.strategies || [];
  const filtered = results.compareType === 'driver-vs-driver'
    ? strategies.filter((s: any) => results.selectedDrivers.includes(s.tla))
    : results.compareType === 'team-vs-team'
    ? strategies.filter((s: any) => results.teams?.includes(s.team))
    : strategies;

  if (results.compareType === 'cross-year') {
    return (
      <div className="space-y-4">
        {results.years.map((y: number) => {
          const yearStrategy = results.byYear[y]?.strategy?.strategies || [];
          const driverStrat = yearStrategy.find((s: any) => s.tla === results.driver);
          if (!driverStrat) return <div key={y} className="text-xs font-mono text-gray-400">{y}: No data</div>;
          const totalLaps = driverStrat.stints.reduce((sum: number, st: any) => sum + (st.laps || 0), 0);
          return (
            <div key={y} className="flex items-center gap-3">
              <span className="w-12 font-mono text-sm font-bold">{y}</span>
              <div className="flex-1 flex h-8 border-2 border-black overflow-hidden">
                {driverStrat.stints.map((st: any, i: number) => (
                  <div key={i} className="h-full flex items-center justify-center text-[10px] font-mono font-bold border-r border-white/50"
                    style={{
                      width: `${totalLaps > 0 ? (st.laps / totalLaps) * 100 : 0}%`,
                      backgroundColor: COMPOUND_COLORS[st.compound] || '#ccc',
                      color: st.compound === 'HARD' ? '#333' : '#fff',
                      minWidth: '20px',
                    }}>
                    {st.compound?.[0]}{st.laps}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((s: any) => {
        const totalLaps = s.stints.reduce((sum: number, st: any) => sum + (st.laps || 0), 0);
        return (
          <div key={s.tla} className="flex items-center gap-3">
            <span className="w-1 h-6" style={{ backgroundColor: `#${s.team_colour}` }} />
            <span className="w-10 font-mono text-xs font-bold">{s.tla}</span>
            <div className="flex-1 flex h-8 border-2 border-black overflow-hidden">
              {s.stints.map((st: any, i: number) => (
                <div key={i} className="h-full flex items-center justify-center text-[10px] font-mono font-bold border-r border-white/50"
                  style={{
                    width: `${totalLaps > 0 ? (st.laps / totalLaps) * 100 : 0}%`,
                    backgroundColor: COMPOUND_COLORS[st.compound] || '#ccc',
                    color: st.compound === 'HARD' ? '#333' : '#fff',
                    minWidth: '20px',
                  }}>
                  {st.compound?.[0]}{st.laps}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PitStopsTable({ results }: { results: any }) {
  const stops = results.pits?.pit_stops || [];
  const filtered = results.compareType === 'driver-vs-driver'
    ? stops.filter((s: any) => results.selectedDrivers.includes(s.tla))
    : results.compareType === 'team-vs-team'
    ? stops.filter((s: any) => results.teams?.includes(s.team))
    : stops;

  return (
    <table className="w-full text-sm font-mono">
      <thead>
        <tr className="text-[10px] tracking-widest text-gray-400 border-b-2 border-black">
          <th className="text-left py-2 px-3">DRIVER</th>
          <th className="text-right py-2 px-3">LAP</th>
          <th className="text-right py-2 px-3">STOP TIME</th>
          <th className="text-right py-2 px-3">LANE TIME</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((s: any, i: number) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-100">
            <td className="py-2 px-3">
              <span className="inline-block w-1 h-4 mr-2 align-middle" style={{ backgroundColor: `#${s.team_colour}` }} />
              <span className="font-bold">{s.tla}</span>
            </td>
            <td className="text-right py-2 px-3">L{s.lap}</td>
            <td className="text-right py-2 px-3 font-bold">{s.pit_stop_time}s</td>
            <td className="text-right py-2 px-3 text-gray-500">{s.pit_lane_time}s</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SpeedChart({ results, drivers }: { results: any; drivers: Driver[] }) {
  if (results.compareType === 'cross-year' && results.byYear) {
    const chartData = results.years.map((y: number) => {
      const speedData = results.byYear[y]?.speed?.speed_traps || [];
      const driverSpeed = speedData.find((s: any) => s.tla === results.driver);
      return { year: y, ST: parseInt(driverSpeed?.ST) || 0, I1: parseInt(driverSpeed?.I1) || 0, FL: parseInt(driverSpeed?.FL) || 0 };
    });

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid {...CHART_GRID} />
          <XAxis dataKey="year" tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <YAxis domain={['dataMin - 10', 'dataMax + 5']} tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
          <Tooltip {...CHART_TOOLTIP} />
          <Bar dataKey="ST" name="Speed Trap" fill="#000" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  const speedData = results.speed?.speed_traps || [];
  const filtered = results.compareType === 'driver-vs-driver'
    ? speedData.filter((s: any) => results.selectedDrivers.includes(s.tla))
    : results.compareType === 'team-vs-team'
    ? speedData.filter((s: any) => results.teams?.includes(s.team))
    : speedData;

  const chartData = filtered.map((s: any) => ({
    tla: s.tla, ST: parseInt(s.ST) || 0, team_colour: s.team_colour,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid {...CHART_GRID} />
        <XAxis dataKey="tla" tick={{ ...CHART_AXIS, fontWeight: 700 }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
        <YAxis domain={['dataMin - 10', 'dataMax + 5']} tick={CHART_AXIS} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
        <Tooltip {...CHART_TOOLTIP} />
        <Bar dataKey="ST" name="Speed Trap km/h" barSize={20}>
          {chartData.map((d: any) => (
            <Cell key={d.tla} fill={`#${d.team_colour}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
