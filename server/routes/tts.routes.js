import { Router } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { auth } from '../middleware/auth.js';
import { usageService } from '../services/usage.service.js';

export const ttsRoutes = Router();

// Create TTS client with explicit credentials
const client = new TextToSpeechClient({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`
  }
});

// Logging middleware
ttsRoutes.use((req, res, next) => {
  console.log(`TTS Route accessed: ${req.method} ${req.path}`);
  next();
});

ttsRoutes.get('/voices', auth, async (req, res) => {
  try {
    console.log('Fetching voices...');
    
    const [response] = await client.listVoices({});
    
    // Filter and transform voices to ensure serializable data
    const voices = response.voices
      .filter(voice => 
        voice.languageCodes?.includes('en-US') || 
        voice.languageCodes?.includes('en-GB') ||
        voice.name.includes('Journey')  // Specifically for streaming-compatible voices
      )
      .map(voice => ({
        name: String(voice.name || ''),
        languageCode: String(voice.languageCodes?.[0] || ''),
        gender: voice.ssmlGender ? String(voice.ssmlGender) : undefined,
        sampleRate: voice.naturalSampleRateHertz ? Number(voice.naturalSampleRateHertz) : undefined,
        isStreamingCompatible: voice.name.includes('Journey')
      }));
    
    console.log(`Found ${voices.length} voices`);
    res.json(voices);
  } catch (error) {
    console.error('List Voices Error:', error);
    res.status(500).json({
      error: {
        message: String(error.message),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

ttsRoutes.post('/synthesize', auth, async (req, res) => {
  try {
    const { text, voice, streaming = false } = req.body;
    
    console.log('Synthesize request:', { text, voice, streaming });
    
    if (!text || !voice) {
      return res.status(400).json({
        error: {
          message: 'Missing required parameters'
        }
      });
    }

    // Track API request and character usage
    const requestTracking = await usageService.trackRequest(req.auth.userId);
    if (!requestTracking.allowed) {
      return res.status(429).json({
        error: {
          message: 'Rate limit exceeded',
          details: requestTracking
        }
      });
    }

    const characterTracking = await usageService.trackCharacters(req.auth.userId, text.length);
    if (!characterTracking.allowed) {
      return res.status(429).json({
        error: {
          message: 'Character limit exceeded',
          details: characterTracking
        }
      });
    }

    // Streaming configuration for Journey voices
    const streamingConfig = streaming ? {
      voice: {
        name: 'en-US-Journey-D',
        languageCode: 'en-US'
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        effectsProfileId: ['headphone-class-device']
      }
    } : null;

    const request = {
      input: { text: String(text) },
      voice: {
        languageCode: String(voice.split('-').slice(0, 2).join('-')),
        name: String(voice),
      },
      audioConfig: { audioEncoding: 'MP3' },
      ...(streamingConfig || {})
    };

    const [response] = await client.synthesizeSpeech(request);
    
    console.log('Speech synthesis successful');
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.audioContent));
  } catch (error) {
    console.error('TTS Route Error:', error);
    res.status(500).json({
      error: {
        message: String(error.message),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});
