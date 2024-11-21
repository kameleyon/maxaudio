import { Edit2, Star, Trash2 } from 'lucide-react'

interface VoiceActionsMenuProps {
  voice: {
    id: string
    name: string
    favorite: boolean
  }
  onClose: () => void
}

export function VoiceActionsMenu({ voice, onClose }: VoiceActionsMenuProps) {
  const actions = [
    {
      icon: Edit2,
      label: 'Rename',
      onClick: () => console.log('Rename', voice.id)
    },
    {
      icon: Star,
      label: voice.favorite ? 'Unfavorite' : 'Favorite',
      onClick: () => console.log('Toggle favorite', voice.id)
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => console.log('Delete', voice.id),
      className: 'text-red-400 hover:text-red-300'
    }
  ]

  return (
    <div
      className="absolute right-0 top-8 z-10 w-48 bg-[#0f0035] border border-white/10 rounded-lg shadow-lg py-1"
      onMouseLeave={onClose}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors ${
            action.className || 'text-white/80 hover:text-white'
          }`}
        >
          <action.icon className="w-4 h-4" />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}