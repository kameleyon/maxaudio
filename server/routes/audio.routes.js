import { Router } from "express";
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { config as dotenvConfig } from 'dotenv';
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
    
    // Stream audio directly like the working local version
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error("Error generating audio:", error);
    res.status(500).json({ error: "Failed to generate audio" });
  }
});
