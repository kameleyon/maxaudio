export interface VoicePreset {
  id: string;
  name: string;
  languageCode: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  voiceName: string;
  settings: {
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
  };
  tags: string[];
  tier: 'free' | 'pro' | 'premium';
}

export const DEFAULT_VOICE_SETTINGS = {
  speakingRate: 1.0,
  pitch: 0.0,
  volumeGainDb: 0.0
};

export const VOICE_PRESETS: VoicePreset[] = [
  // Free Tier Voices
  {
    id: 'en-us-standard-1',
    name: 'American English - Male',
    languageCode: 'en-US',
    gender: 'MALE',
    voiceName: 'en-US-Standard-A',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['standard', 'american', 'clear'],
    tier: 'free'
  },
  {
    id: 'en-us-standard-2',
    name: 'American English - Female',
    languageCode: 'en-US',
    gender: 'FEMALE',
    voiceName: 'en-US-Standard-B',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['standard', 'american', 'clear'],
    tier: 'free'
  },
  {
    id: 'en-gb-standard-1',
    name: 'British English - Male',
    languageCode: 'en-GB',
    gender: 'MALE',
    voiceName: 'en-GB-Standard-A',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['standard', 'british', 'clear'],
    tier: 'free'
  },

  // Pro Tier Voices
  {
    id: 'en-us-neural-1',
    name: 'American English - Neural Male',
    languageCode: 'en-US',
    gender: 'MALE',
    voiceName: 'en-US-Neural-A',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['neural', 'american', 'natural'],
    tier: 'pro'
  },
  {
    id: 'en-us-neural-2',
    name: 'American English - Neural Female',
    languageCode: 'en-US',
    gender: 'FEMALE',
    voiceName: 'en-US-Neural-B',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['neural', 'american', 'natural'],
    tier: 'pro'
  },
  {
    id: 'en-gb-neural-1',
    name: 'British English - Neural Male',
    languageCode: 'en-GB',
    gender: 'MALE',
    voiceName: 'en-GB-Neural-A',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['neural', 'british', 'natural'],
    tier: 'pro'
  },

  // Premium Tier Voices
  {
    id: 'en-us-studio-1',
    name: 'American English - Studio Male',
    languageCode: 'en-US',
    gender: 'MALE',
    voiceName: 'en-US-Studio-M',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['studio', 'american', 'professional'],
    tier: 'premium'
  },
  {
    id: 'en-us-studio-2',
    name: 'American English - Studio Female',
    languageCode: 'en-US',
    gender: 'FEMALE',
    voiceName: 'en-US-Studio-F',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['studio', 'american', 'professional'],
    tier: 'premium'
  },
  {
    id: 'en-gb-studio-1',
    name: 'British English - Studio Male',
    languageCode: 'en-GB',
    gender: 'MALE',
    voiceName: 'en-GB-Studio-M',
    settings: { ...DEFAULT_VOICE_SETTINGS },
    tags: ['studio', 'british', 'professional'],
    tier: 'premium'
  }
];

export const getVoicesByTier = (tier: 'free' | 'pro' | 'premium'): VoicePreset[] => {
  const tiers = {
    free: ['free'],
    pro: ['free', 'pro'],
    premium: ['free', 'pro', 'premium']
  };

  return VOICE_PRESETS.filter(voice => tiers[tier].includes(voice.tier));
};

export const getVoiceById = (id: string): VoicePreset | undefined => {
  return VOICE_PRESETS.find(voice => voice.id === id);
};

export const getVoicesByLanguage = (languageCode: string): VoicePreset[] => {
  return VOICE_PRESETS.filter(voice => voice.languageCode === languageCode);
};

export const getVoicesByTags = (tags: string[]): VoicePreset[] => {
  return VOICE_PRESETS.filter(voice => 
    tags.some(tag => voice.tags.includes(tag.toLowerCase()))
  );
};
