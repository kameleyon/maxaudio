import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  isDefault?: boolean;
}

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Basic',
    price: 0,
    isDefault: true,
    features: [
      '1,000 characters per month',
      'Basic voice options',
      'Standard support',
      'Basic file storage'
    ]
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 29,
    features: [
      '100,000 characters per month',
      'Advanced voice customization',
      'Priority support',
      '10GB storage',
      'Voice cloning (2 voices)'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    price: 99,
    features: [
      'Unlimited characters',
      'All voice features',
      '24/7 priority support',
      'Unlimited storage',
      'Unlimited voice cloning'
    ]
  }
];

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [selectedTier, setSelectedTier] = useState<string>('free');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl max-w-3xl w-full mx-4 border border-white/10">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            Welcome to AudioMax, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-white/60">
            Choose your subscription plan to get started with AI-powered voice generation.
            You can change your plan anytime from your account settings.
          </p>
        </div>

        {/* Subscription Options */}
        <div className="space-y-6 mb-8">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-6 rounded-lg border transition-all ${
                selectedTier === tier.id
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <input
                    type="radio"
                    name="subscription"
                    id={tier.id}
                    checked={selectedTier === tier.id}
                    onChange={() => setSelectedTier(tier.id)}
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <label htmlFor={tier.id} className="font-medium text-lg">
                      {tier.name}
                    </label>
                    <p className="text-white/60">
                      {tier.price === 0 ? 'Free' : `$${tier.price}/month`}
                    </p>
                  </div>
                </div>
                {!tier.isDefault && (
                  <button
                    onClick={() => setSelectedTier(tier.id)}
                    className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>

              <div className="ml-8 space-y-2">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors"
          >
            {selectedTier === 'free' ? 'Continue with Basic' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
