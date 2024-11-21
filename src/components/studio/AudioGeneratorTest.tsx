import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getVoicesByTier, type VoicePreset } from '../../config/voice-presets';
import { Settings, Play, Volume2, RefreshCw, AlertCircle } from 'lucide-react';

interface UserPreferences {
  defaultVoiceId?: string;
  defaultLanguage?: string;
  defaultSettings?: {
    speakingRate: number;
    pitch: number;
    volumeGainDb: number;
  };
}

// Get the correct audio endpoint based on environment
const getAudioEndpoint = () => {
  if (import.meta.env.PROD) {
    return '/.netlify/functions/generateAudio';
  }
  return '/api/audio/generate';
};

export function AudioGeneratorTest() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [availableVoices, setAvailableVoices] = useState<VoicePreset[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset | null>(null);
  const [settings, setSettings] = useState({
    speakingRate: 1.0,
    pitch: 0.0,
    volumeGainDb: 0.0
  });
  const [usageLimit, setUsageLimit] = useState<number | null>(null);
  const [currentUsage, setCurrentUsage] = useState<number>(0);

  // Load user preferences and available voices
  useEffect(() => {
    if (user) {
      // Get user's subscription tier based on role
      const tier = user.role === 'admin' ? 'premium' : 'free';
      const voices = getVoicesByTier(tier as 'free' | 'pro' | 'premium');
      setAvailableVoices(voices);

      // Set usage limits based on tier
      const limits = {
        free: 100,
        pro: 1000,
        premium: 10000
      };
      setUsageLimit(limits[tier as keyof typeof limits]);

      // Get current usage
      fetch('/api/usage/audio')
        .then(res => res.json())
        .then(data => setCurrentUsage(data.currentUsage))
        .catch(console.error);
    }
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;

    const preferences: UserPreferences = {
      defaultVoiceId: selectedVoice?.id,
      defaultSettings: settings
    };

    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      });
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences');
    }
  };

  const generateAudio = async () => {
    if (!selectedVoice || !text.trim()) return;
    if (currentUsage >= (usageLimit || 0)) {
      setError('Usage limit reached. Please upgrade your plan.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(getAudioEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: selectedVoice.languageCode,
          voiceName: selectedVoice.voiceName,
          ...settings
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }
      
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      setCurrentUsage(prev => prev + 1);
    } catch (err) {
      console.error('Audio generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <p className="text-center text-white/60">Please sign in to use the audio generator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold mb-4">Audio Generator</h2>
        
        {/* Usage Display */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Usage</span>
            <span>{currentUsage} / {usageLimit}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(currentUsage / (usageLimit || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/60 mb-2">
            Voice
          </label>
          <select
            value={selectedVoice?.id || ''}
            onChange={(e) => {
              const voice = availableVoices.find(v => v.id === e.target.value);
              if (voice) setSelectedVoice(voice);
            }}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="">Select a voice</option>
            {availableVoices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name} ({voice.tier})
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/60 mb-2">
            Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 px-4 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
            placeholder="Enter text to convert to speech..."
          />
        </div>

        {/* Voice Settings */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Speaking Rate
            </label>
            <input
              type="range"
              min="0.25"
              max="4.0"
              step="0.25"
              value={settings.speakingRate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                speakingRate: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <div className="text-sm text-white/60 text-center">
              {settings.speakingRate}x
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Pitch
            </label>
            <input
              type="range"
              min="-20.0"
              max="20.0"
              step="1.0"
              value={settings.pitch}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                pitch: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <div className="text-sm text-white/60 text-center">
              {settings.pitch > 0 ? '+' : ''}{settings.pitch}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Volume Gain
            </label>
            <input
              type="range"
              min="-96.0"
              max="16.0"
              step="1.0"
              value={settings.volumeGainDb}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                volumeGainDb: parseFloat(e.target.value)
              }))}
              className="w-full"
            />
            <div className="text-sm text-white/60 text-center">
              {settings.volumeGainDb > 0 ? '+' : ''}{settings.volumeGainDb} dB
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={generateAudio}
            disabled={isGenerating || !selectedVoice || !text.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Audio</span>
              </>
            )}
          </button>

          <button
            onClick={savePreferences}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Save current settings as default"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="mt-6">
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
