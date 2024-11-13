import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

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
    price: 79.99,
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
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string>('free');

  const handleContinue = () => {
    if (selectedTier === 'free') {
      onClose();
      navigate('/studio');
    } else {
      navigate('/settings/billing', { 
        state: { selectedPlan: selectedTier } 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 rounded-lg max-w-2xl w-full mx-4 border border-white/10 shadow-xl">
        {/* Welcome Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-blue-100">
            Welcome to AudioMax, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-white/60 text-sm">
            Choose your subscription plan to get started with AI-powered voice generation.
          </p>
        </div>

        {/* Subscription Options */}
        <div className="space-y-4 mb-6">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.id}
              className={`p-4 rounded-lg border transition-all ${
                selectedTier === tier.id
                  ? 'border-primary bg-primary/5'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="subscription"
                    id={tier.id}
                    checked={selectedTier === tier.id}
                    onChange={() => setSelectedTier(tier.id)}
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <label htmlFor={tier.id} className="font-medium text-white">
                      {tier.name}
                    </label>
                    <p className="text-white/60 text-sm">
                      {tier.price === 0 ? 'Free' : `$${tier.price}/month`}
                    </p>
                  </div>
                </div>
                {!tier.isDefault && (
                  <button
                    onClick={() => setSelectedTier(tier.id)}
                    className="px-3 py-1.5 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors text-sm"
                  >
                    Upgrade
                  </button>
                )}
              </div>

              <div className="ml-7 space-y-1">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-3.5 h-3.5 text-primary flex-shrink-0"
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

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors text-sm"
          >
            {selectedTier === 'free' ? 'Continue with Basic' : 'Continue to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
