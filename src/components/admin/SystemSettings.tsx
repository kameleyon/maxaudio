import { useState, useEffect } from 'react'
import { Save, RefreshCw, Database, HardDrive, Shield, Mail, Server, Settings } from 'lucide-react'

interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireMFA: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
  };
  storage: {
    maxUploadSize: number;
    allowedFileTypes: string[];
    compressionEnabled: boolean;
  };
  api: {
    rateLimit: number;
    timeout: number;
    maxRequestSize: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<keyof SystemSettings>('maintenance')

  // Fetch system settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/system-settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error fetching system settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearCache = async () => {
    try {
      await fetch('/api/admin/clear-cache', { method: 'POST' })
      // Show success message
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const tabs: { id: keyof SystemSettings; label: string; icon: any }[] = [
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'api', label: 'API', icon: Server },
    { id: 'cache', label: 'Cache', icon: Database }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">System Settings</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 -mb-px ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.maintenance.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    maintenance: {
                      ...settings.maintenance,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Enable Maintenance Mode</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance.message}
                onChange={(e) => setSettings({
                  ...settings,
                  maintenance: {
                    ...settings.maintenance,
                    message: e.target.value
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                rows={3}
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    maxLoginAttempts: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    sessionTimeout: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.security.requireMFA}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      requireMFA: e.target.checked
                    }
                  })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Require Multi-Factor Authentication</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      fromName: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      fromEmail: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      smtpHost: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      smtpPort: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.email.smtpUser}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      smtpUser: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.email.smtpPass}
                  onChange={(e) => setSettings({
                    ...settings,
                    email: {
                      ...settings.email,
                      smtpPass: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.storage.maxUploadSize}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: {
                    ...settings.storage,
                    maxUploadSize: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Allowed File Types (comma-separated)
              </label>
              <input
                type="text"
                value={settings.storage.allowedFileTypes.join(', ')}
                onChange={(e) => setSettings({
                  ...settings,
                  storage: {
                    ...settings.storage,
                    allowedFileTypes: e.target.value.split(',').map(t => t.trim())
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.storage.compressionEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    storage: {
                      ...settings.storage,
                      compressionEnabled: e.target.checked
                    }
                  })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Enable File Compression</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Rate Limit (requests per minute)
              </label>
              <input
                type="number"
                value={settings.api.rateLimit}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    rateLimit: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Request Timeout (seconds)
              </label>
              <input
                type="number"
                value={settings.api.timeout}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    timeout: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Max Request Size (MB)
              </label>
              <input
                type="number"
                value={settings.api.maxRequestSize}
                onChange={(e) => setSettings({
                  ...settings,
                  api: {
                    ...settings.api,
                    maxRequestSize: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
          </div>
        )}

        {activeTab === 'cache' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.cache.enabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    cache: {
                      ...settings.cache,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span>Enable Caching</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Cache TTL (seconds)
              </label>
              <input
                type="number"
                value={settings.cache.ttl}
                onChange={(e) => setSettings({
                  ...settings,
                  cache: {
                    ...settings.cache,
                    ttl: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">
                Max Cache Size (MB)
              </label>
              <input
                type="number"
                value={settings.cache.maxSize}
                onChange={(e) => setSettings({
                  ...settings,
                  cache: {
                    ...settings.cache,
                    maxSize: parseInt(e.target.value)
                  }
                })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
