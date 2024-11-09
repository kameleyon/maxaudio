import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize Text-to-Speech client with proper credential handling
function initializeTextToSpeechClient() {
  if (!process.env.GOOGLE_CREDENTIALS) {
    console.error('Google credentials not found in environment');
    throw new Error('Google credentials not configured');
  }

  try {
    // Parse and validate credentials
    let credentials;
    try {
      // First unescape any double-escaped characters
      const rawCreds = process.env.GOOGLE_CREDENTIALS
        .replace(/\\\\n/g, '\\n')  // Fix double-escaped newlines
        .replace(/\\\"/g, '"');    // Fix double-escaped quotes
      
      credentials = JSON.parse(rawCreds);
      console.log('Successfully parsed credentials');
    } catch (e) {
      console.error('Failed to parse Google credentials:', e);
      throw new Error('Invalid Google credentials format');
    }

    // Log credential structure (without sensitive data)
    console.log('Credential fields present:', Object.keys(credentials));
    
    // Validate required fields
    if (!credentials.client_email) {
      console.error('Missing client_email in credentials');
      throw new Error('Missing client_email in Google credentials');
    }
    if (!credentials.private_key) {
      console.error('Missing private_key in credentials');
      throw new Error('Missing private_key in Google credentials');
    }

    // Handle escaped private key
    const privateKey = credentials.private_key
      .replace(/\\n/g, '\n')  // Replace literal \n with newlines
      .replace(/["']/g, '');  // Remove any quotes

    return new TextToSpeechClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: privateKey,
        project_id: credentials.project_id
      }
    });
  } catch (error) {
    console.error('Failed to initialize Google client:', error);
    throw error;
  }
}

// Rest of the code remains the same...
export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Initialize client with proper error handling
    const client = initializeTextToSpeechClient();

    const { text, languageCode = "en-US", voiceName = "en-US-Studio-M" } = JSON.parse(event.body);

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    // Log request details (without sensitive data)
    console.log('Processing request:', {
      textLength: text.length,
      languageCode,
      voiceName
    });

    const request = {
      input: { text },
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

    console.log('Successfully generated audio');

    // Return the audio as base64
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': response.audioContent.length.toString()
      },
      body: response.audioContent.toString('base64'),
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
