interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  value: string;
  onChange: (value: any) => void;
  options: ToggleOption[];
}

export function Toggle({ value, onChange, options }: ToggleProps) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            value === option.value
              ? 'bg-[#63248d]/80 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
