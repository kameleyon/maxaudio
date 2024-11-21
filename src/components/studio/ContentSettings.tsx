import { useState, useEffect } from 'react';
import { Toggle } from '../ui/Toggle';
import api from '../../services/api';

export interface ContentSettingsType {
  category: string;
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
  flag?: string;
  gender: string;
  type: string;
  accent?: string;
  language?: string;
}

export function ContentSettings({ settings, onChange }: ContentSettingsProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audiences = [
    {
      id: 'social-media',
      name: 'Social Media-Friendly, Podcast',
      description: 'short, engaging, casual, conversational'
    },
    {
      id: 'educational',
      name: 'Educational, Teaching, Training',
      description: 'structured, informative, accessible'
    },
    {
      id: 'storytelling',
      name: 'Storytelling, Narrative, Entertaining',
      description: 'compelling, narrative-driven, engaging, captivating'
    },
    {
      id: 'deep-content',
      name: 'Deep/Debate Content, Motivational, TedTalk',
      description: 'thought-provoking, insightful, balanced'
    },
    {
      id: 'meditation',
      name: 'Meditation, Mantra, Prayers, ASMR',
      description: 'smooth, calm, slow'
    }
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

  // Get country flag emoji based on accent/language
  const getCountryFlag = (voice: VoiceOption): string => {
    if (!voice.accent && !voice.language) return '🌐';

    const accentOrLanguage = (voice.accent || voice.language || '').toLowerCase();
    
    const flagMap: { [key: string]: string } = {
      'american': '🇺🇸',
      'british': '🇬🇧',
      'australian': '🇦🇺',
      'indian': '🇮🇳',
      'african': '🌍',
      'irish': '🇮🇪',
      'scottish': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'canadian': '🇨🇦',
      'newzealand': '🇳🇿',
      'southafrican': '🇿🇦',
      'english': '🇺🇸',
      'en-us': '🇺🇸',
      'en-gb': '🇬🇧',
      'en-au': '🇦🇺',
      'en-in': '🇮🇳'
    };

    return flagMap[accentOrLanguage] || '🌐';
  };

  // Filter voices based on selected type
  const filteredVoices = voices.filter(voice => 
    settings.voiceType === 'library' 
      ? ['PlayHT', 'FastPitch', 'Coqui'].includes(voice.type)
      : voice.type === 'Clone'
  );

  return (
    <div className="space-y-4">
      {/*<h2 className="text-lg font-semibold text-white/90">Settings</h2>*/}
      
      <div className="space-y-4">
        {/* Audience Selection */}
        <label className="text-sm font-medium text-white/80">Choose your audience</label>
        <div>
          <select
            value={settings.category}
            onChange={(e) => handleSettingChange('category', e.target.value)}
            className={selectClasses}
          >
            {audiences.map((audience) => (
              <option 
                key={audience.id} 
                value={audience.id} 
                className={optionClasses}
              >
                {audience.name}
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
              {filteredVoices.map((voice) => (
                <option 
                  key={voice.id} 
                  value={voice.id}
                  style={{
                    background: '#1a1a2e',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  {getCountryFlag(voice)} {voice.name} ({voice.gender})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
