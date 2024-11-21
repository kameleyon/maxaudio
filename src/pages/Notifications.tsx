import { useState } from 'react'
import { NotificationFilters } from '../components/notifications/NotificationFilters'
import { NotificationList } from '../components/notifications/NotificationList'
import { Settings } from 'lucide-react'

export function Notifications() {
  const [activeFilter, setActiveFilter] = useState('all')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Latest Updates</h1>
          <p className="text-white/60 mt-2">Stay informed about AUDIOMAX news and updates</p>
        </div>
        
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Notification Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <NotificationFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <NotificationList filter={activeFilter} />
    </div>
  )
}