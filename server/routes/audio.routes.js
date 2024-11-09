import { Router } from "express";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenvConfig();

export const audioRoutes = Router();

// Initialize client with credentials file
const client = new TextToSpeechClient({
  keyFilename: path.join(__dirname, '..', 'google-credentials.json')
});

// Split text into chunks of approximately 4000 bytes (leaving room for overhead)
function splitTextIntoChunks(text) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    // If adding this sentence would exceed chunk size, start a new chunk
    if ((currentChunk + sentence).length > 4000) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  // Add the last chunk if it exists
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Enhance text for more natural speech flow
function enhanceTextForSpeech(text) {
  return text
    // Add subtle pauses after punctuation
    .replace(/\. /g, '... ')
    .replace(/\? /g, '... ')
    .replace(/! /g, '... ')
    // Clean up any multiple spaces or dots
    .replace(/\s+/g, ' ')
    .replace(/\.{4,}/g, '...')
    .trim();
}

// Combine multiple audio buffers
function combineAudioBuffers(buffers) {
  // Calculate total length
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  
  // Create a new buffer with the total length
  const combined = Buffer.alloc(totalLength);
  
  // Copy each buffer into the combined buffer
  let offset = 0;
  for (const buffer of buffers) {
    buffer.copy(combined, offset);
    offset += buffer.length;
  }
  
  return combined;
}

audioRoutes.post("/generate", async (req, res) => {
  const {
    text,
    languageCode = "en-US",
    voiceName = "en-US-Studio-M",
    fileName
  } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // Create audios directory if it doesn't exist
    const audiosDir = path.join(__dirname, '..', 'audios');
    if (!fs.existsSync(audiosDir)) {
      fs.mkdirSync(audiosDir, { recursive: true });
    }

    // Split and enhance text
    const enhancedText = enhanceTextForSpeech(text);
    const chunks = splitTextIntoChunks(enhancedText);
    
    // Generate audio for each chunk
    const audioBuffers = [];
    for (const chunk of chunks) {
      const request = {
        input: { text: chunk },
        voice: {
          languageCode,
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: "MP3"
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      if (!response || !response.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }
      
      audioBuffers.push(response.audioContent);
    }
    
    // Combine all audio buffers
    const combinedAudio = combineAudioBuffers(audioBuffers);
    
    // Save the combined audio to a file
    const audioFileName = fileName || `audio_${Date.now()}`;
    const filePath = path.join(audiosDir, `${audioFileName}.mp3`);
    fs.writeFileSync(filePath, combinedAudio);
    console.log('Audio saved to:', filePath);
    
    // Stream combined audio
    res.set('Content-Type', 'audio/mpeg');
    res.send(combinedAudio);
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ 
      error: "Failed to generate audio",
      details: error.message 
    });
  }
});
