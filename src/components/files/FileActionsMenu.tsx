import { 
  Play, 
  Pause, 
  Download, 
  Trash2, 
  Star,
  Tag,
  X 
} from 'lucide-react';
import { FileMetadata } from '../../services/file-management.service';

interface FileActionsMenuProps {
  file: FileMetadata;
  isPlaying: boolean;
  onPlay: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onFavorite: () => void;
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
    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-10">
      <div className="p-1">
        {/* Play/Pause */}
        <button
          onClick={onPlay}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
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
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>

        {/* Favorite */}
        <button
          onClick={onFavorite}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${file.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} 
          />
          <span>{file.favorite ? 'Unfavorite' : 'Favorite'}</span>
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
