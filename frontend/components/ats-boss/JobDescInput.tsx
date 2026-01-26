interface JobDescInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function JobDescInput({
  value,
  onChange,
  placeholder = 'Paste the complete job description here...'
}: JobDescInputProps) {
  const charCount = value.length;
  const minChars = 50;
  const isValid = charCount >= minChars;

  return (
    <div className="space-y-2">
      <label htmlFor="job-description" className="block text-sm font-medium">
        Job Description
      </label>

      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={12}
        className="w-full px-4 py-3 border-2 border-black bg-white font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-black"
      />

      <div className="flex items-center justify-between text-xs font-mono">
        <span className={charCount < minChars ? 'text-red-600' : 'text-gray-600'}>
          {charCount} characters {!isValid && `(minimum ${minChars} required)`}
        </span>
        {isValid && (
          <span className="text-green-600">
            Ready to analyze
          </span>
        )}
      </div>
    </div>
  );
}
