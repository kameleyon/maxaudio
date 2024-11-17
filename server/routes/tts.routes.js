const express = require('express');
const router = express.Router();
const openSourceTTS = require('../services/opensource-tts.service');
const { requireAuth } = require('../middleware/auth');

// Generate audio
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { 
      text, 
      language = 'en',
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
      language,
      voice,
      pitch,
      speakingRate,
      publish
    });

    // Generate audio using open source TTS
    const audioContent = await openSourceTTS.generateSpeech(text, {
      language,
      speaker: voice,
      pitch,
      speakingRate,
      publish,
      userId: req.user.userId
    });

    res.send(audioContent);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Get available voices
router.get('/voices', requireAuth, async (req, res) => {
  try {
    const voices = await openSourceTTS.getVoices();
    res.json(voices);
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({ error: 'Failed to get voices' });
  }
});

// Clean up temporary files
router.post('/cleanup', requireAuth, async (req, res) => {
  try {
    await openSourceTTS.cleanup();
    res.status(200).json({ message: 'Cleanup completed successfully' });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: 'Failed to clean up temporary files' });
  }
});

module.exports = router;
