import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import ffmpeg, { FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import { promisify } from 'util';
import { writeFile, unlink, readFile } from 'fs/promises';
import axios from 'axios';

interface VoiceTrainingData {
  audioContent: Buffer;
  transcription: string;
  speakerName: string;
  languageCode: string;
}

interface CustomVoiceModel {
  id: string;
  name: string;
  status: 'TRAINING' | 'READY' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    quality: number;
    duration: number;
    sampleCount: number;
  };
}

interface AudioStreamMetadata {
  codec_type?: string;
  sample_rate?: number;
  bits_per_sample?: number;
  channels?: number;
  bit_rate?: number;
}

interface AudioMetadata extends FfprobeData {
  streams: FfprobeStream[];
  format: {
    duration?: number;
    [key: string]: any;
  };
}

class VoiceCloningService {
  private ttsClient: TextToSpeechClient;
  private storage: Storage;
  private bucketName: string;
  private baseUrl: string;

  constructor() {
    this.ttsClient = new TextToSpeechClient();
    this.storage = new Storage();
    this.bucketName = process.env.GOOGLE_STORAGE_BUCKET || 'voice-training-data';
    this.baseUrl = 'https://texttospeech.googleapis.com/v1';
  }

  /**
   * Prepare audio data for voice training
   */
  private async prepareAudioData(audioBuffer: Buffer): Promise<Buffer> {
    const tempInput = `/tmp/${uuidv4()}.wav`;
    const tempOutput = `/tmp/${uuidv4()}.wav`;

    try {
      // Write buffer to temp file
      await writeFile(tempInput, audioBuffer);

      // Process audio
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInput)
          .audioFrequency(48000)
          .audioChannels(1)
          .audioCodec('pcm_s16le')
          .audioFilters([
            'afftdn=nf=-25',
            'dynaudnorm=f=150:g=15',
            'highpass=f=50',
            'lowpass=f=15000',
            'volume=2.0'
          ])
          .on('end', () => resolve())
          .on('error', (err: Error) => reject(err))
          .save(tempOutput);
      });

      // Read processed file
      const processedBuffer = await readFile(tempOutput);

      // Clean up temp files
      await Promise.all([
        unlink(tempInput),
        unlink(tempOutput)
      ]);

      return processedBuffer;
    } catch (error) {
      // Clean up temp files in case of error
      await Promise.all([
        unlink(tempInput).catch(() => {}),
        unlink(tempOutput).catch(() => {})
      ]);
      throw error;
    }
  }

  /**
   * Validate audio quality and duration
   */
  private async validateAudio(audioBuffer: Buffer): Promise<{
    isValid: boolean;
    quality: number;
    duration: number;
    errors?: string[];
  }> {
    const ffprobeAsync = promisify<string, AudioMetadata>(ffmpeg.ffprobe);
    const tempFile = `/tmp/${uuidv4()}.wav`;

    try {
      await writeFile(tempFile, audioBuffer);
      const metadata = await ffprobeAsync(tempFile);
      const errors: string[] = [];
      let duration = 0;
      let quality = 0;

      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      if (!audioStream) {
        errors.push('No audio stream found');
      } else {
        // Check duration
        duration = metadata.format.duration || 0;
        if (duration < 30) {
          errors.push('Audio must be at least 30 seconds long');
        }

        // Check sample rate
        const sampleRate = audioStream.sample_rate;
        if (sampleRate && sampleRate < 44100) {
          errors.push('Sample rate must be at least 44.1kHz');
        }

        // Check bit depth
        const bitDepth = audioStream.bits_per_sample;
        if (bitDepth && bitDepth < 16) {
          errors.push('Bit depth must be at least 16-bit');
        }

        // Calculate quality score
        quality = this.calculateQualityScore(audioStream as AudioStreamMetadata);
      }

      await unlink(tempFile);

      return {
        isValid: errors.length === 0,
        quality,
        duration,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      await unlink(tempFile).catch(() => {});
      return {
        isValid: false,
        quality: 0,
        duration: 0,
        errors: ['Failed to analyze audio']
      };
    }
  }

  /**
   * Calculate audio quality score based on various factors
   */
  private calculateQualityScore(audioStream: AudioStreamMetadata): number {
    let score = 0;

    // Sample rate score (up to 30 points)
    const sampleRate = audioStream.sample_rate || 0;
    if (sampleRate >= 48000) score += 30;
    else if (sampleRate >= 44100) score += 20;
    else score += 10;

    // Bit depth score (up to 30 points)
    const bitDepth = audioStream.bits_per_sample || 0;
    if (bitDepth >= 24) score += 30;
    else if (bitDepth >= 16) score += 20;
    else score += 10;

    // Channel score (up to 20 points)
    const channels = audioStream.channels || 0;
    if (channels === 1) score += 20; // Mono is preferred for voice
    else if (channels === 2) score += 15;
    else score += 10;

    // Bit rate score (up to 20 points)
    const bitRate = audioStream.bit_rate || 0;
    if (bitRate >= 320000) score += 20;
    else if (bitRate >= 192000) score += 15;
    else if (bitRate >= 128000) score += 10;
    else score += 5;

    return score;
  }

  /**
   * Upload training data to Google Cloud Storage
   */
  private async uploadTrainingData(data: VoiceTrainingData): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    const filename = `training-data/${uuidv4()}.wav`;
    const file = bucket.file(filename);

    // Process and validate audio
    const processedAudio = await this.prepareAudioData(data.audioContent);
    const validation = await this.validateAudio(processedAudio);

    if (!validation.isValid) {
      throw new Error(`Invalid audio: ${validation.errors?.join(', ')}`);
    }

    await file.save(processedAudio, {
      metadata: {
        contentType: 'audio/wav',
        metadata: {
          transcription: data.transcription,
          speakerName: data.speakerName,
          languageCode: data.languageCode,
          quality: validation.quality.toString(),
          duration: validation.duration.toString()
        }
      }
    });

    return `gs://${this.bucketName}/${filename}`;
  }

  /**
   * Train a custom voice model
   */
  async trainCustomVoice(trainingData: VoiceTrainingData[]): Promise<CustomVoiceModel> {
    try {
      // Upload all training data
      const uploadPromises = trainingData.map(data => this.uploadTrainingData(data));
      const trainingFiles = await Promise.all(uploadPromises);

      // Get auth token from client
      const authClient = await this.ttsClient.auth.getClient();
      const token = await authClient.getAccessToken();

      // Create custom voice model using REST API
      const parent = `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`;
      const response = await axios.post(
        `${this.baseUrl}/${parent}/customVoices`,
        {
          displayName: `custom-voice-${uuidv4()}`,
          trainingData: {
            audioFiles: trainingFiles,
            labels: {
              speakerName: trainingData[0].speakerName,
              languageCode: trainingData[0].languageCode
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const model = response.data;

      return {
        id: model.name,
        name: model.displayName,
        status: 'READY',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          quality: trainingData.length,
          duration: trainingFiles.length * 30,
          sampleCount: trainingFiles.length
        }
      };
    } catch (error) {
      console.error('Error training custom voice:', error);
      throw new Error('Failed to train custom voice model');
    }
  }

  /**
   * Generate speech using a custom voice model
   */
  async synthesizeWithCustomVoice(
    text: string,
    modelId: string,
    options: {
      languageCode: string;
      speakingRate?: number;
      pitch?: number;
      volumeGainDb?: number;
      useSSML?: boolean;
    }
  ): Promise<Buffer> {
    try {
      const [response] = await this.ttsClient.synthesizeSpeech({
        input: options.useSSML ? { ssml: text } : { text },
        voice: {
          languageCode: options.languageCode,
          name: modelId
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speakingRate || 1.0,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volumeGainDb || 0.0,
          effectsProfileId: ['headphone-class-device']
        }
      });

      return response.audioContent as Buffer;
    } catch (error) {
      console.error('Error synthesizing speech with custom voice:', error);
      throw new Error('Failed to generate speech with custom voice');
    }
  }

  /**
   * Get the status of a custom voice model
   */
  async getCustomVoiceStatus(modelId: string): Promise<CustomVoiceModel> {
    try {
      const authClient = await this.ttsClient.auth.getClient();
      const token = await authClient.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/${modelId}`,
        {
          headers: {
            Authorization: `Bearer ${token.token}`
          }
        }
      );

      const model = response.data;

      return {
        id: model.name,
        name: model.displayName,
        status: model.state as 'TRAINING' | 'READY' | 'FAILED',
        createdAt: new Date(model.createTime.seconds * 1000),
        updatedAt: new Date(model.updateTime.seconds * 1000)
      };
    } catch (error) {
      console.error('Error getting custom voice status:', error);
      throw new Error('Failed to get custom voice status');
    }
  }

  /**
   * Delete a custom voice model
   */
  async deleteCustomVoice(modelId: string): Promise<void> {
    try {
      const authClient = await this.ttsClient.auth.getClient();
      const token = await authClient.getAccessToken();

      await axios.delete(
        `${this.baseUrl}/${modelId}`,
        {
          headers: {
            Authorization: `Bearer ${token.token}`
          }
        }
      );
    } catch (error) {
      console.error('Error deleting custom voice:', error);
      throw new Error('Failed to delete custom voice model');
    }
  }
}

export const voiceCloningService = new VoiceCloningService();
export type { VoiceTrainingData, CustomVoiceModel };
