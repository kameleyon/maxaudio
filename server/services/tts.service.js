const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const path = require('path');
const fs = require('fs');

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
   * Split text into chunks that respect sentence boundaries
   */
  splitTextIntoChunks(text, maxChunkSize = 4500) {
    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Convert markdown to SSML
   */
  convertToSSML(text) {
    // Replace markdown headers with emphasis and breaks
    text = text.replace(/#{1,6}\s+(.*?)$/gm, '<emphasis level="strong">$1</emphasis><break time="1s"/>');
    
    // Replace bold text with emphasis
    text = text.replace(/\*\*(.*?)\*\*/g, '<emphasis level="moderate">$1</emphasis>');
    
    // Replace italic text with prosody rate
    text = text.replace(/\*(.*?)\*/g, '<prosody rate="slow">$1</prosody>');
    
    // Add breaks for new lines
    text = text.replace(/\n\n/g, '<break time="1s"/>');
    
    // Wrap in speak tags
    return `<speak>${text}</speak>`;
  }

  /**
   * Generate audio from text
   */
  async generateAudio(text, options = {}) {
    try {
      if (!text) {
        throw new Error('Text is required');
      }

      console.log('Generating audio with options:', {
        text: text.substring(0, 50) + '...',
        ...options
      });

      // Convert to SSML if text contains markdown
      const hasMarkdown = /[*#]/.test(text);
      const input = hasMarkdown ? { ssml: this.convertToSSML(text) } : { text };
      
      // Split text into chunks if needed
      const chunks = hasMarkdown ? [input.ssml] : this.splitTextIntoChunks(text);
      const audioContents = [];

      for (const chunk of chunks) {
        const request = {
          input: hasMarkdown ? { ssml: chunk } : { text: chunk },
          voice: {
            languageCode: options.languageCode || 'en-US',
            name: options.voiceName || 'en-US-Neural2-F',
            ssmlGender: this.getVoiceGender(options.voiceName)
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: options.pitch || 0,
            speakingRate: options.speakingRate || 1.0
          },
        };

        console.log('Making TTS API request with:', request);
        const [response] = await this.client.synthesizeSpeech(request);
        audioContents.push(response.audioContent);
      }

      // Concatenate audio contents
      const combinedAudio = Buffer.concat(audioContents);
      console.log('Successfully generated audio');

      // Save to audios directory if publish is true
      if (options.publish) {
        const fileName = `audio_${Date.now()}.mp3`;
        const audioDir = path.join(__dirname, '../audios');
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }
        const filePath = path.join(audioDir, fileName);
        fs.writeFileSync(filePath, combinedAudio);
        console.log('Saved audio file:', filePath);
      }

      return combinedAudio;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  /**
   * Get voice gender based on voice name
   */
  getVoiceGender(voiceName) {
    if (!voiceName) return 'FEMALE';
    
    // Map voice names to genders
    const genderMap = {
      'en-US-Neural2-A': 'FEMALE',
      'en-US-Neural2-C': 'FEMALE',
      'en-US-Neural2-D': 'MALE',
      'en-US-Neural2-E': 'FEMALE',
      'en-US-Neural2-F': 'FEMALE',
      'en-US-Neural2-G': 'FEMALE',
      'en-US-Neural2-H': 'FEMALE',
      'en-US-Neural2-I': 'MALE',
      'en-US-Neural2-J': 'MALE',
      'en-GB-Neural2-A': 'FEMALE',
      'en-GB-Neural2-B': 'MALE',
      'en-GB-Neural2-C': 'FEMALE',
      'en-GB-Neural2-D': 'MALE',
      'en-GB-Neural2-F': 'FEMALE'
    };

    return genderMap[voiceName] || 'FEMALE';
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
   * Clear voice cache
   */
  clearCache() {
    this.voiceCache = null;
  }
}

module.exports = new TTSService();
