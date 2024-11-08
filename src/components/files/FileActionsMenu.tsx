import {
  Download,
  Share2,
  Trash2,
  Edit2,
  Star,
  Archive,
  Play,
  Pause
} from 'lucide-react'

interface FileActionsMenuProps {
  file: {
    id: string;
    title: string;
    favorite: boolean;
    transcript?: string;
  };
  isPlaying: boolean;
  onPlay: () => void;
  onClose: () => void;
  onDownload: () => void;
  onFavorite: () => void;
}

export function FileActionsMenu({ 
  file, 
  isPlaying, 
  onPlay, 
  onClose,
  onDownload,
  onFavorite 
}: FileActionsMenuProps) {
  const actions = [
    {
      icon: isPlaying ? Pause : Play,
      label: isPlaying ? 'Pause' : 'Play',
      onClick: onPlay
    },
    {
      icon: Download,
      label: 'Download',
      onClick: onDownload
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: file.title,
            text: file.transcript || 'Check out this audio file!',
            url: window.location.href
          }).catch(console.error);
        }
      }
    },
    {
      icon: Star,
      label: file.favorite ? 'Unfavorite' : 'Favorite',
      onClick: onFavorite
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => console.log('Delete', file.id),
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
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
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
