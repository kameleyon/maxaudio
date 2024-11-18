import { useState, useEffect } from 'react';
import { Toggle } from '../ui/Toggle';
import api from '../../services/api';

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
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Podcast', 'TED Talk', 'News', 'Narrative', 'Class',
    'Advertisement', 'Comedy', 'Motivational', 'Meditation',
    'Mantra', 'Kids Content'
  ];

  const tones = [
    'Casual', 'Professional', 'Sarcastic', 'Energetic',
    'Angry', 'Sad', 'Excited', 'Calm', 'Detached'
  ];

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await api.get('/tts/voices');
        console.log('Available voices:', response.data);
        setVoices(response.data);
        // If no voice is selected, set the first available voice
        if (!settings.voice && response.data.length > 0) {
          onChange({
            ...settings,
            voice: response.data[0].id
          });
        }
      } catch (err) {
        console.error('Error fetching voices:', err);
        setError('Failed to load voices');
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();
  }, []);

  const handleSettingChange = (key: keyof ContentSettingsType, value: string) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const handleVoiceTypeChange = (type: 'library' | 'clone') => {
    const filteredVoices = voices.filter(voice => 
      type === 'library' 
        ? ['PlayHT', 'FastPitch', 'Coqui'].includes(voice.type)
        : voice.type === 'Clone'
    );

    onChange({
      ...settings,
      voiceType: type,
      voice: filteredVoices[0]?.id || settings.voice // Keep current voice if no alternatives found
    });
  };

  const selectClasses = `
    w-full px-4 py-2 
    bg-[#ffffff20] 
    border border-[#ffffff]/30 
    rounded-lg 
    text-white/90
    focus:outline-none 
    focus:border-[#ffffff] 
    focus:ring-1 
    focus:ring-[#ffffff]
    appearance-none
    hover:border-[#ffffff]/20
    transition-colors
  `;

  const optionClasses = `
    bg-[#1a1a2e]
    text-white/90
    hover:bg-[#63248d]/20
  `;

  const optgroupClasses = `
    bg-[#1a1a2e]
    text-[#63248d]
  `;

  // Filter voices based on selected type
  const filteredVoices = voices.filter(voice => 
    settings.voiceType === 'library' 
      ? ['PlayHT', 'FastPitch', 'Coqui'].includes(voice.type)
      : voice.type === 'Clone'
  );

  // Group voices by type for better organization
  const groupedVoices = filteredVoices.reduce((acc, voice) => {
    if (!acc[voice.type]) {
      acc[voice.type] = [];
    }
    acc[voice.type].push(voice);
    return acc;
  }, {} as Record<string, VoiceOption[]>);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white/90">Settings</h2>
      
      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">
            Category
          </label>
          <select
            value={settings.category}
            onChange={(e) => handleSettingChange('category', e.target.value)}
            className={selectClasses}
          >
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()} className={optionClasses}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-white/80">
            Tone
          </label>
          <select
            value={settings.tone}
            onChange={(e) => handleSettingChange('tone', e.target.value)}
            className={selectClasses}
          >
            {tones.map((tone) => (
              <option key={tone} value={tone.toLowerCase()} className={optionClasses}>
                {tone}
              </option>
            ))}
          </select>
        </div>

        {/* Voice Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/80">Voice</label>
            <Toggle
              value={settings.voiceType}
              onChange={handleVoiceTypeChange}
              options={[
                { value: 'library', label: 'Library' },
                { value: 'clone', label: 'Clone' }
              ]}
            />
          </div>
          
          {loading ? (
            <div className="text-white/60">Loading voices...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <select
              value={settings.voice}
              onChange={(e) => handleSettingChange('voice', e.target.value)}
              className={selectClasses}
              style={{
                background: '#ffffff20',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {Object.entries(groupedVoices).map(([type, voices]) => (
                <optgroup 
                  key={type} 
                  label={type}
                  style={{
                    background: '#1a1a2e',
                    color: '#63248d',
                    fontWeight: '600'
                  }}
                >
                  {voices.map((voice) => (
                    <option 
                      key={voice.id} 
                      value={voice.id}
                      style={{
                        background: '#1a1a2e',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {voice.flag} {voice.name} ({voice.gender})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
