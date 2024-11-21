import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full sm:w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files..."
        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg 
                 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
                 placeholder-white/50 text-white"
      />
    </div>
  )
}