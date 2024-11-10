import { useState } from 'react'
import { Tabs } from '../components/settings/Tabs'
import { SubscriptionPanel } from '../components/settings/SubscriptionPanel'
import { BillingPanel } from '../components/settings/BillingPanel'
import { TokenUsagePanel } from '../components/settings/TokenUsagePanel'
import { PreferencesPanel } from '../components/settings/PreferencesPanel'
import { NotificationPreferencesPanel } from '../components/settings/NotificationPreferencesPanel'

export function Settings() {
  const [activeTab, setActiveTab] = useState('subscription')

  const tabs = [
    { id: 'subscription', label: 'Subscription' },
    { id: 'billing', label: 'Billing' },
    { id: 'tokens', label: 'Token Usage' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-white/60 mb-8">Manage your account settings and preferences</p>

      <div className="bg-white/5 rounded-lg border border-white/10">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        
        <div className="p-6">
          {activeTab === 'subscription' && <SubscriptionPanel />}
          {activeTab === 'billing' && <BillingPanel />}
          {activeTab === 'tokens' && <TokenUsagePanel />}
          {activeTab === 'notifications' && <NotificationPreferencesPanel />}
          {activeTab === 'preferences' && <PreferencesPanel />}
        </div>
      </div>
    </div>
  )
}
