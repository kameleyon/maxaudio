const express = require('express');
const router = express.Router();
const openSourceTTS = require('../services/opensource-tts.service');
const playHT = require('../services/playht.service');
const { requireAuth } = require('../middleware/auth');

// Generate audio (protected)
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

    // Determine which service to use based on voice ID prefix
    let audioContent;
    if (voice.startsWith('playht-')) {
      // Use PlayHT for voices starting with 'playht-'
      audioContent = await playHT.synthesizeSpeech(text, voice.replace('playht-', ''));
    } else if (voice.startsWith('fastpitch')) {
      // Use FastPitch for voices starting with 'fastpitch'
      audioContent = await openSourceTTS.generateWithFastPitch(text, {
        pitch,
        speakingRate,
        publish,
        userId: req.user.userId
      });
    } else if (voice.startsWith('yourtts')) {
      // Use YourTTS for voices starting with 'yourtts'
      audioContent = await openSourceTTS.generateWithCoqui(text, {
        speaker: voice.split('-')[1] || '0', // Extract speaker ID from voice name
        language,
        pitch,
        speakingRate,
        publish,
        userId: req.user.userId
      });
    } else {
      // Default to open-source TTS
      audioContent = await openSourceTTS.generateWithCoqui(text, {
        speaker: '0',
        language,
        pitch,
        speakingRate,
        publish,
        userId: req.user.userId
      });
    }

    res.send(audioContent);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

// Get available voices (public)
router.get('/voices', async (req, res) => {
  try {
    // Get voices from all services
    const [openSourceVoices, playHTVoices] = await Promise.all([
      openSourceTTS.getVoices(),
      playHT.getVoices()
    ]);

    // Format PlayHT voices
    const formattedPlayHTVoices = playHTVoices.map(voice => ({
      id: `playht-${voice.id}`,
      name: voice.name,
      flag: '🎭', // PlayHT icon
      gender: voice.gender || 'Unknown',
      type: 'PlayHT'
    }));

    // Add FastPitch voices
    const fastPitchVoices = [
      {
        id: 'fastpitch-ljspeech',
        name: 'FastPitch (LJSpeech)',
        flag: '🤖',
        gender: 'Female',
        type: 'FastPitch'
      }
    ];

    // Add YourTTS voices
    const yourTTSVoices = [
      {
        id: 'yourtts-0',
        name: 'YourTTS Voice 1',
        flag: '🎙️',
        gender: 'Female',
        type: 'YourTTS'
      },
      {
        id: 'yourtts-1',
        name: 'YourTTS Voice 2',
        flag: '🎙️',
        gender: 'Male',
        type: 'YourTTS'
      }
    ];

    // Combine all voices, putting PlayHT voices first
    const allVoices = [
      ...formattedPlayHTVoices,
      ...fastPitchVoices,
      ...yourTTSVoices,
      ...openSourceVoices
    ];

    res.json(allVoices);
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({ error: 'Failed to get voices' });
  }
});

// Clean up temporary files (protected)
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
