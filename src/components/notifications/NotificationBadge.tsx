import { useUsageNotifications } from '../../contexts/UsageNotificationContext'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className = '' }: NotificationBadgeProps) {
  const { notifications } = useUsageNotifications()

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  if (notifications.length === 0) {
    return (
      <Link 
        to="/notification-history"
        className={`relative inline-flex items-center justify-center ${className}`}
      >
        <Bell className="w-5 h-5 text-white/60 hover:text-white/80 transition-colors" />
      </Link>
    )
  }

  // Get the most severe notification type
  const hasCritical = notifications.some(n => n.type === 'error')
  const hasWarning = notifications.some(n => n.type === 'warning')

  const getBadgeColor = () => {
    if (hasCritical) return 'bg-red-500'
    if (hasWarning) return 'bg-yellow-500'
    return 'bg-[#63248d]'
  }

  return (
    <Link 
      to="/notification-history"
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Bell 
        className={`w-5 h-5 ${
          hasCritical 
            ? 'text-red-400' 
            : hasWarning 
              ? 'text-yellow-400' 
              : 'text-[#63248d]'
        } transition-colors`} 
      />
      
      {/* Notification count badge */}
      {unreadCount > 0 && (
        <span 
          className={`absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white rounded-full ${getBadgeColor()}`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {/* Ping animation for new notifications */}
      {unreadCount > 0 && (
        <span 
          className={`absolute -top-1 -right-1 animate-ping w-4 h-4 rounded-full opacity-75 ${getBadgeColor()}`} 
        />
      )}
    </Link>
  )
}
