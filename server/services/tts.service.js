const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const path = require('path');

class TTSService {
  constructor() {
    try {
      // Initialize with credentials directly
      const credentials = require('../google-credentials.json');
      
      this.client = new TextToSpeechClient({
        credentials,
        projectId: credentials.project_id
      });

      console.log('Successfully initialized TextToSpeechClient');
    } catch (error) {
      console.error('Error initializing TextToSpeechClient:', error);
      throw error;
    }
    
    this.voiceCache = null;
  }

  /**
   * Generate audio from text
   */
  async generateAudio(text, options = {}) {
    try {
      if (!text) {
        throw new Error('Text is required');
      }

      // Validate text length
      this.validateText(text);

      console.log('Generating audio with options:', {
        text: text.substring(0, 50) + '...',
        ...options
      });
      
      const request = {
        input: { text },
        voice: {
          languageCode: options.languageCode || 'en-US',
          name: options.voiceName || 'en-US-Neural2-F',
          ssmlGender: options.gender || 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: options.pitch || 0,
          speakingRate: options.speakingRate || 1.0
        },
      };

      console.log('Making TTS API request with:', request);
      const [response] = await this.client.synthesizeSpeech(request);
      console.log('Successfully generated audio');
      return response.audioContent;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  async getVoices(languageCode = null) {
    try {
      // Use cached voices if available
      if (this.voiceCache) {
        return languageCode
          ? this.voiceCache.filter(voice => voice.languageCodes.includes(languageCode))
          : this.voiceCache;
      }

      // Get voices from Google
      const [response] = await this.client.listVoices({});
      this.voiceCache = response.voices.map(voice => ({
        name: voice.name,
        languageCodes: voice.languageCodes,
        ssmlGender: voice.ssmlGender,
        naturalSampleRateHertz: voice.naturalSampleRateHertz
      }));

      return languageCode
        ? this.voiceCache.filter(voice => voice.languageCodes.includes(languageCode))
        : this.voiceCache;
    } catch (error) {
      console.error('Error getting voices:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getLanguages() {
    try {
      const voices = await this.getVoices();
      const languages = new Set();
      
      voices.forEach(voice => {
        voice.languageCodes.forEach(code => languages.add(code));
      });

      return Array.from(languages).sort();
    } catch (error) {
      console.error('Error getting languages:', error);
      throw error;
    }
  }

  /**
   * Get voice details
   */
  async getVoiceDetails(voiceName) {
    try {
      const voices = await this.getVoices();
      return voices.find(voice => voice.name === voiceName);
    } catch (error) {
      console.error('Error getting voice details:', error);
      throw error;
    }
  }

  /**
   * Validate text length
   */
  validateText(text) {
    const maxLength = 5000; // Google's limit is 5000 characters
    if (text.length > maxLength) {
      throw new Error(`Text length (${text.length}) exceeds maximum allowed (${maxLength})`);
    }
    return true;
  }

  /**
   * Clear voice cache
   */
  clearCache() {
    this.voiceCache = null;
  }
}

module.exports = new TTSService();
