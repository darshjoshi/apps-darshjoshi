interface ATSSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ATSSelector({ value, onChange }: ATSSelectorProps) {
  const systems = [
    { id: 'workday', name: 'Workday', desc: 'Exact keyword matching' },
    { id: 'greenhouse', name: 'Greenhouse', desc: 'Semantic understanding' },
    { id: 'ashby', name: 'Ashby', desc: 'AI-powered matching' },
  ];

  return (
    <div className="space-y-2">
      <label htmlFor="ats-system" className="block text-sm font-medium">
        Select ATS System
      </label>
      <select
        id="ats-system"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-black bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="">Choose an ATS...</option>
        {systems.map((system) => (
          <option key={system.id} value={system.id}>
            {system.name} - {system.desc}
          </option>
        ))}
      </select>
    </div>
  );
}
