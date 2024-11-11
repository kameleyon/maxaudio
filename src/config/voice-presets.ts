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
  capabilities: {
    ssml: boolean;
    customization: boolean;
    neuralVoice: boolean;
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
    capabilities: {
      ssml: true,
      customization: false,
      neuralVoice: false
    },
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
    capabilities: {
      ssml: true,
      customization: false,
      neuralVoice: false
    },
    tags: ['standard', 'american', 'clear'],
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
    capabilities: {
      ssml: true,
      customization: true,
      neuralVoice: true
    },
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
    capabilities: {
      ssml: true,
      customization: true,
      neuralVoice: true
    },
    tags: ['neural', 'american', 'natural'],
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
    capabilities: {
      ssml: true,
      customization: true,
      neuralVoice: true
    },
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
    capabilities: {
      ssml: true,
      customization: true,
      neuralVoice: true
    },
    tags: ['studio', 'american', 'professional'],
    tier: 'premium'
  }
];

export const getVoicesByCapability = (capability: keyof VoicePreset['capabilities']): VoicePreset[] => {
  return VOICE_PRESETS.filter(voice => voice.capabilities[capability]);
};

export const getSSMLCompatibleVoices = (): VoicePreset[] => {
  return getVoicesByCapability('ssml');
};

export const getCustomizableVoices = (): VoicePreset[] => {
  return getVoicesByCapability('customization');
};

export const getNeuralVoices = (): VoicePreset[] => {
  return getVoicesByCapability('neuralVoice');
};

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
