import { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  Upload,
  Filter,
  Calendar,
  Tag,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { FileActionsMenu } from './FileActionsMenu';
import { fileManagementService, type FileMetadata, type FileSearchOptions } from '../../services/file-management.service';

interface FileListProps {
  searchQuery: string;
  activeFilter: string;
  showFavorites: boolean;
}

interface UploadProgress {
  [key: string]: number;
}

export function FileList({ searchQuery, activeFilter, showFavorites }: FileListProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadId = uuidv4();
    try {
      setError(null);
      setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

      await fileManagementService.uploadFile(
        file,
        {
          title: file.name,
          category: 'Uncategorized',
          tags: []
        },
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [uploadId]: progress }));
        }
      );

      // Refresh file list
      loadFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploadProgress(prev => {
        const { [uploadId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      setError(null);
      const blob = await fileManagementService.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.find(f => f.id === fileId)?.title || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
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
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      setError(null);
      await fileManagementService.updateFileMetadata(fileId, {
        ...file,
        favorite: !file.favorite
      });
      loadFiles();
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setError('Failed to update favorite status. Please try again.');
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
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <Tag className="w-4 h-4" />
              <span>Tags</span>
            </button>
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

      {/* Upload Button */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
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
                <div className="flex gap-2">
                  {file.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-white/10 rounded-full text-white/80"
                    >
                      {tag}
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
                      onDownload={() => handleDownload(file.id)}
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

      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([id, progress]) => (
        <div key={id} className="p-4 bg-white/5 rounded-lg">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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
