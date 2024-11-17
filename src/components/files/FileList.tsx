import { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  Upload,
  Filter,
  Calendar,
  Tag,
  RefreshCw,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { FileActionsMenu } from './FileActionsMenu';
import { AudioPlayer } from './AudioPlayer';
import { fileManagementService, type FileMetadata, type FileSearchOptions } from '../../services/file-management.service';

interface FileListProps {
  searchQuery: string;
  activeFilter: string;
  showFavorites: boolean;
}

export function FileList({ searchQuery, activeFilter, showFavorites }: FileListProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  // Load files
  useEffect(() => {
    loadFiles();
  }, [searchQuery, activeFilter, showFavorites, sortBy, sortOrder, selectedTags, dateRange]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchOptions: FileSearchOptions = {
        query: searchQuery,
        category: activeFilter === 'all' ? undefined : activeFilter,
        favorite: showFavorites,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        sortBy,
        sortOrder
      };

      const results = await fileManagementService.searchFiles(searchOptions);
      setFiles(results);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      setError(null);
      await fileManagementService.deleteFile(fileId);
      loadFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleToggleFavorite = async (fileId: string) => {
    try {
      setError(null);
      await fileManagementService.toggleFavorite(fileId);
      loadFiles();
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  const handleAddTag = async (fileId: string) => {
    if (!newTag.trim()) return;

    try {
      setError(null);
      await fileManagementService.addTag(fileId, newTag.trim());
      setNewTag('');
      setShowTagInput(false);
      loadFiles();
    } catch (err) {
      console.error('Error adding tag:', err);
      setError('Failed to add tag. Please try again.');
    }
  };

  const handleRemoveTag = async (fileId: string, tag: string) => {
    try {
      setError(null);
      await fileManagementService.removeTag(fileId, tag);
      loadFiles();
    } catch (err) {
      console.error('Error removing tag:', err);
      setError('Failed to remove tag. Please try again.');
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      setError(null);
      const blob = await fileManagementService.downloadFile(fileId, filename);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Tags Filter */}
          <div className="relative">
            <button 
              onClick={() => setShowTagInput(!showTagInput)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>Tags</span>
            </button>
            {showTagInput && (
              <div className="absolute top-full mt-2 p-2 bg-gray-800 rounded-lg shadow-lg z-10">
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded"
                  />
                  <button
                    onClick={() => handleAddTag(activeFile!)}
                    disabled={!newTag.trim() || !activeFile}
                    className="p-1 bg-primary hover:bg-primary/80 rounded disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                        className="p-0.5 hover:bg-white/10 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'size')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="size">Size</option>
          </select>

          <button
            onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white/5 rounded-lg border border-white/10">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b border-white/10 text-white/60">
          <div>Date</div>
          <div>Title</div>
          <div>Category</div>
          <div>Size</div>
          <div>Tags</div>
          <div className="w-10"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/10">
          {files.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              No files found matching your criteria
            </div>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[1fr,2fr,1fr,1fr,1fr,auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors"
              >
                <div className="text-white/80">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
                <div className="text-white font-medium">{file.title}</div>
                <div className="text-white/80">{file.category}</div>
                <div className="text-white/80">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
                <div className="flex flex-wrap gap-2">
                  {file.tags.map(tag => (
                    <span
                      key={tag}
                      className="group flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(file.id, tag)}
                        className="hidden group-hover:block p-0.5 hover:bg-white/10 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
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
                      onDownload={() => handleDownload(file.id, file.originalName)}
                      onDelete={() => handleDelete(file.id)}
                      onFavorite={() => handleToggleFavorite(file.id)}
                      onClose={() => setActiveFile(null)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audio Players */}
      {files.map(file => (
        <AudioPlayer
          key={file.id}
          url={file.url!}
          isPlaying={isPlaying === file.id}
          onEnded={() => setIsPlaying(null)}
        />
      ))}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
