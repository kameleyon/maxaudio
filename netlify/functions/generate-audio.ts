import { Handler } from '@netlify/functions';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';

const client = new TextToSpeechClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
});

const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const { text, languageCode = "en-US", voiceName = "en-US-Standard-A", speakingRate = 1.0 } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
        speakingRate,
      },
    };

    console.log('Generating speech with params:', request);
    const response = await client.synthesizeSpeech(request);
    console.log('Speech generated successfully');

    if (!response[0] || !response[0].audioContent) {
      throw new Error('No audio content received');
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg'
      },
      body: response[0].audioContent.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error: unknown) {
    console.error('Error generating audio:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate audio', 
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
