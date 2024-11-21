# Quick Start Guide: Open Source TTS Setup

This guide will help you quickly set up and test the open source text-to-speech capabilities in MaxAudio.

## Prerequisites

1. **Python Setup**
   - Python 3.7 or higher
   - pip package manager
   ```bash
   # Check Python version
   python --version
   ```

2. **Node.js Setup**
   - Node.js 16.0 or higher
   - npm 6.0 or higher
   ```bash
   # Check Node.js version
   node --version
   ```

## Installation Steps

1. **Install Dependencies**
   ```bash
   # Install Node.js dependencies
   cd server
   npm install

   # Install Python dependencies
   pip install -r requirements.txt
   ```

2. **Set Up Voice Models**
   ```bash
   # Download and set up TTS models
   npm run setup:voices
   ```

3. **Test the Installation**
   ```bash
   # Run TTS test script
   npm run test:tts
   ```

## Quick Test

After installation, you can test the TTS functionality:

```javascript
// Example usage in your code
const openSourceTTS = require('./services/opensource-tts.service');

// Generate speech with Coqui TTS
const text = "(happy)Hello! This is a test of the text-to-speech system.)";
const audio = await openSourceTTS.generateSpeech(text, {
    engine: 'coqui',
    language: 'en'
});

// Generate speech with Piper TTS (fallback)
const fallbackAudio = await openSourceTTS.generateSpeech(text, {
    engine: 'piper',
    language: 'en'
});
```

## Natural Speech Markers

You can use these markers in your text to control speech characteristics:

```plaintext
1. Emotions:
   - (happy)text) - Happy tone
   - (sad)text) - Sad tone
   - (excited)text) - Excited tone
   - (thoughtful)text) - Thoughtful tone

2. Pauses:
   - ... - Add thoughtful pause
   - (pause) - Natural pause
   - (long pause) - Longer pause

3. Voice Styles:
   - (whisper)text) - Whispered speech
   - (soft)text) - Gentle voice
   - (loud)text) - Emphasized speech

4. Emphasis:
   - *text* - Moderate emphasis
   - **text** - Strong emphasis
```

## Troubleshooting

### Common Issues

1. **Python Not Found**
   ```bash
   # Make sure Python is in your PATH
   python --version
   # or
   python3 --version
   ```

2. **Model Download Fails**
   ```bash
   # Try manual setup
   npm run setup:voices
   ```

3. **Audio Output Issues**
   - Check the test-output directory for generated files
   - Verify audio file permissions
   - Check system audio settings

### Error Messages

1. **"No module named 'TTS'"**
   ```bash
   pip install TTS
   ```

2. **"Model not found"**
   ```bash
   # Re-run setup
   npm run setup:voices
   ```

3. **"Permission denied"**
   ```bash
   # Check directory permissions
   chmod -R 755 models/
   ```

## Support

If you encounter any issues:
1. Check the logs in `server/logs`
2. Run the test script: `npm run test:tts`
3. Verify all dependencies are installed
4. Check Python and Node.js versions

## Next Steps

1. Try generating speech with different emotions
2. Experiment with voice styles
3. Test different languages
4. Create custom voice presets

For more detailed information:
- [Natural Speech Guide](natural-speech-guide.md)
- [Voice Libraries Comparison](voice-libraries-comparison.md)
- [TTS Setup Guide](tts-setup.md)
