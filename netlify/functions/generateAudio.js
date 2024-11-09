import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Initialize Text-to-Speech client
const client = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}')
});

// Split text into chunks of approximately 4000 bytes
function splitTextIntoChunks(text) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > 4000) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Enhance text for more natural speech flow
function enhanceTextForSpeech(text) {
  return text
    .replace(/\. /g, '... ')
    .replace(/\? /g, '... ')
    .replace(/! /g, '... ')
    .replace(/\s+/g, ' ')
    .replace(/\.{4,}/g, '...')
    .trim();
}

// Combine multiple audio buffers
function combineAudioBuffers(buffers) {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const combined = Buffer.alloc(totalLength);
  let offset = 0;
  
  for (const buffer of buffers) {
    buffer.copy(combined, offset);
    offset += buffer.length;
  }
  
  return combined;
}

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, languageCode = "en-US", voiceName = "en-US-Studio-M" } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Enhance and split text
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

    // Return the audio as base64
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedAudio.length.toString()
      },
      body: combinedAudio.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('Error generating audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate audio',
        details: error.message
      })
    };
  }
}
