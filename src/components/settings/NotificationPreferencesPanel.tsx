import { useState } from 'react'
import { Bell, Volume2, Volume1, VolumeX, Clock, Filter } from 'lucide-react'
import { useUsageNotifications } from '../../contexts/UsageNotificationContext'

interface NotificationPreference {
  category: 'usage' | 'subscription' | 'system'
  enabled: boolean
  label: string
  description: string
  icon: JSX.Element
}

interface NotificationSettings {
  soundEnabled: boolean
  persistenceDuration: number
  preferences: NotificationPreference[]
}

export function NotificationPreferencesPanel() {
  // Get notification preferences from localStorage or use defaults
  const getStoredPreferences = (): NotificationSettings => {
    const stored = localStorage.getItem('notification_preferences')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      soundEnabled: true,
      persistenceDuration: 5, // minutes
      preferences: [
        {
          category: 'usage',
          enabled: true,
          label: 'Usage Alerts',
          description: 'Notifications about resource usage and limits',
          icon: <Filter className="w-5 h-5" />
        },
        {
          category: 'subscription',
          enabled: true,
          label: 'Subscription Updates',
          description: 'Payment and subscription status notifications',
          icon: <Bell className="w-5 h-5" />
        },
        {
          category: 'system',
          enabled: true,
          label: 'System Notifications',
          description: 'Important system updates and announcements',
          icon: <Bell className="w-5 h-5" />
        }
      ]
    }
  }

  const [preferences, setPreferences] = useState<NotificationSettings>(getStoredPreferences())

  // Save preferences to localStorage when they change
  const savePreferences = (newPreferences: NotificationSettings) => {
    localStorage.setItem('notification_preferences', JSON.stringify(newPreferences))
    setPreferences(newPreferences)
  }

  const toggleSound = () => {
    savePreferences({
      ...preferences,
      soundEnabled: !preferences.soundEnabled
    })
  }

  const updatePersistenceDuration = (minutes: number) => {
    savePreferences({
      ...preferences,
      persistenceDuration: minutes
    })
  }

  const toggleCategory = (category: 'usage' | 'subscription' | 'system') => {
    savePreferences({
      ...preferences,
      preferences: preferences.preferences.map(pref =>
        pref.category === category
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
        <p className="text-white/60">Customize how you receive notifications</p>
      </div>

      {/* Sound Settings */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {preferences.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#63248d]" />
            ) : (
              <VolumeX className="w-5 h-5 text-white/40" />
            )}
            <div>
              <h3 className="font-medium">Notification Sounds</h3>
              <p className="text-sm text-white/60">Play sounds for important notifications</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.soundEnabled ? 'bg-[#63248d]' : 'bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Persistence Duration */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-[#63248d]" />
          <div>
            <h3 className="font-medium">Notification Duration</h3>
            <p className="text-sm text-white/60">How long notifications remain visible</p>
          </div>
        </div>
        <div className="flex gap-4">
          {[1, 5, 15, 30].map(minutes => (
            <button
              key={minutes}
              onClick={() => updatePersistenceDuration(minutes)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                preferences.persistenceDuration === minutes
                  ? 'bg-[#63248d] text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>
      </div>

      {/* Category Preferences */}
      <div className="space-y-4">
        {preferences.preferences.map((pref: NotificationPreference) => (
          <div
            key={pref.category}
            className="bg-white/5 rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={pref.enabled ? 'text-[#63248d]' : 'text-white/40'}>
                  {pref.icon}
                </div>
                <div>
                  <h3 className="font-medium">{pref.label}</h3>
                  <p className="text-sm text-white/60">{pref.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleCategory(pref.category)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-[#63248d]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
