export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  stripePriceId: string;
  stripeYearlyPriceId: string;
  limits: {
    charactersPerMonth: number;
    voiceClones: number;
    requestsPerMinute: number;
  };
  features: string[];
  addons: {
    tokens: {
      price: number;
      amount: number;
    };
    voiceClones: {
      available: boolean;
      price: number;
      maxAdditional: number;
    };
    priority: string;
  };
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceId: 'price_free_monthly',
    stripeYearlyPriceId: 'price_free_yearly',
    limits: {
      charactersPerMonth: 50000,
      voiceClones: 0,
      requestsPerMinute: 10
    },
    features: [
      'Basic voice options',
      'MP3 downloads',
      'Community support',
      'Basic text processing',
      '10-minute max audio length'
    ],
    addons: {
      tokens: {
        price: 5,
        amount: 50000
      },
      voiceClones: {
        available: false,
        price: 0,
        maxAdditional: 0
      },
      priority: 'Standard processing'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90, // 20% discount
    stripePriceId: 'price_professional_monthly',
    stripeYearlyPriceId: 'price_professional_yearly',
    limits: {
      charactersPerMonth: 500000,
      voiceClones: 3,
      requestsPerMinute: 30
    },
    features: [
      'Premium voice options',
      'All download formats',
      'Email support',
      'Voice customization',
      'Batch processing',
      'Priority queue',
      'Advanced text processing'
    ],
    addons: {
      tokens: {
        price: 10,
        amount: 100000
      },
      voiceClones: {
        available: true,
        price: 9.99,
        maxAdditional: 5
      },
      priority: 'Priority processing'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 99.99,
    yearlyPrice: 959.90, // 20% discount
    stripePriceId: 'price_enterprise_monthly',
    stripeYearlyPriceId: 'price_enterprise_yearly',
    limits: {
      charactersPerMonth: 2000000,
      voiceClones: 10,
      requestsPerMinute: 100
    },
    features: [
      'All Professional features',
      'Custom voice training',
      'Advanced emotion processing',
      'API access',
      'Custom integration',
      'SLA guarantee',
      'Dedicated support',
      'Unlimited audio length'
    ],
    addons: {
      tokens: {
        price: 15,
        amount: 200000
      },
      voiceClones: {
        available: true,
        price: 19.99,
        maxAdditional: 20
      },
      priority: 'Highest priority'
    }
  }
];
