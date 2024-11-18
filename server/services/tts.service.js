const path = require('path');
const fs = require('fs');
const File = require('../models/file.model');
const PlayHTService = require('./playht.service');

class TTSService {
  constructor() {
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

  async synthesizeSpeech(text, voice, outputPath) {
    try {
      // Use PlayHT service for speech synthesis
      await PlayHTService.synthesizeSpeech(text, voice, outputPath);
      
      // Create file record
      const file = new File({
        filename: path.basename(outputPath),
        path: outputPath,
        size: fs.statSync(outputPath).size,
        type: 'audio',
        voice: voice
      });
      
      await file.save();
      return file;
    } catch (error) {
      console.error('Error in synthesizeSpeech:', error);
      throw error;
    }
  }

  async getVoices() {
    try {
      // Use cached voices if available
      if (this.voiceCache) {
        return this.voiceCache;
      }

      // Get voices from PlayHT
      const voices = await PlayHTService.getVoices();
      this.voiceCache = voices;
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      throw error;
    }
  }
}

module.exports = new TTSService();
