import { AlertTriangle, X, AlertCircle, Bell, CreditCard, Activity, ChevronRight } from 'lucide-react'
import { useUsageNotifications } from '../../contexts/UsageNotificationContext'
import { useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { UsageNotification } from '../../services/notification.service'

// Sound effects for notifications
const NOTIFICATION_SOUNDS = {
  error: new Audio('/sounds/error.mp3'),
  warning: new Audio('/sounds/warning.mp3'),
  success: new Audio('/sounds/success.mp3')
}

const MAX_VISIBLE_NOTIFICATIONS = 5

export function UsageNotifications() {
  const { notifications, removeNotification } = useUsageNotifications()
  const previousCount = useRef(notifications.length)

  // Group notifications by category
  const groupedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp)
    const visible = sorted.slice(0, MAX_VISIBLE_NOTIFICATIONS)
    const grouped = visible.reduce((acc, notification) => {
      const category = notification.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(notification)
      return acc
    }, {} as Record<string, UsageNotification[]>)

    // Sort categories by priority
    const categoryOrder = ['error', 'warning', 'subscription', 'usage', 'system']
    return Object.entries(grouped).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a[0])
      const bIndex = categoryOrder.indexOf(b[0])
      return aIndex - bIndex
    })
  }, [notifications])

  // Play sound when new notifications arrive
  useEffect(() => {
    if (notifications.length > previousCount.current) {
      const latestNotification = notifications[notifications.length - 1]
      if (latestNotification.type in NOTIFICATION_SOUNDS) {
        NOTIFICATION_SOUNDS[latestNotification.type as keyof typeof NOTIFICATION_SOUNDS]
          .play()
          .catch(err => console.error('Error playing notification sound:', err))
      }
    }
    previousCount.current = notifications.length
  }, [notifications])

  if (notifications.length === 0) return null

  const getIcon = (notification: UsageNotification) => {
    switch (notification.category) {
      case 'subscription':
        return <CreditCard className={`w-5 h-5 ${getIconColor(notification.type)}`} />
      case 'usage':
        return <Activity className={`w-5 h-5 ${getIconColor(notification.type)}`} />
      case 'system':
        return <Bell className={`w-5 h-5 ${getIconColor(notification.type)}`} />
      default:
        return notification.type === 'error' 
          ? <AlertCircle className={`w-5 h-5 ${getIconColor(notification.type)}`} />
          : <AlertTriangle className={`w-5 h-5 ${getIconColor(notification.type)}`} />
    }
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

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md w-full">
      {/* View All Link */}
      {notifications.length > MAX_VISIBLE_NOTIFICATIONS && (
        <Link
          to="/notification-history"
          className="block text-sm text-white/60 hover:text-white/80 transition-colors text-right mb-2"
        >
          View all notifications ({notifications.length})
          <ChevronRight className="inline-block w-4 h-4 ml-1" />
        </Link>
      )}

      {/* Grouped Notifications */}
      {groupedNotifications.map(([category, categoryNotifications]) => (
        <div key={category} className="space-y-2">
          {categoryNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border animate-slide-in ${
                getBackgroundColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  {getIcon(notification)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${getIconColor(notification.type)}`}>
                    {notification.message}
                  </p>
                  {notification.category === 'usage' && notification.percentage && (
                    <div className="mt-2">
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={`rounded-full h-1.5 transition-all ${
                            notification.percentage >= 90 
                              ? 'bg-red-400' 
                              : notification.percentage >= 75 
                                ? 'bg-yellow-400' 
                                : 'bg-[#63248d]'
                          }`}
                          style={{ width: `${notification.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {notification.persistent && (
                    <p className="mt-1 text-xs text-white/40">
                      This notification will remain until addressed
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                      getIconColor(notification.type)
                    }`}
                    onClick={() => removeNotification(notification.id)}
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Add animation keyframes to your global CSS
const styles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
`

// Create a style element and append it to the document head
const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)
