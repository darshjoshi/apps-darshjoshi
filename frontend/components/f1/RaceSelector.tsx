'use client';

interface Season { year: number; events: number; }
interface Race { name: string; location: string; country: string; }

interface RaceSelectorProps {
  seasons: Season[];
  races: Race[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedRace: string;
  setSelectedRace: (race: string) => void;
  racePickerOpen: boolean;
  setRacePickerOpen: (open: boolean) => void;
}

export function RaceSelector({
  seasons, races, selectedYear, setSelectedYear,
  selectedRace, setSelectedRace, racePickerOpen, setRacePickerOpen,
}: RaceSelectorProps) {
  return (
    <section className="mb-4">
      <div className="border-2 border-black bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-black to-red-500" />
        <div className="flex items-center gap-0 divide-x-2 divide-black pt-0.5">
          <div className="flex items-center gap-0.5 px-3 py-2 shrink-0">
            {seasons.map(s => (
              <button key={s.year} onClick={() => { setSelectedYear(s.year); setSelectedRace(''); setRacePickerOpen(false); }}
                className={`px-2.5 py-1 font-mono text-xs font-bold transition-all duration-150 cursor-pointer ${
                  selectedYear === s.year
                    ? 'bg-black text-white'
                    : 'text-gray-400 hover:text-black'
                }`}>
                {s.year}
              </button>
            ))}
          </div>
          <button
            onClick={() => setRacePickerOpen(!racePickerOpen)}
            className="flex-1 flex items-center justify-between px-4 py-2.5 font-mono text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <span>{selectedRace ? (races.find(r => r.name === selectedRace)?.location || selectedRace) : 'Select Grand Prix'}</span>
            <span className={`text-gray-400 transition-transform duration-200 ${racePickerOpen ? 'rotate-180' : ''}`}>&#9662;</span>
          </button>
        </div>
        {racePickerOpen && (
          <div className="border-t-2 border-black p-3 bg-gray-50">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
              {races.map(r => (
                <button key={r.name}
                  onClick={() => { setSelectedRace(r.name); setRacePickerOpen(false); }}
                  className={`px-2 py-2 font-mono text-[11px] font-bold transition-all duration-150 cursor-pointer text-center ${
                    selectedRace === r.name
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-black hover:text-black'
                  }`}>
                  {r.location || r.country}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
