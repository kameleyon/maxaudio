import { useState } from 'react'
import { Crown, Check, Calendar, CreditCard } from 'lucide-react'
import { subscriptionTiers, type SubscriptionTier } from '../../config/subscription-tiers'
import { useAuth } from '../../contexts/AuthContext'
import { UpgradeModal } from './UpgradeModal'
import { UsageDisplay } from './UsageDisplay'

export function SubscriptionPanel() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)

  // Get current tier based on user's role
  const currentTier = user?.role === 'admin' 
    ? subscriptionTiers.find(tier => tier.id === 'premium')
    : subscriptionTiers.find(tier => tier.id === 'free');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const calculateYearlyDiscount = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12
    const savings = monthlyTotal - yearlyPrice
    const percentage = Math.round((savings / monthlyTotal) * 100)
    return { savings, percentage }
  }

  const handleUpgradeClick = (tier: SubscriptionTier) => {
    if (tier.id !== currentTier?.id) {
      setSelectedTier(tier)
      setShowUpgradeModal(true)
    }
  }

  if (!user || !currentTier) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Subscription & Usage</h2>
        <p className="text-white/60">Manage your plan and monitor resource usage</p>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white/5 rounded-lg border border-white/10 p-6">
        <UsageDisplay />
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center gap-4 p-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-[#63248d] text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingCycle === 'yearly'
              ? 'bg-[#63248d] text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Yearly
          <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            Save 20%
          </span>
        </button>
      </div>

      {/* Subscription Plans */}
        <div className="space-y-6 mb-6">
          {/* Free Trial */}
          <div className="bg-white/5 rounded-lg p-3 relative border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="grid md:grid-cols-3 gap-4">
                  <ul className="space-y-2 text-xl text-white/80">
                    <li>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-md font-semibold text-white">Free Trial</h3>
                      </div>
                    </li>
                    <li>
                      <div className="text-3xl font-bold text-white mb-4">$0<span className="text-lg font-normal text-white/60">/month</span></div>
                    </li>
                    <li>
                      <button className={`px-4 py-2 rounded-lg bg-white/5 text-white/60 disabled`}>
                        Current Plan
                      </button>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• 3 days full Professional access</li>
                    <li>• 3 free generations (3 min each)</li>
                    <li>• 200,000 characters/month after trial</li>
                    <li>• Standard voices only</li>
                    <li>• API Rate: 5 requests/minute</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• Standard support</li>
                    <li>• Voice Cloning: Not available</li>
                    <li>• Token Purchase: $9.99/500K chars</li>
                    <li>• Basic voice collection access</li>
                    <li>• No commercial usage rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="bg-white/5 rounded-lg p-3 relative border border-white/10">
            <div className="absolute -top-2 -right-2">
              <button className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                MOST POPULAR!
              </button>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="grid md:grid-cols-3 gap-4">
                  <ul className="space-y-2 text-xl text-white/80">
                    <li>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-md font-semibold text-white">Professional</h3>
                      </div>
                    </li>
                    <li>
                      <div className="text-3xl font-bold text-white mb-4">$39.99<span className="text-lg font-normal text-white/60">/month</span></div>
                    </li>
                    <li>
                      <button onClick={() => handleUpgradeClick({ id: 'professional' } as SubscriptionTier)} 
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                        Upgrade Now
                      </button>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• WaveNet & Neural2 voices</li>
                    <li>• 3 custom voice clones</li>
                    <li>• 1M characters/month</li>
                    <li>• API Rate: 15 requests/minute</li>
                    <li>• 5 simultaneous generations</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• Standard support</li>
                    <li>• Token Purchase: $4.99/500K chars</li>
                    <li>• Additional clones: $19.99 each</li>
                    <li>• Basic Analytics</li>
                    <li>• Limited commercial usage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className="bg-white/5 rounded-lg p-3 relative border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="grid md:grid-cols-3 gap-4">
                  <ul className="space-y-2 text-xl text-white/80">
                    <li>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-md font-semibold text-white">Premium</h3>
                      </div>
                    </li>
                    <li>
                      <div className="text-3xl font-bold text-white mb-4">$79.99<span className="text-lg font-normal text-white/60">/month</span></div>
                    </li>
                    <li>
                      <button onClick={() => handleUpgradeClick({ id: 'premium' } as SubscriptionTier)}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                        Upgrade Now
                      </button>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• All voice collections</li>
                    <li>• 5 custom voice clones</li>
                    <li>• 2M characters/month</li>
                    <li>• API Rate: 30 requests/minute</li>
                    <li>• 10 simultaneous generations</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• Priority 24/7 support</li>
                    <li>• Token Purchase: $4.99/500K chars</li>
                    <li>• Additional clones: $19.99 each</li>
                    <li>• Advanced Analytics</li>
                    <li>• Full commercial usage rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Enterprise */}
          <div className="bg-white/5 rounded-lg p-3 relative border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="grid md:grid-cols-3 gap-4">
                  <ul className="space-y-2 text-xl text-white/80">
                    <li>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                        <h3 className="text-md font-semibold text-white">Enterprise</h3>
                      </div>
                    </li>
                    <li>
                      <div className="text-3xl font-bold text-white mb-4">$149.99<span className="text-lg font-normal text-white/60">/month</span></div>
                    </li>
                    <li>
                      <button onClick={() => handleUpgradeClick({ id: 'enterprise' } as SubscriptionTier)}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                        Upgrade Now
                      </button>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• All voices + exclusive access</li>
                    <li>• 10 custom voice clones</li>
                    <li>• 5M characters/month</li>
                    <li>• API Rate: 50 requests/minute</li>
                    <li>• 20 simultaneous generations</li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• Dedicated account manager</li>
                    <li>• Token Purchase: $4.99/1M chars</li>
                    <li>• Unlimited additional clones</li>
                    <li>• Custom Analytics Dashboard</li>
                    <li>• Enterprise commercial rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-6">
          <h3 className="text-md font-semibold text-white mb-4">Add-On Options</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <h4 className="font-semibold text-white mb-2">Additional Tokens</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Free Tier: $9.99/500K chars</li>
                <li>• Professional & Premium: $4.99/500K chars</li>
                <li>• Enterprise: $4.99/1M chars</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Extra Voice Clones</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• $19.99 per additional clone</li>
                <li>• Professional: Up to 10 total</li>
                <li>• Premium: Up to 20 total</li>
                <li>• Enterprise: Unlimited</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Processing Priority</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Enterprise: Highest priority</li>
                <li>• Premium: High priority</li>
                <li>• Professional: Standard priority</li>
                <li>• Free: Best effort</li>
              </ul>
            </div>
          </div>
        </div>

  

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          setSelectedTier(null)
        }}
        selectedTier={selectedTier}
        currentTier={currentTier}
        billingCycle={billingCycle}
      />
    </div>
  )
}
