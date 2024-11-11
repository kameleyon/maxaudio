import axios from 'axios';

interface FileMetadata {
  id: string;
  title: string;
  category: string;
  tone?: string;
  voice?: string;
  favorite: boolean;
  size: number;
  format: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  transcription?: string;
  userId: string;
}

interface FileUploadOptions {
  title: string;
  category: string;
  tone?: string;
  voice?: string;
  tags?: string[];
}

interface FileSearchOptions {
  query?: string;
  category?: string;
  favorite?: boolean;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'date' | 'title' | 'size';
  sortOrder?: 'asc' | 'desc';
}

class FileManagementService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/files';
  }

  /**
   * Upload a file with optimizations
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions,
    onProgress?: (progress: number) => void
  ): Promise<FileMetadata> {
    try {
      // Get signed upload URL
      const { data: { url, fields } } = await axios.post(`${this.baseUrl}/upload-url`, {
        filename: file.name,
        contentType: file.type
      });

      // Create form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      // Upload file
      await axios.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress((progressEvent.loaded / progressEvent.total) * 100);
          }
        }
      });

      // Create file metadata
      const response = await axios.post(`${this.baseUrl}/metadata`, {
        ...options,
        size: file.size,
        format: file.type,
        uploadUrl: url
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string, onProgress?: (progress: number) => void): Promise<Blob> {
    try {
      // Get signed download URL
      const { data: { url } } = await axios.get(`${this.baseUrl}/download-url/${fileId}`);

      // Download file
      const response = await axios.get(url, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress((progressEvent.loaded / progressEvent.total) * 100);
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Search files with filtering and sorting
   */
  async searchFiles(options: FileSearchOptions): Promise<FileMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, { params: options });
      return response.data;
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    updates: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    try {
      const response = await axios.patch(`${this.baseUrl}/metadata/${fileId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Validate file format
   */
  isValidAudioFormat(file: File): boolean {
    const validFormats = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/mp4',
      'audio/aac'
    ];
    return validFormats.includes(file.type);
  }

  /**
   * Validate file size (max 100MB)
   */
  isValidFileSize(file: File): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    return file.size <= maxSize;
  }
}

export const fileManagementService = new FileManagementService();
export type { FileMetadata, FileUploadOptions, FileSearchOptions };
