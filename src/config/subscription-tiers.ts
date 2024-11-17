export const subscriptionTiers = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      charactersPerMonth: 50000,
      maxAudioLength: 10, // minutes
      concurrentProjects: 2,
      voiceOptions: ['Google TTS Basic Voices'],
      downloadFormats: ['MP3'],
      support: 'Community',
    }
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    features: {
      charactersPerMonth: 500000,
      maxAudioLength: 30, // minutes
      concurrentProjects: 10,
      voiceOptions: [
        'Google TTS Premium Voices',
        'ElevenLabs Natural Voices',
        'Emotion Analysis'
      ],
      downloadFormats: ['MP3', 'WAV', 'OGG'],
      support: 'Email Support',
      additionalFeatures: [
        'Voice Customization',
        'Batch Processing',
        'Priority Queue'
      ]
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    features: {
      charactersPerMonth: 'Unlimited',
      maxAudioLength: 120, // minutes
      concurrentProjects: 'Unlimited',
      voiceOptions: [
        'All Pro Features',
        'Custom Voice Training',
        'Advanced Emotion Processing',
        'Azure Neural Voices'
      ],
      downloadFormats: ['MP3', 'WAV', 'OGG', 'FLAC'],
      support: '24/7 Priority Support',
      additionalFeatures: [
        'All Pro Features',
        'API Access',
        'Custom Integration',
        'SLA Guarantee',
        'Dedicated Account Manager'
      ]
    }
  }
};
