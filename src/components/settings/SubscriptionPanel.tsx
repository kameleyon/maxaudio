import { useState } from 'react'
import { Crown, Check, Calendar, CreditCard } from 'lucide-react'
import { subscriptionTiers, specialOffers, type SubscriptionTier } from '../../config/subscription-tiers'
import { useUser } from '@clerk/clerk-react'
import { UpgradeModal } from './UpgradeModal'
import { UsageDisplay } from './UsageDisplay'

export function SubscriptionPanel() {
  const { user } = useUser()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)

  // Mock current tier - replace with actual user subscription data
  const currentTier = subscriptionTiers.find(tier => tier.id === 'pro') || subscriptionTiers[0]

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
    if (tier.id !== currentTier.id) {
      setSelectedTier(tier)
      setShowUpgradeModal(true)
    }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionTiers.map((tier) => {
          const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice / 12
          const totalPrice = billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice
          const { savings, percentage } = calculateYearlyDiscount(tier.monthlyPrice, tier.yearlyPrice)
          const isCurrentTier = tier.id === currentTier.id
          
          return (
            <div
              key={tier.id}
              className={`rounded-lg border ${
                isCurrentTier
                  ? 'border-[#63248d] bg-[#63248d]/10'
                  : 'border-white/10 bg-white/5'
              } p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <Crown className={`w-5 h-5 ${isCurrentTier ? 'text-[#63248d]' : 'text-white/40'}`} />
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{formatPrice(price)}</span>
                  <span className="text-white/60">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="mt-2 text-sm">
                    <span className="text-green-400">{formatPrice(savings)} savings yearly</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-sm text-white/60">{tier.description}</div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-[#63248d] mt-0.5 flex-shrink-0" />
                      <span className={feature.included ? '' : 'text-white/40 line-through'}>
                        {feature.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleUpgradeClick(tier)}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    isCurrentTier
                      ? 'bg-white/10 text-white cursor-default'
                      : 'bg-[#63248d] hover:bg-[#63248d]/80'
                  }`}
                >
                  {isCurrentTier ? 'Current Plan' : 'Change Plan'}
                </button>
                
                {tier.id !== 'free' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                )}
              </div>

              {tier.salePrice && (
                <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <span className="text-green-400 text-sm">
                    Limited time offer: Save up to {percentage}%
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Special Offers */}
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-[#63248d]" />
          <h3 className="font-semibold">Special Offers</h3>
        </div>
        <div className="text-sm text-white/60">
          <p>• New users get 3 days of Premium features with 3 free generations</p>
          <p>• Get 20% off your first month with a referral code</p>
          <p>• Check back for seasonal discounts up to 30% off</p>
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
