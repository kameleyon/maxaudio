// backend/server.js
import express from 'express';

import cors from 'cors';
import fs from 'fs';
import util from 'util';

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

// Endpoint to synthesize speech
app.post('/synthesize', async (req, res) => {
  try {
    const { text, voice } = req.body;

    const request = {
      input: { text },
      voice: { languageCode: 'en-US', name: voice },
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Performs the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    res.status(500).send('Error synthesizing speech');
  }
});

// Endpoint to get available voices
app.get('/voices', async (req, res) => {
  try {
    const [response] = await client.listVoices();
    res.json(response.voices);
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).send('Error fetching voices');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
