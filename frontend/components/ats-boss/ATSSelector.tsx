interface ATSSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ATSSelector({ value, onChange }: ATSSelectorProps) {
  const systems = [
    {
      id: 'workday',
      name: 'Workday',
      desc: 'Exact keyword matching',
      badge: 'MOST STRICT',
      color: 'red'
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      desc: 'Semantic understanding',
      badge: 'MOST POPULAR',
      color: 'green'
    },
    {
      id: 'ashby',
      name: 'Ashby',
      desc: 'AI-powered matching',
      badge: 'CUTTING-EDGE AI',
      color: 'purple'
    },
  ];

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      default: return 'bg-black';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium font-mono">
        SELECT ATS SYSTEM
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systems.map((system) => (
          <button
            key={system.id}
            type="button"
            onClick={() => onChange(system.id)}
            className={`
              relative p-4 border-2 transition-all text-left
              ${value === system.id
                ? 'border-black bg-black text-white shadow-lg scale-105'
                : 'border-black bg-white text-black hover:bg-gray-50'
              }
            `}
          >
            <div className={`
              inline-block px-2 py-1 text-xs font-mono font-bold mb-2
              ${value === system.id
                ? 'bg-white text-black'
                : `${getBadgeColor(system.color)} text-white border border-black`
              }
            `}>
              {system.badge}
            </div>
            <div className="text-lg font-bold mb-1">{system.name}</div>
            <div className={`text-xs ${value === system.id ? 'text-gray-300' : 'text-gray-600'}`}>
              {system.desc}
            </div>

            {/* Selection indicator */}
            {value === system.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">✓</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
