import { useState } from 'react'
import { Play, Pause, MoreVertical } from 'lucide-react'
import { VoiceActionsMenu } from './VoiceActionsMenu'

export function VoiceList() {
  const [activeVoice, setActiveVoice] = useState<string | null>(null)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  const voices = [
    {
      id: '1',
      name: 'Professional Voice 1',
      date: '2023-12-20',
      favorite: true,
    },
    {
      id: '2',
      name: 'Casual Voice',
      date: '2023-12-19',
      favorite: false,
    },
    {
      id: '3',
      name: 'Storyteller Voice',
      date: '2023-12-18',
      favorite: true,
    }
  ]

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      <div className="p-4 border-b border-white/10">
        <h3 className="font-semibold">My Cloned Voices</h3>
      </div>

      <div className="divide-y divide-white/10">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className="grid grid-cols-[1fr,2fr,auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors"
          >
            <div className="text-white/80">{voice.date}</div>
            <div className="text-white font-medium">{voice.name}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlayingVoice(playingVoice === voice.id ? null : voice.id)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              >
                {playingVoice === voice.id ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setActiveVoice(activeVoice === voice.id ? null : voice.id)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeVoice === voice.id && (
                  <VoiceActionsMenu
                    voice={voice}
                    onClose={() => setActiveVoice(null)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}