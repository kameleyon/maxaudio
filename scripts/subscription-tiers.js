const subscriptionTiers = [
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
      charactersPerMonth: 10000,
      voiceClones: 0,
      requestsPerMinute: 5,
      audioLength: 3,
      availableVoices: ['standard']
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For content creators and small businesses',
    monthlyPrice: 29.99,
    yearlyPrice: 287.90,
    features: [
      { name: 'Standard Voices', description: 'Access to basic voice collection', included: true },
      { name: 'WaveNet Voices', description: 'Access to high-quality WaveNet voices', included: true },
      { name: 'Neural2 Voices', description: 'Access to advanced Neural2 voices', included: true },
      { name: 'Voice Cloning', description: 'Create up to 3 custom voice clones', included: true },
      { name: 'Priority Support', description: '24/7 priority customer support', included: false },
      { name: 'Commercial Usage', description: 'Use generated audio commercially', included: true }
    ],
    limits: {
      charactersPerMonth: 1000000,
      voiceClones: 3,
      requestsPerMinute: 15,
      audioLength: 10,
      availableVoices: ['standard', 'wavenet', 'neural2']
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For professional studios and enterprises',
    monthlyPrice: 79.99,
    yearlyPrice: 767.90,
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
      charactersPerMonth: 3000000,
      voiceClones: 10,
      requestsPerMinute: 30,
      audioLength: 30,
      availableVoices: ['standard', 'wavenet', 'neural2', 'studio', 'polyglot']
    }
  }
];

export { subscriptionTiers };
