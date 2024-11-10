import { useState, useMemo } from 'react'
import { useUsageNotifications } from '../contexts/UsageNotificationContext'
import { AlertTriangle, AlertCircle, Bell, CreditCard, Activity, Calendar, Filter, Clock, BarChart } from 'lucide-react'
import { format } from 'date-fns'
import {
  groupNotificationsByTime,
  groupNotificationsByCategory,
  groupNotificationsByType,
  getNotificationSummary,
  type NotificationGroup
} from '../utils/notificationGrouping'
import { NotificationAnalyticsDashboard } from '../components/notifications/NotificationAnalyticsDashboard'
import { ExportNotificationsButton } from '../components/notifications/ExportNotificationsButton'
import { NotificationSearch } from '../components/notifications/NotificationSearch'

type GroupingMode = 'time' | 'category' | 'type'
type FilterType = 'all' | 'unread' | 'error' | 'warning'
type ViewMode = 'list' | 'analytics'

export function NotificationHistory() {
  const { notifications, markAllAsRead, markAsRead, removeNotification } = useUsageNotifications()
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('time')
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]
    
    // Apply type filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(n => !n.read)
        break
      case 'error':
        filtered = filtered.filter(n => n.type === 'error')
        break
      case 'warning':
        filtered = filtered.filter(n => n.type === 'warning')
        break
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.message.toLowerCase().includes(query) ||
        n.category.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [notifications, filter, searchQuery])

  // Group notifications
  const groups = useMemo(() => {
    switch (groupingMode) {
      case 'time':
        return groupNotificationsByTime(filteredNotifications)
      case 'category':
        return groupNotificationsByCategory(filteredNotifications)
      case 'type':
        return groupNotificationsByType(filteredNotifications)
      default:
        return groupNotificationsByTime(filteredNotifications)
    }
  }, [filteredNotifications, groupingMode])

  const getIcon = (type: string, category: string) => {
    if (category === 'subscription') return <CreditCard className="w-5 h-5" />
    if (category === 'usage') return <Activity className="w-5 h-5" />
    if (category === 'system') return <Bell className="w-5 h-5" />
    return type === 'error' 
      ? <AlertCircle className="w-5 h-5" />
      : <AlertTriangle className="w-5 h-5" />
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'success':
        return 'text-green-400'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notification History</h1>
          <p className="text-white/60 mt-1">{getNotificationSummary(notifications)}</p>
        </div>
        <div className="flex gap-4">
          <ExportNotificationsButton notifications={filteredNotifications} />
          <button
            onClick={() => markAllAsRead()}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 rounded-lg border border-white/10 p-1 flex">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              viewMode === 'analytics'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <BarChart className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>

      {viewMode === 'analytics' ? (
        <NotificationAnalyticsDashboard />
      ) : (
        <>
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Search */}
            <div className="md:col-span-2">
              <NotificationSearch
                onSearch={setSearchQuery}
                placeholder="Search by message, category, or type..."
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              {/* Grouping Mode */}
              <select
                value={groupingMode}
                onChange={(e) => setGroupingMode(e.target.value as GroupingMode)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/90"
              >
                <option value="time">Group by Time</option>
                <option value="category">Group by Category</option>
                <option value="type">Group by Type</option>
              </select>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/90"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          {searchQuery && (
            <div className="mb-6 text-sm text-white/60">
              Found {filteredNotifications.length} notifications
              {filter !== 'all' && ` (filtered by ${filter})`}
            </div>
          )}

          {/* Notification Groups */}
          <div className="space-y-8">
            {groups.map(group => (
              <div key={group.title} className="space-y-4">
                <h2 className="text-lg font-semibold text-white/80">{group.title}</h2>
                <div className="space-y-4">
                  {group.notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read ? 'bg-white/5' : 'bg-white/10'
                      } border-white/10`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 ${getIconColor(notification.type)}`}>
                          {getIcon(notification.type, notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/90">{notification.message}</p>
                          {notification.percentage && (
                            <div className="mt-2">
                              <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div
                                  className={`rounded-full h-1.5 transition-all ${
                                    notification.percentage >= 90 
                                      ? 'bg-red-400' 
                                      : notification.percentage >= 75 
                                        ? 'bg-yellow-400' 
                                        : 'bg-blue-400'
                                  }`}
                                  style={{ width: `${notification.percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                            <span>{format(notification.timestamp, 'PPp')}</span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {groups.length === 0 && (
              <div className="text-center py-12 text-white/60">
                {searchQuery
                  ? 'No notifications found matching your search'
                  : 'No notifications found'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
