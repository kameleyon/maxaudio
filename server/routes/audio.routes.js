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

const client = new TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  }
});

audioRoutes.post("/generate", async (req, res) => {
  const {
    text,
    languageCode = "en-US",
    voiceName = "en-US-Standard-A",
    speakingRate = 1.0,
    fileName
  } = req.body;
  
  const request = {
    input: { text },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate,
    },
  };
  
  try {
    // Generate the TTS audio
    const [response] = await client.synthesizeSpeech(request);
    
    // Save the generated audio to a file
    const audioFileName = fileName || `audio_${Date.now()}`;
    const filePath = path.join(__dirname, '..', 'audios', `${audioFileName}.mp3`);
    fs.writeFileSync(filePath, response.audioContent);
    console.log('Audio saved to:', filePath);
    
    // Stream audio directly
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});
