import { 
  Download, 
  Share2, 
  Trash2, 
  Edit2, 
  Star,
  Play,
  Pause,
  X
} from 'lucide-react';
import { type FileMetadata } from '../../services/file-management.service';

interface FileActionsMenuProps {
  file: FileMetadata;
  isPlaying: boolean;
  onPlay: () => void;
  onDownload: () => Promise<void>;
  onDelete: () => Promise<void>;
  onFavorite: () => Promise<void>;
  onClose: () => void;
}

export function FileActionsMenu({
  file,
  isPlaying,
  onPlay,
  onDownload,
  onDelete,
  onFavorite,
  onClose
}: FileActionsMenuProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 z-50">
      <div className="p-1">
        {/* Play/Pause */}
        <button
          onClick={onPlay}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Play</span>
            </>
          )}
        </button>

        {/* Download */}
        <button
          onClick={onDownload}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            // TODO: Implement sharing
          }}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {/* Edit */}
        <button
          onClick={() => {
            // TODO: Implement editing
          }}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>

        {/* Favorite */}
        <button
          onClick={onFavorite}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Star className={`w-4 h-4 ${file.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          <span>{file.favorite ? 'Unfavorite' : 'Favorite'}</span>
        </button>

        <div className="h-px bg-white/10 my-1" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 p-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export type { FileActionsMenuProps };
