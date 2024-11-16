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
      { name: 'Basic Voices', description: 'Access to 10 standard voices', included: true },
      { name: 'Audio Generation', description: 'Generate audio up to 3 minutes', included: true },
      { name: 'Export Options', description: 'Export as MP3', included: true },
      { name: 'Voice Cloning', description: 'Create custom voice clones', included: false },
      { name: 'Priority Support', description: '24/7 priority customer support', included: false },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: false }
    ],
    limits: {
      charactersPerMonth: 6000,  // Approx. 6 minutes of audio
      voiceClones: 0,
      requestsPerMinute: 2,
      audioLength: 3,  // max 3 minutes per generation
      availableVoices: ['standard']
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For content creators and small businesses',
    monthlyPrice: 19.99,
    yearlyPrice: 191.90,  // ~$15.99/month when paid yearly (20% off)
    features: [
      { name: 'All Basic Features', description: 'Everything in Free Trial', included: true },
      { name: 'Premium Voices', description: 'Access to 30+ premium voices', included: true },
      { name: 'Neural Voices', description: 'Access to advanced neural voices', included: true },
      { name: 'Voice Cloning', description: 'Create up to 3 custom voice clones', included: true },
      { name: 'Export Options', description: 'Export as MP3, WAV, FLAC', included: true },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: true },
      { name: 'Priority Support', description: '24/7 priority customer support', included: false },
      { name: 'API Access', description: 'Direct API access for integration', included: false }
    ],
    limits: {
      charactersPerMonth: 100000,  // Approx. 100 minutes of audio
      voiceClones: 3,
      requestsPerMinute: 10,
      audioLength: 10,  // max 10 minutes per generation
      availableVoices: ['standard', 'premium', 'neural']
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For professional studios and enterprises',
    monthlyPrice: 49.99,
    yearlyPrice: 479.90,  // ~$39.99/month when paid yearly (20% off)
    features: [
      { name: 'All Pro Features', description: 'Everything in Professional', included: true },
      { name: 'Studio Voices', description: 'Access to 50+ studio-quality voices', included: true },
      { name: 'Voice Cloning', description: 'Create up to 10 custom voice clones', included: true },
      { name: 'Priority Support', description: '24/7 priority customer support', included: true },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: true },
      { name: 'Custom Voice Training', description: 'Train voices on custom datasets', included: true },
      { name: 'Bulk Generation', description: 'Generate multiple audios in batch', included: true },
      { name: 'API Access', description: 'Direct API access for integration', included: true },
      { name: 'Early Access', description: 'Access to beta features', included: true }
    ],
    limits: {
      charactersPerMonth: 500000,  // Approx. 500 minutes of audio
      voiceClones: 10,
      requestsPerMinute: 30,
      audioLength: 30,  // max 30 minutes per generation
      availableVoices: ['standard', 'premium', 'neural', 'studio']
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
