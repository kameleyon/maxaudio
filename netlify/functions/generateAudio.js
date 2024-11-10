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

// Split text into smaller chunks, being careful with sentence boundaries
function splitTextIntoChunks(text) {
  const MAX_CHUNK_SIZE = 4000; // Leave room for overhead
  const chunks = [];
  
  // First split by paragraphs to maintain structure
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If a single paragraph is too long, split it by sentences
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
      // Check if adding this paragraph would exceed the limit
      if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
  }
  
  // Add the last chunk if there is one
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  // Verify no chunk exceeds the limit
  chunks.forEach((chunk, index) => {
    if (chunk.length > 5000) {
      console.warn(`Chunk ${index} is too long (${chunk.length} bytes), splitting further`);
      const subChunks = chunk.match(/.{1,4000}/g) || [chunk];
      chunks.splice(index, 1, ...subChunks);
    }
  });

  return chunks;
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
    const client = initializeTextToSpeechClient();
    const { text, languageCode = "en-US", voiceName = "en-US-Studio-M" } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    console.log('Processing text of length:', text.length);
    
    // Split text into manageable chunks
    const chunks = splitTextIntoChunks(text);
    console.log('Split into', chunks.length, 'chunks');
    
    // Generate audio for each chunk
    const audioBuffers = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`);
      
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
        throw new Error(`No audio content received for chunk ${i + 1}`);
      }
      
      audioBuffers.push(response.audioContent);
    }
    
    // Combine all audio buffers
    const combinedAudio = combineAudioBuffers(audioBuffers);
    console.log('Successfully generated audio, total size:', combinedAudio.length);

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
