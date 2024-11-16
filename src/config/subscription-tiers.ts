export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    charactersPerMonth: number;
    requestsPerMinute: number;
    voiceClones: number;
  };
  addons: {
    tokens: {
      available: boolean;
      price: number;
      amount: number; // in characters
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
    name: 'Free Trial',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '3 days full Professional access',
      '3 free generations (3 min each)',
      'Standard voices only',
      'Basic voice collection access',
      'No commercial usage rights'
    ],
    limits: {
      charactersPerMonth: 200000,
      requestsPerMinute: 5,
      voiceClones: 0
    },
    addons: {
      tokens: {
        available: true,
        price: 9.99,
        amount: 500000
      },
      voiceClones: {
        available: false,
        price: 0,
        maxAdditional: 0
      },
      priority: 'Best effort'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 39.99,
    yearlyPrice: 383.90, // 20% off monthly price
    features: [
      'WaveNet & Neural2 voices',
      '3 custom voice clones',
      'Basic Analytics',
      'Limited commercial usage',
      'Standard support'
    ],
    limits: {
      charactersPerMonth: 1000000,
      requestsPerMinute: 15,
      voiceClones: 3
    },
    addons: {
      tokens: {
        available: true,
        price: 4.99,
        amount: 500000
      },
      voiceClones: {
        available: true,
        price: 19.99,
        maxAdditional: 7 // Up to 10 total
      },
      priority: 'Standard priority'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 79.99,
    yearlyPrice: 767.90, // 20% off monthly price
    features: [
      'All voice collections',
      '5 custom voice clones',
      'Advanced Analytics',
      'Full commercial usage rights',
      'Priority 24/7 support'
    ],
    limits: {
      charactersPerMonth: 2000000,
      requestsPerMinute: 30,
      voiceClones: 5
    },
    addons: {
      tokens: {
        available: true,
        price: 4.99,
        amount: 500000
      },
      voiceClones: {
        available: true,
        price: 19.99,
        maxAdditional: 15 // Up to 20 total
      },
      priority: 'High priority'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 149.99,
    yearlyPrice: 1439.90, // 20% off monthly price
    features: [
      'All voices + exclusive access',
      '10 custom voice clones',
      'Custom Analytics Dashboard',
      'Enterprise commercial rights',
      'Dedicated account manager'
    ],
    limits: {
      charactersPerMonth: 5000000,
      requestsPerMinute: 50,
      voiceClones: 10
    },
    addons: {
      tokens: {
        available: true,
        price: 4.99,
        amount: 1000000 // 1M chars for same price
      },
      voiceClones: {
        available: true,
        price: 19.99,
        maxAdditional: 999 // Unlimited for practical purposes
      },
      priority: 'Highest priority'
    }
  }
];
