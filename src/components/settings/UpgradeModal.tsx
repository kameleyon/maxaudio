import { Dialog } from '@headlessui/react'
import { X, CreditCard, Shield, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { SubscriptionTier } from '../../config/subscription-tiers'
import { stripeService } from '../../services/stripe.service'
import { useAuth } from '../../contexts/AuthContext'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTier: SubscriptionTier | null
  currentTier: SubscriptionTier
  billingCycle: 'monthly' | 'yearly'
}

export function UpgradeModal({ isOpen, onClose, selectedTier, currentTier, billingCycle }: UpgradeModalProps) {
  const { user, token } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!selectedTier) return null;

  const currentPrice = billingCycle === 'monthly' ? currentTier.monthlyPrice : currentTier.yearlyPrice;
  const newPrice = billingCycle === 'monthly' ? selectedTier.monthlyPrice : selectedTier.yearlyPrice;
  const priceDifference = newPrice - currentPrice;

  const handleUpgrade = async () => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Get the price ID based on the selected tier and billing cycle
      const priceId = billingCycle === 'monthly' 
        ? selectedTier.stripePriceId 
        : selectedTier.stripeYearlyPriceId;

      if (!priceId) {
        throw new Error('Price ID not found for selected plan');
      }

      // Create checkout session and redirect to Stripe
      await stripeService.redirectToCheckout({
        priceId,
        successUrl: `${window.location.origin}/settings?upgrade=success&plan=${selectedTier.id}&billing=${billingCycle}`,
        cancelUrl: `${window.location.origin}/settings?upgrade=cancelled`,
        customerId: user?.stripeCustomerId,
        clientReferenceId: user?.id
      }, token);

    } catch (err) {
      console.error('Upgrade error:', err);
      setError('Failed to process upgrade. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#1a1b26] rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <Dialog.Title className="text-xl font-semibold text-white">
              Upgrade to {selectedTier.name}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white/80 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Price Information */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-white/60">New {billingCycle} price</span>
                <span className="text-2xl font-bold text-white">
                  ${newPrice}
                  <span className="text-sm font-normal text-white/60">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-white/60">Price increase</span>
                <span className={`text-sm font-medium ${priceDifference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {priceDifference > 0 ? '+' : ''}${Math.abs(priceDifference)}
                  /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </div>
            </div>

            {/* What's included */}
            <div>
              <h3 className="text-white font-semibold mb-3">What's included:</h3>
              <ul className="space-y-2">
                {selectedTier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-white/80">
                    <Shield className="w-4 h-4 mt-0.5 text-[#63248d]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Processing */}
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CreditCard className="w-4 h-4" />
              <span>Secure payment processing with Stripe</span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 rounded-lg bg-[#63248d] text-white hover:bg-[#7b2daf] transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm Upgrade'}
              </button>
            </div>

            {/* Terms */}
            <p className="text-xs text-white/40 text-center">
              By upgrading, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
