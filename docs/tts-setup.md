# Setting Up Open Source Text-to-Speech

This guide explains how to set up and use the open source TTS capabilities in MaxAudio.

## Prerequisites

1. Python 3.7 or higher
2. Node.js 14 or higher
3. npm 6 or higher

## Installation

1. Install the required Node.js dependencies:
```bash
npm install
```

2. Run the voice models setup script:
```bash
npm run setup:voices
```

This will:
- Install Python dependencies (Coqui TTS)
- Download the Piper TTS model
- Set up necessary directories
- Test the installations

## Available Voice Libraries

### 1. Coqui YourTTS
- Primary TTS engine
- Supports multiple languages
- Natural-sounding speech
- Emotion control capabilities

### 2. Piper TTS
- Backup TTS engine
- Fast and efficient
- Works offline
- Lower resource usage

## Usage

The TTS service will automatically use Coqui YourTTS as the primary engine, falling back to Piper TTS if needed. You can control various aspects of the speech synthesis:

### Basic Usage
```javascript
// Generate speech with default settings
const audio = await ttsService.generateSpeech("Your text here");
```

### Advanced Usage
```javascript
// Generate speech with specific settings
const audio = await ttsService.generateSpeech("Your text here", {
  language: "en",
  speaker: "coqui-en-female",
  pitch: 1.0,
  speakingRate: 1.0
});
```

### Natural Speech Markers
You can use special markers in your text to control the speech output:

- `...` - Add thoughtful pause with "hmm"
- `(pause)` - Add natural pause
- `(happy)text)` - Use happy tone
- `(sad)text)` - Use sad tone
- `(excited)text)` - Use excited tone
- `*text*` - Add emphasis

Example:
```javascript
const text = "Hey there... (happy)I'm really excited to share this news!) Let's think about it (pause) carefully.";
const audio = await ttsService.generateSpeech(text);
```

## Troubleshooting

### Common Issues

1. **Python Dependencies**
   - Error: "No module named 'TTS'"
   - Solution: Run `pip install TTS torch numpy`

2. **Model Downloads**
   - Error: "Model file not found"
   - Solution: Manually run `npm run setup:voices`

3. **Audio Output**
   - Error: "No audio output"
   - Solution: Check audio file permissions and directories

### Getting Help

If you encounter issues:
1. Check the logs in `server/logs`
2. Ensure all prerequisites are installed
3. Try running the setup script again
4. Check Python and Node.js versions

## Contributing

Want to improve the TTS capabilities?

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

The TTS components use various open-source licenses:
- Coqui TTS: MIT License
- Piper TTS: Apache 2.0 License

## Credits

This implementation uses the following open-source projects:
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [Piper TTS](https://github.com/rhasspy/piper)

Special thanks to the open-source community for making these tools available.
