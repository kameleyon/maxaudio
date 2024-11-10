import { Router } from "express";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from '../middleware/auth.js';
import { usageService } from '../services/usage.service.js';
import { subscriptionService } from '../services/subscription.service.js';
import { 
  trackApiUsage, 
  trackCharacterUsage, 
  handleUsageError 
} from '../middleware/usage-limits.js';

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

// Check subscription status and voice access
async function checkSubscriptionAccess(req, res, next) {
  try {
    const { userId } = req.auth;
    const { voiceName } = req.body;

    // Get user's subscription details
    const subscription = await subscriptionService.getCurrentSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: "No active subscription",
        details: "Please subscribe to use this feature" 
      });
    }

    // Check if voice is available in user's tier
    const voiceType = getVoiceType(voiceName); // e.g., 'standard', 'wavenet', 'neural2', etc.
    if (!subscription.availableVoices.includes(voiceType)) {
      return res.status(403).json({ 
        error: "Voice not available",
        details: `${voiceType} voices are not available in your current plan` 
      });
    }

    // Check if within audio length limit
    const textLength = req.body.text.length;
    const estimatedMinutes = textLength / 1000; // rough estimate
    if (estimatedMinutes > subscription.limits.audioLength) {
      return res.status(403).json({ 
        error: "Audio length limit exceeded",
        details: `Your plan allows up to ${subscription.limits.audioLength} minutes per generation` 
      });
    }

    next();
  } catch (error) {
    console.error("Error checking subscription access:", error);
    res.status(500).json({ 
      error: "Failed to verify subscription access",
      details: error.message 
    });
  }
}

function getVoiceType(voiceName) {
  if (voiceName.includes('Neural2')) return 'neural2';
  if (voiceName.includes('Studio')) return 'studio';
  if (voiceName.includes('Wavenet')) return 'wavenet';
  if (voiceName.includes('Polyglot')) return 'polyglot';
  return 'standard';
}

// Apply middleware to track usage
audioRoutes.post("/generate", 
  auth,                    // Verify authentication
  checkSubscriptionAccess, // Check subscription status
  trackApiUsage,          // Track API request
  trackCharacterUsage,    // Track character usage
  handleUsageError,       // Handle usage-related errors
  async (req, res) => {
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
      
      // Add usage information to response headers
      res.set({
        'X-RateLimit-Limit': req.usage?.limit,
        'X-RateLimit-Remaining': req.usage?.remaining,
        'X-Character-Usage': req.characterUsage?.current,
        'X-Character-Limit': req.characterUsage?.limit,
        'X-Character-Remaining': req.characterUsage?.remaining,
        'Content-Type': 'audio/mpeg'
      });

      res.send(combinedAudio);
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ 
        error: "Failed to generate audio",
        details: error.message 
      });
    }
});

// Get usage statistics
audioRoutes.get("/usage-stats",
  auth,
  async (req, res) => {
    try {
      const stats = await usageService.getUsageStats(req.auth.userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ 
        error: "Failed to fetch usage statistics",
        details: error.message 
      });
    }
});
