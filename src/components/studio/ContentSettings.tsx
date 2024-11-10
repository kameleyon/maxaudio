import { useState } from 'react';
import { Toggle } from '../ui/Toggle';

export interface ContentSettingsType {
  category: string;
  tone: string;
  voiceType: 'library' | 'clone';
  voice: string;
}

interface ContentSettingsProps {
  settings: ContentSettingsType;
  onChange: (settings: ContentSettingsType) => void;
}

interface VoiceOption {
  id: string;
  name: string;
  flag: string;
  gender: string;
  type: string;
}

export function ContentSettings({ settings, onChange }: ContentSettingsProps) {
  const categories = [
    'Podcast', 'TED Talk', 'News', 'Narrative', 'Class',
    'Advertisement', 'Comedy', 'Motivational', 'Meditation',
    'Mantra', 'Kids Content'
  ];

  const tones = [
    'Casual', 'Professional', 'Sarcastic', 'Energetic',
    'Angry', 'Sad', 'Excited', 'Calm', 'Detached'
  ];

  const voiceOptions: Record<'library' | 'clone', VoiceOption[]> = {
    library: [
      // US News Voices
      { id: 'en-US-News-K', name: 'Jackson', flag: '🇺🇸', gender: 'Male', type: 'News' },
      { id: 'en-US-News-L', name: 'Emma', flag: '🇺🇸', gender: 'Female', type: 'News' },
      { id: 'en-US-News-M', name: 'Noah', flag: '🇺🇸', gender: 'Male', type: 'News' },
      
      // GB News Voices
      { id: 'en-GB-News-K', name: 'William', flag: '🇬🇧', gender: 'Male', type: 'News' },
      { id: 'en-GB-News-L', name: 'Sophie', flag: '🇬🇧', gender: 'Female', type: 'News' },
      { id: 'en-GB-News-M', name: 'James', flag: '🇬🇧', gender: 'Male', type: 'News' },
      
      // US Studio Voices
      { id: 'en-US-Studio-M', name: 'Ethan', flag: '🇺🇸', gender: 'Male', type: 'Studio' },
      { id: 'en-US-Studio-O', name: 'Isabella', flag: '🇺🇸', gender: 'Female', type: 'Studio' },
      
      // GB Studio Voices
      { id: 'en-GB-Studio-M', name: 'Oliver', flag: '🇬🇧', gender: 'Male', type: 'Studio' },
      { id: 'en-GB-Studio-O', name: 'Charlotte', flag: '🇬🇧', gender: 'Female', type: 'Studio' },
      
      // US Neural Voices
      { id: 'en-US-Neural2-A', name: 'Zander', flag: '🇺🇸', gender: 'Male', type: 'Neural' },
      { id: 'en-US-Neural2-C', name: 'Luna', flag: '🇺🇸', gender: 'Female', type: 'Neural' },
      { id: 'en-US-Neural2-D', name: 'Kai', flag: '🇺🇸', gender: 'Male', type: 'Neural' },
      { id: 'en-US-Neural2-F', name: 'Maya', flag: '🇺🇸', gender: 'Female', type: 'Neural' },
      { id: 'en-US-Neural2-H', name: 'Sage', flag: '🇺🇸', gender: 'Female', type: 'Neural' },
      
      // GB Neural Voices
      { id: 'en-GB-Neural2-A', name: 'Lyra', flag: '🇬🇧', gender: 'Female', type: 'Neural' },
      { id: 'en-GB-Neural2-B', name: 'Finn', flag: '🇬🇧', gender: 'Male', type: 'Neural' },
      { id: 'en-GB-Neural2-D', name: 'Hugo', flag: '🇬🇧', gender: 'Male', type: 'Neural' },
      
      // US Synthesis Voices
      { id: 'en-US-Standard-A', name: 'Orion', flag: '🇺🇸', gender: 'Male', type: 'Synthesis' },
      { id: 'en-US-Standard-B', name: 'Jasper', flag: '🇺🇸', gender: 'Male', type: 'Synthesis' },
      { id: 'en-US-Standard-C', name: 'Aurora', flag: '🇺🇸', gender: 'Female', type: 'Synthesis' },
      { id: 'en-US-Standard-E', name: 'Iris', flag: '🇺🇸', gender: 'Female', type: 'Synthesis' },
      
      // GB Synthesis Voices
      { id: 'en-GB-Standard-A', name: 'Isla', flag: '🇬🇧', gender: 'Female', type: 'Synthesis' },
      { id: 'en-GB-Standard-B', name: 'Felix', flag: '🇬🇧', gender: 'Male', type: 'Synthesis' },
      { id: 'en-GB-Standard-C', name: 'Flora', flag: '🇬🇧', gender: 'Female', type: 'Synthesis' },
      { id: 'en-GB-Standard-D', name: 'Arthur', flag: '🇬🇧', gender: 'Male', type: 'Synthesis' }
    ],
    clone: [
      { id: 'voice1', name: 'My Voice 1', flag: '🎙️', gender: 'Custom', type: 'Clone' },
      { id: 'voice2', name: 'My Voice 2', flag: '🎙️', gender: 'Custom', type: 'Clone' },
      { id: 'voice3', name: 'My Voice 3', flag: '🎙️', gender: 'Custom', type: 'Clone' }
    ]
  };

  const handleSettingChange = (key: keyof ContentSettingsType, value: string) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const handleVoiceTypeChange = (type: 'library' | 'clone') => {
    onChange({
      ...settings,
      voiceType: type,
      voice: voiceOptions[type][0].id // Set first voice of selected type as default
    });
  };

  const selectClasses = `
    w-full px-4 py-2 
    bg-white/10 backdrop-blur-sm 
    border border-white/20 
    rounded-lg 
    text-white
    focus:outline-none focus:border-[#9de9c7] focus:ring-1 focus:ring-[#9de9c7]
    appearance-none
    [&>option]:bg-[#0f0035]
    [&>option]:text-white
    [&>option]:backdrop-blur-sm
  `;

  // Group voices by type for better organization
  const groupedVoices = voiceOptions[settings.voiceType].reduce((acc, voice) => {
    if (!acc[voice.type]) {
      acc[voice.type] = [];
    }
    acc[voice.type].push(voice);
    return acc;
  }, {} as Record<string, VoiceOption[]>);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings</h2>
      
      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            value={settings.category}
            onChange={(e) => handleSettingChange('category', e.target.value)}
            className={selectClasses}
          >
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tone
          </label>
          <select
            value={settings.tone}
            onChange={(e) => handleSettingChange('tone', e.target.value)}
            className={selectClasses}
          >
            {tones.map((tone) => (
              <option key={tone} value={tone.toLowerCase()}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Voice</label>
            <Toggle
              value={settings.voiceType}
              onChange={handleVoiceTypeChange}
              options={[
                { value: 'library', label: 'Library' },
                { value: 'clone', label: 'Clone' }
              ]}
            />
          </div>
          
          <select
            value={settings.voice}
            onChange={(e) => handleSettingChange('voice', e.target.value)}
            className={selectClasses}
          >
            {Object.entries(groupedVoices).map(([type, voices]) => (
              <optgroup key={type} label={`${type} Voices`}>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {`${voice.flag} ${voice.name} (${voice.gender})`}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
