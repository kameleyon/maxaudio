import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
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

interface StorageMetadata {
  size: number;
  timeCreated: string;
  updated: string;
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
  private storage: Storage;
  private bucketName: string;
  private baseUrl: string;

  constructor() {
    this.storage = new Storage();
    this.bucketName = process.env.GOOGLE_STORAGE_BUCKET || 'audio-files';
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
      // Validate file format
      if (!this.isValidAudioFormat(file)) {
        throw new Error('Invalid audio format. Supported formats: MP3, WAV, M4A, AAC');
      }

      // Check file size
      if (!this.isValidFileSize(file)) {
        throw new Error('File size exceeds limit. Maximum size: 100MB');
      }

      // Optimize file if needed
      const optimizedFile = await this.optimizeFile(file);

      // Generate unique filename
      const filename = `${uuidv4()}-${file.name}`;
      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(filename);

      // Create write stream with compression
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type,
          metadata: {
            originalName: file.name,
            ...options
          }
        },
        resumable: true,
        gzip: true
      });

      // Upload with progress tracking
      let uploadedBytes = 0;
      const fileSize = optimizedFile.size;

      const uploadPromise = new Promise<FileMetadata>((resolve, reject) => {
        blobStream.on('error', (error) => {
          reject(error);
        });

        blobStream.on('progress', (progress: { bytesWritten: number }) => {
          uploadedBytes = progress.bytesWritten;
          if (onProgress) {
            onProgress((uploadedBytes / fileSize) * 100);
          }
        });

        blobStream.on('finish', async () => {
          // Get file metadata
          const [metadata] = await blob.getMetadata();
          const storageMetadata = metadata as StorageMetadata;

          const fileMetadata: FileMetadata = {
            id: filename,
            title: options.title,
            category: options.category,
            tone: options.tone,
            voice: options.voice,
            favorite: false,
            size: Number(storageMetadata.size),
            format: file.type,
            createdAt: new Date(storageMetadata.timeCreated),
            updatedAt: new Date(storageMetadata.updated),
            tags: options.tags || [],
            userId: 'current-user-id' // TODO: Get from auth context
          };

          // Save metadata to database
          const response = await axios.post(`${this.baseUrl}/metadata`, fileMetadata);
          resolve(response.data);
        });
      });

      // Write file to stream
      const reader = new FileReader();
      reader.readAsArrayBuffer(optimizedFile);
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          blobStream.write(Buffer.from(reader.result));
          blobStream.end();
        }
      };

      return uploadPromise;
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
      const file = this.storage.bucket(this.bucketName).file(fileId);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error('File not found');
      }

      const [metadata] = await file.getMetadata();
      const storageMetadata = metadata as StorageMetadata;
      const fileSize = Number(storageMetadata.size);

      const response = await axios.get(`${this.baseUrl}/download/${fileId}`, {
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
      // Delete from storage
      const file = this.storage.bucket(this.bucketName).file(fileId);
      await file.delete();

      // Delete metadata from database
      await axios.delete(`${this.baseUrl}/metadata/${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Validate file format
   */
  private isValidAudioFormat(file: File): boolean {
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
  private isValidFileSize(file: File): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    return file.size <= maxSize;
  }

  /**
   * Optimize file if needed
   * - Convert to optimal format
   * - Compress if too large
   * - Normalize audio levels
   */
  private async optimizeFile(file: File): Promise<File> {
    // TODO: Implement file optimization
    // For now, return original file
    return file;
  }

  /**
   * Get signed URL for direct upload
   */
  async getUploadUrl(filename: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/upload-url`, { filename });
      return response.data.url;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for direct download
   */
  async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/download-url/${fileId}`);
      return response.data.url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
}

export const fileManagementService = new FileManagementService();
export type { FileMetadata, FileUploadOptions, FileSearchOptions };
