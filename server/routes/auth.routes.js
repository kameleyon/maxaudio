import { Router } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { requireAdmin, requireAccessLevel } from '../middleware/auth.js';

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

// Admin verification endpoint using the new requireAdmin middleware
authRoutes.get('/verify-admin', requireAdmin, (req, res) => {
  // Since requireAdmin middleware already performed all necessary checks,
  // we can simply return the admin data that was added to the request
  res.json({
    verified: true,
    ...req.admin
  });
});

// Example of an endpoint requiring a specific access level
authRoutes.get('/admin/system-settings', requireAccessLevel('full'), (req, res) => {
  res.json({
    message: 'Access granted to system settings',
    admin: req.admin
  });
});
