import { Star, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface FileFiltersProps {
  activeFilter: string
  showFavorites: boolean
  onFilterChange: (filter: string) => void
  onFavoritesChange: (show: boolean) => void
}

export function FileFilters({
  activeFilter,
  showFavorites,
  onFilterChange,
  onFavoritesChange
}: FileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filters = [
    { id: 'all', label: 'All Files' },
    { id: 'podcast', label: 'Podcast' },
    { id: 'tedtalk', label: 'TED Talk' },
    { id: 'news', label: 'News' },
    { id: 'narrative', label: 'Narrative' },
    { id: 'class', label: 'Class' },
    { id: 'advertisement', label: 'Advertisement' },
    { id: 'comedy', label: 'Stand-up Comedy' },
    { id: 'motivational', label: 'Motivational' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'mantra', label: 'Mantra' },
    { id: 'kids', label: 'Kids Content' },
    { id: 'archived', label: 'Archived' }
  ]

  const activeFilterLabel = filters.find(f => f.id === activeFilter)?.label || 'All Files'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onFavoritesChange(!showFavorites)}
        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
          showFavorites
            ? 'bg-primary text-white'
            : 'bg-white/5 text-white/80 hover:bg-white/10'
        }`}
      >
        <Star className="w-4 h-4" />
        <span>Favorites</span>
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-lg bg-white/5 text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2 min-w-[160px] justify-between"
        >
          <span>{activeFilterLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-[#0f0035] border border-white/10 rounded-lg shadow-lg py-1 max-h-64 overflow-y-auto">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  onFilterChange(filter.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                  activeFilter === filter.id
                    ? 'text-primary bg-white/5'
                    : 'text-white/80'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}