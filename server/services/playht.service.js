require('dotenv').config();
const axios = require('axios');

class PlayHTService {
  constructor() {
    this.baseUrl = 'https://api.play.ht/api/v2';
    // Get credentials from environment variables
    this.apiKey = process.env.PLAYHT_SECRET_KEY;
    this.userId = process.env.PLAYHT_USER_ID;
    
    if (!this.apiKey || !this.userId) {
      console.error('PlayHT credentials not found in environment variables');
      throw new Error('PlayHT credentials not configured');
    }
  }

  /**
   * Get request headers with authentication
   */
  getHeaders() {
    return {
      'accept': 'application/json',
      'AUTHORIZATION': this.apiKey,
      'X-USER-ID': this.userId,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Split text into chunks that respect sentence boundaries and max length
   */
  splitTextIntoChunks(text, maxLength = 1900) {
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      // If adding this sentence would exceed the limit
      if ((currentChunk + sentence).length > maxLength) {
        // If the current chunk is not empty, save it
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If the sentence itself is too long, split it into words
        if (sentence.length > maxLength) {
          const words = sentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if ((wordChunk + ' ' + word).length > maxLength) {
              chunks.push(wordChunk.trim());
              wordChunk = word;
            } else {
              wordChunk += (wordChunk ? ' ' : '') + word;
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += sentence;
      }
    }

    // Add the last chunk if there is one
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Get all available voices from PlayHT
   */
  async getVoices() {
    try {
      console.log('Fetching voices from PlayHT...');
      console.log('Using credentials:', {
        userId: this.userId,
        apiKey: this.apiKey.substring(0, 5) + '...'
      });

      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: this.getHeaders()
      });

      console.log(`Successfully fetched ${response.data.length} voices`);
      
      // Map response to include all voice metadata
      return response.data.map(voice => ({
        id: voice.id,
        name: voice.name,
        sample: voice.sample,
        accent: voice.accent,
        age: voice.age,
        gender: voice.gender,
        language: voice.language,
        language_code: voice.language_code,
        loudness: voice.loudness,
        style: voice.style,
        tempo: voice.tempo,
        texture: voice.texture,
        is_cloned: voice.is_cloned,
        voice_engine: voice.voice_engine
      }));
    } catch (error) {
      console.error('Error fetching PlayHT voices:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }

  /**
   * Generate speech for a single chunk of text
   */
  async generateChunk(text, voiceId) {
    console.log(`Generating chunk (${text.length} chars)`);
    
    const response = await axios.post(`${this.baseUrl}/tts`, {
      text: text,
      voice: voiceId,
      quality: "premium",
      output_format: "mp3",
      speed: 1,
      sample_rate: 24000,
      voice_engine: "PlayHT2.0"
    }, {
      headers: this.getHeaders()
    });

    console.log('TTS response:', response.data);

    // Get the audio URL from the response
    const audioLink = response.data._links.find(link => 
      link.rel === 'related' && link.contentType === 'audio/mpeg'
    );

    if (!audioLink) {
      throw new Error('No audio link found in response');
    }

    // Wait for audio to be ready
    let attempts = 0;
    const maxAttempts = 30;
    let audioContent = null;

    while (!audioContent && attempts < maxAttempts) {
      try {
        const audioResponse = await axios.get(audioLink.href, {
          responseType: 'arraybuffer',
          headers: this.getHeaders()
        });
        audioContent = audioResponse.data;
      } catch (error) {
        if (error.response?.status === 404) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw error;
        }
      }
    }

    if (!audioContent) {
      throw new Error('Failed to get audio content after maximum attempts');
    }

    return audioContent;
  }

  /**
   * Generate speech from text using PlayHT API
   * Handles chunking for long texts
   */
  async synthesizeSpeech(text, voiceId) {
    try {
      console.log('Generating speech with PlayHT...');
      console.log('Parameters:', {
        text: text.substring(0, 50) + '...',
        voiceId
      });

      // Split text into chunks
      const chunks = this.splitTextIntoChunks(text);
      console.log(`Split text into ${chunks.length} chunks`);

      // Generate audio for each chunk
      const audioBuffers = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        const audioContent = await this.generateChunk(chunks[i], voiceId);
        audioBuffers.push(Buffer.from(audioContent));
      }

      // Combine all audio buffers
      console.log('Combining audio chunks...');
      return Buffer.concat(audioBuffers);

    } catch (error) {
      console.error('Error in PlayHT speech synthesis:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  }
}

module.exports = new PlayHTService();
