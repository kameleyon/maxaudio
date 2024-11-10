import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize Text-to-Speech client with proper credential handling
function initializeTextToSpeechClient() {
  if (!process.env.GOOGLE_CREDENTIALS) {
    console.error('Google credentials not found in environment');
    throw new Error('Google credentials not configured');
  }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('Invalid Google credentials format');
    }

    return new TextToSpeechClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key.replace(/\\n/g, '\n'),
        project_id: credentials.project_id
      }
    });
  } catch (error) {
    console.error('Failed to initialize Google client:', error);
    throw error;
  }
}

// Split text into smaller chunks efficiently
function splitTextIntoChunks(text) {
  const MAX_CHUNK_SIZE = 3000; // Smaller chunks for faster processing
  const chunks = [];
  
  // Split by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If paragraph is too long, split by sentences
    if (paragraph.length > MAX_CHUNK_SIZE) {
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > MAX_CHUNK_SIZE) {
          if (currentChunk) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
      }
    } else {
      if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Process chunks in parallel for better performance
async function processChunksInParallel(chunks, client, voiceConfig) {
  const chunkPromises = chunks.map(async (chunk, index) => {
    console.log(`Processing chunk ${index + 1}/${chunks.length}, length: ${chunk.length}`);
    
    const request = {
      input: { text: chunk },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 1.0  // Normal speed for better quality
      },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      if (!response || !response.audioContent) {
        throw new Error(`No audio content received for chunk ${index + 1}`);
      }
      return response.audioContent;
    } catch (error) {
      console.error(`Error processing chunk ${index + 1}:`, error);
      throw error;
    }
  });

  return Promise.all(chunkPromises);
}

// Combine audio buffers efficiently
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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.time('totalProcessing');
    const client = initializeTextToSpeechClient();
    const { text, languageCode = "en-US", voiceName = "en-US-Studio-M" } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    console.log('Processing text of length:', text.length);
    console.time('textProcessing');
    
    const chunks = splitTextIntoChunks(text);
    console.log('Split into', chunks.length, 'chunks');
    console.timeEnd('textProcessing');

    const voiceConfig = {
      languageCode,
      name: voiceName,
    };

    console.time('audioProcessing');
    const audioBuffers = await processChunksInParallel(chunks, client, voiceConfig);
    console.timeEnd('audioProcessing');
    
    console.time('combining');
    const combinedAudio = combineAudioBuffers(audioBuffers);
    console.log('Final audio size:', combinedAudio.length);
    console.timeEnd('combining');
    
    console.timeEnd('totalProcessing');

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
    console.error('Error in generateAudio function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate audio',
        details: error.message
      })
    };
  }
}
