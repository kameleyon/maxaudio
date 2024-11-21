interface NotificationFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function NotificationFilters({ activeFilter, onFilterChange }: NotificationFiltersProps) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'articles', label: 'Articles' },
    { id: 'changelog', label: 'Changelog' }
  ]

  return (
    <div className="flex gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeFilter === filter.id
              ? 'bg-primary text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}