const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const path = require('path');
const fs = require('fs');
const File = require('../models/file.model');

class TTSService {
  constructor() {
    try {
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
   * Split text into smaller chunks that respect sentence boundaries
   */
  splitTextIntoChunks(text, maxChunkSize = 1500) {
    // Remove markdown headers and formatting
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+(.*?)$/gm, '$1')
      .replace(/\((\d+)-(\d+) minutes\)/g, '')
      .replace(/Hook:|Main Content Development:|Stories and Examples:|Conclusion:/g, '');

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
   * Convert text to advanced SSML with natural speech enhancements
   */
  convertToSSML(text) {
    // Add natural speech markers and emotional cues
    text = text
      // Add natural pauses with varying lengths
      .replace(/([.!?])\s+/g, '$1<break time="750ms"/>')
      .replace(/([,;])\s+/g, '$1<break time="500ms"/>')
      .replace(/\n\n+/g, '<break time="1s"/>')
      .replace(/\.\.\./g, '<break time="1s"/>hmm<break time="500ms"/>')

      // Add emotional expressions
      .replace(/\(happy\)/gi, '<prosody rate="110%" pitch="+2st">$1</prosody>')
      .replace(/\(sad\)/gi, '<prosody rate="90%" pitch="-2st">$1</prosody>')
      .replace(/\(excited\)/gi, '<prosody rate="120%" pitch="+3st">$1</prosody>')
      .replace(/\(calm\)/gi, '<prosody rate="85%" pitch="-1st">$1</prosody>')
      .replace(/\(thoughtful\)/gi, '<prosody rate="90%">$1</prosody>')

      // Add emphasis variations
      .replace(/\*([^*]+)\*/g, '<emphasis level="moderate">$1</emphasis>')
      .replace(/\*\*([^*]+)\*\*/g, '<emphasis level="strong">$1</emphasis>')

      // Add natural interjections
      .replace(/\(laugh\)/gi, '<break time="200ms"/>haha<break time="500ms"/>')
      .replace(/\(agree\)/gi, '<break time="200ms"/>uh-huh<break time="500ms"/>')
      .replace(/\(think\)/gi, '<break time="500ms"/>hmm<break time="500ms"/>')

      // Add prosody variations for different parts of speech
      .replace(/\b(but|however|although)\b/gi, '<prosody rate="95%">$1</prosody>')
      .replace(/\b(wow|amazing|incredible)\b/gi, '<prosody pitch="+2st">$1</prosody>')
      .replace(/\b(finally|lastly|in conclusion)\b/gi, '<prosody rate="90%">$1</prosody>')

      // Add breathing effects for natural pauses
      .replace(/\(pause\)/gi, '<break time="1s"/><break strength="x-weak"/>')
      .replace(/\(long pause\)/gi, '<break time="2s"/><break strength="weak"/>')

      // Add voice variations
      .replace(/\(whisper\)(.*?)\(\/whisper\)/g, '<prosody volume="x-soft" rate="90%">$1</prosody>')
      .replace(/\(loud\)(.*?)\(\/loud\)/g, '<prosody volume="x-loud" rate="110%">$1</prosody>')
      .replace(/\(soft\)(.*?)\(\/soft\)/g, '<prosody volume="soft" rate="95%">$1</prosody>')

      // Add emphasis for questions and exclamations
      .replace(/([^.!?]+\?)/g, '<prosody pitch="+1st" rate="95%">$1</prosody>')
      .replace(/([^.!?]+!)/g, '<prosody pitch="+2st" rate="110%">$1</prosody>')

      // Clean up any remaining parenthetical directions
      .replace(/\([^)]+\)/g, '');

    // Wrap in speak tags
    return `<speak>${text}</speak>`;
  }

  /**
   * Generate audio for a single chunk
   */
  async generateChunkAudio(chunk, options = {}) {
    const request = {
      input: { ssml: this.convertToSSML(chunk) },
      voice: {
        languageCode: options.languageCode || 'en-US',
        name: options.voiceName || 'en-US-Neural2-F',
        ssmlGender: this.getVoiceGender(options.voiceName)
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: options.pitch || 0,
        speakingRate: options.speakingRate || 1.0,
        // Add effects for more natural sound
        effectsProfileId: ['telephony-class-application'],
        volumeGainDb: 0
      },
    };

    console.log('Making TTS API request with:', request);
    const [response] = await this.client.synthesizeSpeech(request);
    return response.audioContent;
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

      // Split text into smaller chunks
      const chunks = this.splitTextIntoChunks(text);
      console.log(`Split text into ${chunks.length} chunks`);

      // Generate audio for each chunk
      const audioContents = [];
      for (const chunk of chunks) {
        const audioContent = await this.generateChunkAudio(chunk, options);
        audioContents.push(audioContent);
      }

      // Combine audio contents
      const combinedAudio = Buffer.concat(audioContents);
      console.log('Successfully generated audio');

      // Save to local directory if publish is true
      if (options.publish && options.userId) {
        const fileName = `audio_${Date.now()}.mp3`;
        const audioDir = path.join(__dirname, '../audios');
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }
        const filePath = path.join(audioDir, fileName);
        fs.writeFileSync(filePath, combinedAudio);
        console.log('Saved audio file:', filePath);

        // Create file metadata in database
        const relativePath = path.relative(__dirname, filePath).replace(/\\/g, '/');
        const fileDoc = new File({
          title: fileName,
          originalName: fileName,
          category: options.category || 'Generated',
          size: combinedAudio.length,
          format: 'audio/mp3',
          path: relativePath,
          userId: options.userId,
          voice: options.voiceName,
          transcription: text,
          tags: ['generated']
        });

        await fileDoc.save();
        console.log('Saved file metadata to database');
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
      if (this.voiceCache) {
        return languageCode
          ? this.voiceCache.filter(voice => voice.languageCodes.includes(languageCode))
          : this.voiceCache;
      }

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
