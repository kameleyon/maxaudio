import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUsageStats } from '../hooks/useUsageStats'
import { notificationService, type UsageNotification } from '../services/notification.service'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'

interface UsageNotificationContextType {
  notifications: UsageNotification[]
  unreadCount: number
  addNotification: (notification: Omit<UsageNotification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  markAllAsRead: () => void
  markAsRead: (id: string) => void
}

const UsageNotificationContext = createContext<UsageNotificationContextType | undefined>(undefined)

// Sound effects for notifications
const NOTIFICATION_SOUNDS = {
  error: new Audio('/sounds/error.mp3'),
  warning: new Audio('/sounds/warning.mp3'),
  success: new Audio('/sounds/success.mp3'),
  info: new Audio('/sounds/info.mp3')
}

export function UsageNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<UsageNotification[]>(() => 
    notificationService.getStoredNotifications()
  )
  const { stats } = useUsageStats()
  const {
    isCategoryEnabled,
    shouldPlaySound,
    getPersistenceDuration
  } = useNotificationPreferences()

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Store notifications when they change
  useEffect(() => {
    notificationService.storeNotifications(
      notifications.filter(n => n.persistent)
    )
  }, [notifications])

  const addNotification = (notification: Omit<UsageNotification, 'id' | 'timestamp' | 'read'>) => {
    // Check if the category is enabled
    if (!isCategoryEnabled(notification.category)) {
      return
    }

    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Play sound if enabled
    if (shouldPlaySound() && notification.type in NOTIFICATION_SOUNDS) {
      NOTIFICATION_SOUNDS[notification.type as keyof typeof NOTIFICATION_SOUNDS]
        .play()
        .catch(err => console.error('Error playing notification sound:', err))
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications(prev => prev.filter(n => n.persistent))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Check usage limits and add warnings
  useEffect(() => {
    if (!stats) return

    // Character usage warnings
    const characterUsagePercent = (stats.current.charactersUsed / stats.limits.charactersPerMonth) * 100
    if (characterUsagePercent >= 75) {
      const notification = notificationService.createUsageNotification(
        characterUsagePercent >= 90 ? 'error' : 'warning',
        'characters',
        characterUsagePercent
      )
      addNotification(notification)
    }

    // Voice clone warnings
    const cloneUsagePercent = (stats.current.voiceClones / stats.limits.voiceClones) * 100
    if (cloneUsagePercent >= 75) {
      const notification = notificationService.createUsageNotification(
        cloneUsagePercent >= 90 ? 'error' : 'warning',
        'voice_clones',
        cloneUsagePercent
      )
      addNotification(notification)
    }

    // Rate limit warnings
    const rateUsagePercent = (stats.current.requestsThisMinute / stats.limits.requestsPerMinute) * 100
    if (rateUsagePercent >= 90) {
      const notification = notificationService.createUsageNotification(
        'warning',
        'api_requests',
        rateUsagePercent
      )
      addNotification(notification)
    }
  }, [stats])

  // Clean up old notifications based on persistence duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const persistenceDuration = getPersistenceDuration()
      setNotifications(prev => 
        prev.filter(notification => 
          notification.persistent || 
          now - notification.timestamp < persistenceDuration
        )
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [getPersistenceDuration])

  return (
    <UsageNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        clearNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </UsageNotificationContext.Provider>
  )
}

export function useUsageNotifications() {
  const context = useContext(UsageNotificationContext)
  if (context === undefined) {
    throw new Error('useUsageNotifications must be used within a UsageNotificationProvider')
  }
  return context
}
