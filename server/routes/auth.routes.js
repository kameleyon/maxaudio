import { Router } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export const authRoutes = Router();

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  },
});

authRoutes.get('/google-token', async (req, res) => {
  try {
    // Test credentials by listing available voices
    const [result] = await client.listVoices({});
    
    // Ensure we have an array of voices
    const voices = Array.isArray(result.voices) ? result.voices : [];
    
    // Only return serializable data
    res.json({
      authenticated: true,
      message: 'Successfully authenticated with Google Cloud',
      voicesAvailable: voices.length,
    });
  } catch (error) {
    console.error('Google Auth Check Error:', {
      code: error.code,
      message: String(error.message),
      details: String(error.details || ''),
    });
    
    res.status(500).json({
      authenticated: false,
      message: 'Failed to authenticate with Google Cloud',
      error: {
        message: String(error.message)
      }
    });
  }
});
