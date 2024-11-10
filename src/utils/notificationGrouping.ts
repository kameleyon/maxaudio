import { UsageNotification } from '../services/notification.service'
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

export interface NotificationGroup {
  title: string
  notifications: UsageNotification[]
  timestamp: number
  category?: string
}

export function groupNotificationsByTime(notifications: UsageNotification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = []
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

  // Helper function to add a notification to a group
  const addToGroup = (notification: UsageNotification, title: string) => {
    let group = groups.find(g => g.title === title)
    if (!group) {
      group = {
        title,
        notifications: [],
        timestamp: notification.timestamp
      }
      groups.push(group)
    }
    group.notifications.push(notification)
  }

  sortedNotifications.forEach(notification => {
    const date = new Date(notification.timestamp)
    
    if (isToday(date)) {
      addToGroup(notification, 'Today')
    } else if (isYesterday(date)) {
      addToGroup(notification, 'Yesterday')
    } else if (isThisWeek(date)) {
      addToGroup(notification, 'This Week')
    } else if (isThisMonth(date)) {
      addToGroup(notification, 'This Month')
    } else {
      const monthYear = format(date, 'MMMM yyyy')
      addToGroup(notification, monthYear)
    }
  })

  return groups.sort((a, b) => b.timestamp - a.timestamp)
}

export function groupNotificationsByCategory(notifications: UsageNotification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = []
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

  // Group by category
  sortedNotifications.forEach(notification => {
    let group = groups.find(g => g.category === notification.category)
    if (!group) {
      group = {
        title: getCategoryTitle(notification.category),
        category: notification.category,
        notifications: [],
        timestamp: notification.timestamp
      }
      groups.push(group)
    }
    group.notifications.push(notification)
  })

  return groups.sort((a, b) => b.timestamp - a.timestamp)
}

function getCategoryTitle(category: string): string {
  switch (category) {
    case 'usage':
      return 'Usage Alerts'
    case 'subscription':
      return 'Subscription Updates'
    case 'system':
      return 'System Notifications'
    default:
      return 'Other Notifications'
  }
}

export function groupNotificationsByType(notifications: UsageNotification[]): NotificationGroup[] {
  const groups: NotificationGroup[] = []
  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

  // Group by type (error, warning, success, info)
  sortedNotifications.forEach(notification => {
    let group = groups.find(g => g.category === notification.type)
    if (!group) {
      group = {
        title: getTypeTitle(notification.type),
        category: notification.type,
        notifications: [],
        timestamp: notification.timestamp
      }
      groups.push(group)
    }
    group.notifications.push(notification)
  })

  // Sort groups by priority (errors first, then warnings, etc.)
  return groups.sort((a, b) => {
    const priorityOrder = { error: 0, warning: 1, success: 2, info: 3 }
    return (priorityOrder[a.category as keyof typeof priorityOrder] || 4) -
           (priorityOrder[b.category as keyof typeof priorityOrder] || 4)
  })
}

function getTypeTitle(type: string): string {
  switch (type) {
    case 'error':
      return 'Errors'
    case 'warning':
      return 'Warnings'
    case 'success':
      return 'Success'
    case 'info':
      return 'Information'
    default:
      return 'Other'
  }
}

export function getNotificationSummary(notifications: UsageNotification[]): string {
  const unreadCount = notifications.filter(n => !n.read).length
  const errorCount = notifications.filter(n => n.type === 'error').length
  const warningCount = notifications.filter(n => n.type === 'warning').length

  if (errorCount > 0) {
    return `${unreadCount} unread, including ${errorCount} error${errorCount > 1 ? 's' : ''}`
  } else if (warningCount > 0) {
    return `${unreadCount} unread, including ${warningCount} warning${warningCount > 1 ? 's' : ''}`
  } else if (unreadCount > 0) {
    return `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
  }
  return 'No unread notifications'
}
