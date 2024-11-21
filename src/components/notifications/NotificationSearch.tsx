import { Search, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface NotificationSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function NotificationSearch({ onSearch, placeholder = 'Search notifications...' }: NotificationSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div
      className={`relative flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg transition-all ${
        isFocused 
          ? 'ring-2 ring-blue-400/50 bg-white/10' 
          : 'hover:bg-white/10 border border-white/10'
      }`}
    >
      <Search className={`w-4 h-4 transition-colors ${
        isFocused ? 'text-blue-400' : 'text-white/40'
      }`} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none text-sm text-white/90 placeholder:text-white/40"
      />
      {query && (
        <button
          onClick={handleClear}
          className={`p-1 rounded-full transition-colors ${
            isFocused
              ? 'hover:bg-blue-400/20 text-blue-400'
              : 'hover:bg-white/10 text-white/40'
          }`}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Search Results Count */}
      {query && (
        <div className="absolute -bottom-6 left-0 text-xs text-white/60">
          Press Enter to search
        </div>
      )}
    </div>
  )
}
