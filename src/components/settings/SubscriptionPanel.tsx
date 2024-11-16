import { useState } from 'react'
import { Crown, Check, Calendar, CreditCard, Lock } from 'lucide-react'
import { subscriptionTiers, type SubscriptionTier } from '../../config/subscription-tiers'
import { useAuth } from '../../contexts/AuthContext'
import { UpgradeModal } from './UpgradeModal'
import { UsageDisplay } from './UsageDisplay'

export function SubscriptionPanel() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  // Get current tier based on user's role
  const currentTier = user?.role === 'admin' 
    ? subscriptionTiers.find(tier => tier.id === 'premium')
    : subscriptionTiers.find(tier => tier.id === 'free');

  const handleAddonToggle = (addon: string) => {
    setSelectedAddons(prev => 
      prev.includes(addon) 
        ? prev.filter(a => a !== addon)
        : [...prev, addon]
    )
  }

  const getPrice = (tier: SubscriptionTier) => {
    const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
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

  // Get the highest tier for showing all possible add-ons
  const enterpriseTier = subscriptionTiers.find(tier => tier.id === 'enterprise')!;

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
          type="button"
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
          type="button"
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
        {subscriptionTiers.map((tier) => (
          <div key={tier.id} className="bg-white/5 rounded-lg p-3 relative border border-white/10">
            {tier.id === 'professional' && (
              <div className="absolute -top-2 -right-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-[#63248d] text-white text-xs rounded-full"
                >
                  MOST POPULAR!
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="grid md:grid-cols-3 gap-4">
                  <ul className="space-y-2 text-xl text-white/80">
                    <li>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded-full ${tier.id === 'free' ? 'bg-green-400' : 'bg-[#63248d]'} flex items-center justify-center`}>
                          {tier.id === 'free' ? (
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <Crown className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <h3 className="text-md font-semibold text-white">{tier.name}</h3>
                      </div>
                    </li>
                    <li>
                      <div className="text-3xl font-bold text-white mb-4">
                        {getPrice(tier)}
                        <span className="text-lg font-normal text-white/60">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                      </div>
                    </li>
                    <li>
                      {tier.id === currentTier.id ? (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#63248d] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpgradeClick(tier)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#63248d] text-white text-sm hover:bg-[#7b2daf] transition-colors"
                        >
                          {tier.monthlyPrice > currentTier.monthlyPrice ? 'Upgrade' : 'Switch'} to {tier.name}
                        </button>
                      )}
                    </li>
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li>• {tier.limits.charactersPerMonth.toLocaleString()} chars/month</li>
                    <li>• {tier.limits.voiceClones} voice clone{tier.limits.voiceClones !== 1 ? 's' : ''}</li>
                    <li>• {tier.limits.requestsPerMinute} requests/minute</li>
                    {tier.features.slice(0, 2).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                  <ul className="space-y-2 text-sm text-white/80">
                    {tier.features.slice(2).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add-ons Section */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-6">
        <h3 className="text-md font-semibold text-white mb-4">Add-On Options</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <h4 className="font-semibold text-white mb-2">Additional Tokens</h4>
            <ul className="space-y-2 text-sm">
              {subscriptionTiers.map((tier) => (
                <li 
                  key={tier.id}
                  className={`flex items-center gap-2 ${tier.id === currentTier.id ? 'text-white/80' : 'text-white/40'}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#63248d] rounded border-white/20 bg-white/5 focus:ring-[#63248d]"
                      checked={selectedAddons.includes(`tokens-${tier.id}`)}
                      onChange={() => handleAddonToggle(`tokens-${tier.id}`)}
                      disabled={tier.id !== currentTier.id}
                    />
                    <span className="flex items-center gap-1">
                      ${tier.addons.tokens.price}/{(tier.addons.tokens.amount / 1000).toFixed(0)}K chars
                      {tier.id !== currentTier.id && (
                        <Lock className="w-3 h-3 text-white/40" />
                      )}
                    </span>
                    <span className="text-xs">({tier.name})</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Extra Voice Clones</h4>
            <ul className="space-y-2 text-sm">
              {subscriptionTiers.filter(tier => tier.addons.voiceClones.available).map((tier) => (
                <li 
                  key={tier.id}
                  className={`flex items-center gap-2 ${tier.id === currentTier.id ? 'text-white/80' : 'text-white/40'}`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#63248d] rounded border-white/20 bg-white/5 focus:ring-[#63248d]"
                      checked={selectedAddons.includes(`clones-${tier.id}`)}
                      onChange={() => handleAddonToggle(`clones-${tier.id}`)}
                      disabled={tier.id !== currentTier.id}
                    />
                    <span className="flex items-center gap-1">
                      ${tier.addons.voiceClones.price} per clone
                      {tier.id !== currentTier.id && (
                        <Lock className="w-3 h-3 text-white/40" />
                      )}
                    </span>
                    <span className="text-xs">
                      (up to {tier.addons.voiceClones.maxAdditional} more)
                    </span>
                  </div>
                </li>
              ))}
              {!currentTier.addons.voiceClones.available && (
                <li className="text-white/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Not available in {currentTier.name}
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Processing Priority</h4>
            <ul className="space-y-2 text-sm">
              {subscriptionTiers.map((tier) => (
                <li 
                  key={tier.id}
                  className={tier.id === currentTier.id ? 'text-white/80' : 'text-white/40'}
                >
                  • {tier.name}: {tier.addons.priority}
                  {tier.id === currentTier.id && (
                    <span className="ml-2 text-xs bg-[#63248d]/20 text-[#63248d] px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </li>
              ))}
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
  );
}
