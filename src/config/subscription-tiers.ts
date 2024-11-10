export interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;  // 20% discount for yearly
  salePrice?: {
    monthly: number;
    yearly: number;
  };
  features: SubscriptionFeature[];
  limits: {
    charactersPerMonth: number;
    voiceClones: number;
    requestsPerMinute: number;
    audioLength: number;  // in minutes
    availableVoices: string[];
  };
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free Trial',
    description: 'Perfect for trying out our services',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: 'Standard Voices', description: 'Access to basic voice collection', included: true },
      { name: 'Basic Audio Generation', description: 'Generate audio up to 3 minutes', included: true },
      { name: 'Voice Cloning', description: 'Create custom voice clones', included: false },
      { name: 'Priority Support', description: '24/7 priority customer support', included: false },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: false }
    ],
    limits: {
      charactersPerMonth: 10000,  // Approx. 10 minutes of audio
      voiceClones: 0,
      requestsPerMinute: 5,
      audioLength: 3,  // max 3 minutes per generation
      availableVoices: ['standard']
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For content creators and small businesses',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,  // ~$23.99/month when paid yearly (20% off)
    salePrice: {
      monthly: 23.99,
      yearly: 215.90  // ~$17.99/month when paid yearly during sale
    },
    features: [
      { name: 'Standard Voices', description: 'Access to basic voice collection', included: true },
      { name: 'WaveNet Voices', description: 'Access to high-quality WaveNet voices', included: true },
      { name: 'Neural2 Voices', description: 'Access to advanced Neural2 voices', included: true },
      { name: 'Voice Cloning', description: 'Create up to 3 custom voice clones', included: true },
      { name: 'Priority Support', description: '24/7 priority customer support', included: false },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: true }
    ],
    limits: {
      charactersPerMonth: 1000000,  // Approx. 1000 minutes of audio
      voiceClones: 3,
      requestsPerMinute: 15,
      audioLength: 10,  // max 10 minutes per generation
      availableVoices: ['standard', 'wavenet', 'neural2']
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For professional studios and enterprises',
    monthlyPrice: 79.99,
    yearlyPrice: 767.90,  // ~$63.99/month when paid yearly (20% off)
    salePrice: {
      monthly: 63.99,
      yearly: 575.90  // ~$47.99/month when paid yearly during sale
    },
    features: [
      { name: 'All Voice Types', description: 'Access to all voice collections', included: true },
      { name: 'Studio Voices', description: 'Access to premium studio-quality voices', included: true },
      { name: 'Voice Cloning', description: 'Create up to 10 custom voice clones', included: true },
      { name: 'Priority Support', description: '24/7 priority customer support', included: true },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: true },
      { name: 'Custom Voice Training', description: 'Train voices on custom datasets', included: true },
      { name: 'Bulk Generation', description: 'Generate multiple audios in batch', included: true },
      { name: 'API Access', description: 'Direct API access for integration', included: true },
      { name: 'Future Royalties', description: 'Earn from marketplace voice usage', included: true }
    ],
    limits: {
      charactersPerMonth: 3000000,  // Approx. 3000 minutes of audio
      voiceClones: 10,
      requestsPerMinute: 30,
      audioLength: 30,  // max 30 minutes per generation
      availableVoices: ['standard', 'wavenet', 'neural2', 'studio', 'polyglot']
    }
  }
];

// Special Offers
export const specialOffers = {
  newUser: {
    description: 'New users get 3 days of Premium features with 3 free generations',
    maxAudioLength: 3,  // minutes
    maxGenerations: 3
  },
  seasonal: {
    winter: { discount: 30, code: 'WINTER30' },
    spring: { discount: 25, code: 'SPRING25' },
    summer: { discount: 30, code: 'SUMMER30' },
    backToSchool: { discount: 25, code: 'SCHOOL25' }
  },
  referral: {
    discount: 20,  // 20% off first month
    referrerBonus: 5  // $5 credit
  }
};

// Enterprise Custom Plans
export const enterpriseFeatures = {
  customVoiceLibrary: true,
  dedicatedSupport: true,
  customIntegration: true,
  unlimitedClones: true,
  customRateLimits: true,
  priorityGeneration: true,
  customBranding: true,
  analyticsAndReporting: true
};
