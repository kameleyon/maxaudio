interface VoicePreset {
  id: string
  name: string
  settings: {
    tone: string
    emotion: string
  }
  purpose: string
}

export function FavoriteVoices() {
  const favoritePresets: VoicePreset[] = [
    {
      id: '1',
      name: 'Professional Narrator',
      settings: {
        tone: 'Professional',
        emotion: 'Confident'
      },
      purpose: 'Podcast'
    },
    {
      id: '2',
      name: 'Inspirational Speaker',
      settings: {
        tone: 'Motivational',
        emotion: 'Energetic'
      },
      purpose: 'TED Talk'
    },
    {
      id: '3',
      name: 'Storyteller',
      settings: {
        tone: 'Warm',
        emotion: 'Engaging'
      },
      purpose: 'Kids Content'
    }
  ]

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold">Favorite Voice Presets</h3>
      </div>

      <div className="divide-y divide-white/10">
        {favoritePresets.map((preset) => (
          <div key={preset.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{preset.name}</h4>
              <span className="text-sm text-white/60">{preset.purpose}</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Tone:</span>
                <span>{preset.settings.tone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Emotion:</span>
                <span>{preset.settings.emotion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}