require('dotenv').config();
const axios = require('axios');

class PlayHTService {
  constructor() {
    this.baseUrl = 'https://api.play.ht/api/v2';
    this.apiKey = process.env.PLAYHT_SECRET_KEY;
    this.userId = process.env.PLAYHT_USER_ID;
    
    if (!this.apiKey || !this.userId) {
      console.error('PlayHT credentials not found in environment variables');
      throw new Error('PlayHT credentials not configured');
    }
  }

  getHeaders() {
    return {
      'accept': 'application/json',
      'AUTHORIZATION': this.apiKey,
      'X-USER-ID': this.userId,
      'Content-Type': 'application/json'
    };
  }

  splitTextIntoChunks(text, maxLength = 1900) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
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

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async getVoices() {
    try {
      console.log('Fetching voices from PlayHT...');
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: this.getHeaders()
      });

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
      throw error;
    }
  }

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

    const audioLink = response.data._links.find(link => 
      link.rel === 'related' && link.contentType === 'audio/mpeg'
    );

    if (!audioLink) {
      throw new Error('No audio link found in response');
    }

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

  async synthesizeSpeech(text, voiceId) {
    try {
      console.log('Generating speech with PlayHT...');
      const chunks = this.splitTextIntoChunks(text);
      console.log(`Split text into ${chunks.length} chunks`);

      const audioBuffers = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        const audioContent = await this.generateChunk(chunks[i], voiceId);
        audioBuffers.push(Buffer.from(audioContent));
      }

      console.log('Combining audio chunks...');
      return Buffer.concat(audioBuffers);
    } catch (error) {
      console.error('Error in PlayHT speech synthesis:', error);
      throw error;
    }
  }
}

module.exports = new PlayHTService();