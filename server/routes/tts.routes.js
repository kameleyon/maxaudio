const express = require('express');
const router = express.Router();
const ttsService = require('../services/tts.service');
const fs = require('fs');
const path = require('path');

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const text = 'Hello! This is a test of the Text-to-Speech service.';
    const audioContent = await ttsService.generateAudio(text);
    
    // Save test file
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filePath = path.join(tempDir, 'test.mp3');
    fs.writeFileSync(filePath, audioContent, 'binary');
    
    res.json({
      success: true,
      message: 'TTS test successful',
      file: 'test.mp3',
      size: audioContent.length,
      characters: text.length
    });
  } catch (error) {
    console.error('TTS test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const { language } = req.query;
    const voices = await ttsService.getVoices(language);
    res.json(voices);
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get supported languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await ttsService.getLanguages();
    res.json(languages);
  } catch (error) {
    console.error('Error getting languages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate audio
router.post('/generate', async (req, res) => {
  try {
    const { text, voice, language, pitch, speakingRate } = req.body;

    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate text length
    try {
      ttsService.validateText(text);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate audio
    const audioContent = await ttsService.generateAudio(text, {
      voiceName: voice || 'en-US-Neural2-F',
      languageCode: language || 'en-US',
      pitch: pitch || 0,
      speakingRate: speakingRate || 1.0
    });

    // Save file
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `tts-${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, audioContent, 'binary');

    res.json({
      success: true,
      file: fileName,
      url: `/temp/${fileName}`,
      size: audioContent.length,
      characters: text.length
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get voice details
router.get('/voices/:name', async (req, res) => {
  try {
    const voice = await ttsService.getVoiceDetails(req.params.name);
    if (!voice) {
      return res.status(404).json({ error: 'Voice not found' });
    }
    res.json(voice);
  } catch (error) {
    console.error('Error getting voice details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve audio files
router.get('/audio/:file', (req, res) => {
  const filePath = path.join(__dirname, '../temp', req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file not found' });
  }
  res.sendFile(filePath);
});

module.exports = router;
