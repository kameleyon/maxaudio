import { useState, useEffect } from 'react'
import { 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  Edit2, 
  Star,
  Archive,
  Play,
  Pause
} from 'lucide-react'
import { FileActionsMenu } from './FileActionsMenu'

interface AudioFile {
  id: string;
  title: string;
  date: string;
  category: string;
  tone: string;
  voice: string;
  favorite: boolean;
  transcript?: string;
  fileName: string;
}

interface FileListProps {
  searchQuery: string;
  activeFilter: string;
  showFavorites: boolean;
}

export function FileList({ searchQuery, activeFilter, showFavorites }: FileListProps) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/audio/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      setError('Failed to load files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      window.open(`/api/audio/download/${fileId}`, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const handleFavorite = async (fileId: string) => {
    try {
      const response = await fetch(`/api/audio/favorite/${fileId}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      await fetchFiles(); // Refresh the list
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  // Filter files based on search query, active filter, and favorites
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || file.category.toLowerCase() === activeFilter;
    const matchesFavorites = !showFavorites || file.favorite;

    return matchesSearch && matchesFilter && matchesFavorites;
  });

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-8">
        <div className="text-center text-white/60">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 rounded-lg border border-white/10 p-8">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg border border-white/10">
      {/* Table Header */}
      <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b border-white/10 text-white/60">
        <div>Date</div>
        <div>Title</div>
        <div>Category</div>
        <div>Tone</div>
        <div>Voice</div>
        <div className="w-10"></div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/10">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-white/60">
            No files found matching your criteria
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="text-white/80">{file.date}</div>
              <div className="text-white font-medium">{file.title}</div>
              <div className="text-white/80">{file.category}</div>
              <div className="text-white/80">{file.tone}</div>
              <div className="text-white/80">{file.voice}</div>
              <div className="relative">
                <button
                  onClick={() => setActiveFile(activeFile === file.id ? null : file.id)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-white/80" />
                </button>

                {activeFile === file.id && (
                  <FileActionsMenu
                    file={file}
                    isPlaying={isPlaying === file.id}
                    onPlay={() => setIsPlaying(isPlaying === file.id ? null : file.id)}
                    onDownload={() => handleDownload(file.id)}
                    onFavorite={() => handleFavorite(file.id)}
                    onClose={() => setActiveFile(null)}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
