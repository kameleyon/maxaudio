import { useMemo } from 'react'
import { useUsageNotifications } from '../../contexts/UsageNotificationContext'
import { notificationAnalytics } from '../../services/notification-analytics.service'
import { Activity, AlertCircle, Bell, Clock, Calendar, TrendingUp } from 'lucide-react'

export function NotificationAnalyticsDashboard() {
  const { notifications } = useUsageNotifications()
  const analytics = useMemo(() => 
    notificationAnalytics.analyzeNotifications(notifications), 
    [notifications]
  )
  const patterns = useMemo(() => 
    notificationAnalytics.getNotificationPatterns(notifications),
    [notifications]
  )

  const getPercentage = (count: number) => 
    ((count / analytics.totalCount) * 100).toFixed(1)

  // Create hour labels (00:00 - 23:00)
  const hourLabels = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`
  )

  // Find the max value for scaling
  const maxHourlyCount = Math.max(...Object.values(analytics.byHour))

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Total Notifications</h3>
          </div>
          <div className="text-3xl font-bold">{analytics.totalCount}</div>
          <div className="mt-2 text-sm text-white/60">
            {analytics.unreadCount} unread
          </div>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Average Response Time</h3>
          </div>
          <div className="text-3xl font-bold">
            {notificationAnalytics.formatDuration(analytics.responseTime.average)}
          </div>
          <div className="mt-2 text-sm text-white/60">
            For read notifications
          </div>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Daily Average</h3>
          </div>
          <div className="text-3xl font-bold">
            {(analytics.trends.daily.reduce((a, b) => a + b, 0) / 30).toFixed(1)}
          </div>
          <div className="mt-2 text-sm text-white/60">
            Over the last 30 days
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* By Type */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="font-medium mb-4">Distribution by Type</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{type}</span>
                  <span>{count} ({getPercentage(count)}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`rounded-full h-2 ${
                      type === 'error' 
                        ? 'bg-red-400' 
                        : type === 'warning'
                          ? 'bg-yellow-400'
                          : 'bg-blue-400'
                    }`}
                    style={{ width: `${(count / analytics.totalCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white/5 rounded-lg border border-white/10 p-6">
          <h3 className="font-medium mb-4">Distribution by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byCategory).map(([category, count]) => (
              <div key={category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{category}</span>
                  <span>{count} ({getPercentage(count)}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-400 rounded-full h-2"
                    style={{ width: `${(count / analytics.totalCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <h3 className="font-medium mb-6">Hourly Distribution</h3>
        <div className="h-40 flex items-end gap-1">
          {hourLabels.map((hour, index) => (
            <div
              key={hour}
              className="flex-1 flex flex-col items-center"
            >
              <div 
                className="w-full bg-blue-400/80 hover:bg-blue-400 transition-colors rounded-t"
                style={{ 
                  height: `${(analytics.byHour[index] / maxHourlyCount) * 100}%`,
                  minHeight: analytics.byHour[index] > 0 ? '2px' : '0'
                }}
              />
              <div className="text-xs text-white/40 mt-2 rotate-45 origin-left">
                {hour}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns & Insights */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="font-medium">Patterns & Insights</h3>
        </div>
        <div className="space-y-2">
          {patterns.map((pattern, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {pattern}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
