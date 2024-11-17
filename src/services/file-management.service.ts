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
  userId?: string;
  url?: string;
  originalName: string;
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
   * Search files with filtering and sorting
   */
  async searchFiles(options: FileSearchOptions): Promise<FileMetadata[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, { params: options });
      return response.data.map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt)
      }));
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    try {
      const response = await axios.get(`${this.baseUrl}/${fileId}`);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
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
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
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
   * Download a file
   */
  async downloadFile(fileId: string, filename: string): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseUrl}/audio/${fileId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Add tag to file
   */
  async addTag(fileId: string, tag: string): Promise<FileMetadata> {
    try {
      const response = await axios.post(`${this.baseUrl}/${fileId}/tags`, { tag });
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  /**
   * Remove tag from file
   */
  async removeTag(fileId: string, tag: string): Promise<FileMetadata> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${fileId}/tags/${tag}`);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(fileId: string): Promise<FileMetadata> {
    try {
      const response = await axios.post(`${this.baseUrl}/${fileId}/favorite`);
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
