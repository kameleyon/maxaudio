import { useState } from 'react'
import { X, CreditCard, Shield, AlertCircle } from 'lucide-react'
import type { SubscriptionTier } from '../../config/subscription-tiers'
import { stripeService } from '../../services/stripe.service'
import { useUser } from '@clerk/clerk-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTier: SubscriptionTier | null
  currentTier: SubscriptionTier
  billingCycle: 'monthly' | 'yearly'
}

type PriceMap = {
  [key in 'pro' | 'premium']: {
    [cycle in 'monthly' | 'yearly']: string
  }
}

export function UpgradeModal({
  isOpen,
  onClose,
  selectedTier,
  currentTier,
  billingCycle
}: UpgradeModalProps) {
  const { user } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !selectedTier) return null

  const isUpgrade = selectedTier.monthlyPrice > currentTier.monthlyPrice
  const price = billingCycle === 'monthly' 
    ? selectedTier.monthlyPrice 
    : selectedTier.yearlyPrice

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const calculatePriceChange = () => {
    const currentPrice = billingCycle === 'monthly'
      ? currentTier.monthlyPrice
      : currentTier.yearlyPrice
    const newPrice = billingCycle === 'monthly'
      ? selectedTier.monthlyPrice
      : selectedTier.yearlyPrice
    const difference = newPrice - currentPrice
    return {
      amount: Math.abs(difference),
      type: difference > 0 ? 'increase' : 'decrease'
    }
  }

  const getPriceId = (tierId: string, cycle: 'monthly' | 'yearly'): string => {
    const priceMap: PriceMap = {
      pro: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_ID_PRO_MONTHLY || '',
        yearly: import.meta.env.VITE_STRIPE_PRICE_ID_PRO_YEARLY || ''
      },
      premium: {
        monthly: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_MONTHLY || '',
        yearly: import.meta.env.VITE_STRIPE_PRICE_ID_PREMIUM_YEARLY || ''
      }
    }
    return priceMap[tierId as keyof PriceMap]?.[cycle] || ''
  }

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      const priceId = getPriceId(selectedTier.id, billingCycle)
      if (!priceId) {
        throw new Error('Invalid price configuration')
      }

      // Get the current URL for success/cancel redirects
      const baseUrl = window.location.origin
      const returnUrl = `${baseUrl}/settings?tab=subscription`

      if (currentTier.id === 'free') {
        // New subscription - redirect to Stripe Checkout
        await stripeService.redirectToCheckout({
          priceId,
          successUrl: `${returnUrl}&result=success`,
          cancelUrl: `${returnUrl}&result=canceled`,
          customerId: user?.id || '',
          clientReferenceId: user?.id || ''
        })
      } else {
        // Existing subscription - update the subscription
        const subscriptionId = user?.publicMetadata?.subscriptionId as string
        if (!subscriptionId) {
          throw new Error('No active subscription found')
        }

        await stripeService.updateSubscription(subscriptionId, {
          priceId
        })

        onClose()
      }
    } catch (err) {
      console.error('Subscription change error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process subscription change')
    } finally {
      setIsProcessing(false)
    }
  }

  const priceChange = calculatePriceChange()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-lg border border-white/10 w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold">
            {isUpgrade ? 'Upgrade to' : 'Change to'} {selectedTier.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Change Summary */}
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60">New {billingCycle} price</span>
              <span className="font-semibold">{formatPrice(price)}</span>
            </div>
            {priceChange.amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Price {priceChange.type}</span>
                <span className={priceChange.type === 'increase' ? 'text-red-400' : 'text-green-400'}>
                  {priceChange.type === 'increase' ? '+' : '-'}{formatPrice(priceChange.amount)}
                </span>
              </div>
            )}
          </div>

          {/* Feature Changes */}
          <div className="space-y-2">
            <h4 className="font-semibold mb-3">What's included:</h4>
            <ul className="space-y-3">
              {selectedTier.features
                .filter(feature => feature.included)
                .map(feature => (
                  <li key={feature.name} className="flex items-start gap-2 text-sm">
                    <Shield className="w-4 h-4 text-[#63248d] mt-0.5 flex-shrink-0" />
                    <span>{feature.description}</span>
                  </li>
                ))
              }
            </ul>
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <CreditCard className="w-4 h-4" />
            <span>Secure payment processing with Stripe</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Confirm ${isUpgrade ? 'Upgrade' : 'Change'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
