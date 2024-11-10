import { useState, useEffect } from 'react'
import { ReactElement } from 'react'

export interface NotificationPreference {
  category: 'usage' | 'subscription' | 'system'
  enabled: boolean
  label: string
  description: string
  icon?: ReactElement // Make icon optional
}

export interface NotificationSettings {
  soundEnabled: boolean
  persistenceDuration: number
  preferences: NotificationPreference[]
}

const DEFAULT_PREFERENCES: NotificationSettings = {
  soundEnabled: true,
  persistenceDuration: 5,
  preferences: [
    {
      category: 'usage',
      enabled: true,
      label: 'Usage Alerts',
      description: 'Notifications about resource usage and limits'
    },
    {
      category: 'subscription',
      enabled: true,
      label: 'Subscription Updates',
      description: 'Payment and subscription status notifications'
    },
    {
      category: 'system',
      enabled: true,
      label: 'System Notifications',
      description: 'Important system updates and announcements'
    }
  ]
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem('notification_preferences')
    if (stored) {
      return JSON.parse(stored)
    }
    return DEFAULT_PREFERENCES
  })

  useEffect(() => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences))
  }, [preferences])

  const updatePreferences = (newPreferences: Partial<NotificationSettings>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }))
  }

  const toggleCategory = (category: 'usage' | 'subscription' | 'system') => {
    setPreferences(prev => ({
      ...prev,
      preferences: prev.preferences.map(pref =>
        pref.category === category
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    }))
  }

  const isCategoryEnabled = (category: 'usage' | 'subscription' | 'system') => {
    return preferences.preferences.find(pref => pref.category === category)?.enabled ?? true
  }

  const shouldPlaySound = () => preferences.soundEnabled

  const getPersistenceDuration = () => preferences.persistenceDuration * 60 * 1000 // Convert minutes to milliseconds

  return {
    preferences,
    updatePreferences,
    toggleCategory,
    isCategoryEnabled,
    shouldPlaySound,
    getPersistenceDuration
  }
}
