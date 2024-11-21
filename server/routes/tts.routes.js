const express = require('express');
const router = express.Router();
const playHT = require('../services/playht.service');
const { requireAuth } = require('../middleware/auth');

// Generate audio (protected)
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { 
      text, 
      voice,
      pitch,
      speakingRate,
      publish 
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Generating audio with options:', {
      text: text.substring(0, 50) + '...',
      voice,
      pitch,
      speakingRate,
      publish
    });

    // Use PlayHT for voice synthesis
    const audioContent = await playHT.synthesizeSpeech(text, voice.replace('playht-', ''));
    res.send(audioContent);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Get available voices (public)
router.get('/voices', async (req, res) => {
  try {
    // Get voices from PlayHT
    const playHTVoices = await playHT.getVoices();

    // Format PlayHT voices
    const formattedVoices = playHTVoices.map(voice => ({
      id: `playht-${voice.id}`,
      name: voice.name,
      flag: '🎭', // PlayHT icon
      gender: voice.gender || 'Unknown',
      type: 'PlayHT'
    }));

    res.json(formattedVoices);
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({ error: 'Failed to get voices' });
  }
});

module.exports = router;