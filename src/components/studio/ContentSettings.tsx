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

  const voices = {
    library: [
      // US Journey voices
      'en-US-Journey-D', 'en-US-Journey-F', 'en-US-Journey-O',
      // GB Journey voices
      'en-GB-Journey-D', 'en-GB-Journey-F', 'en-GB-Journey-O',
      
      // US Casual voices
      'en-US-Casual-K',
      // GB Casual voices
      'en-GB-Casual-K',
      
      // US News voices
      'en-US-News-K', 'en-US-News-L', 'en-US-News-N',
      // GB News voices
      'en-GB-News-K', 'en-GB-News-L', 'en-GB-News-N',
      
      // US Studio voices
      'en-US-Studio-O', 'en-US-Studio-Q',
      // GB Studio voices
      'en-GB-Studio-O', 'en-GB-Studio-Q',
      
      // US Polyglot voices
      'en-US-Polyglot-1',
      // GB Polyglot voices
      'en-GB-Polyglot-1'
    ],
    clone: [
      'My Voice 1', 'My Voice 2', 'My Voice 3'
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
      voice: voices[type][0] // Set first voice of selected type as default
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
            {voices[settings.voiceType].map((voice) => (
              <option key={voice} value={voice}>
                {voice}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
