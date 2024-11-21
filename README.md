# AudioMax - Enterprise Text-to-Speech Platform

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Setup & Installation](#setup--installation)
5. [Development Guide](#development-guide)
6. [API Documentation](#api-documentation)
7. [Security](#security)
8. [Production Setup](#production-setup)

## Overview

AudioMax is a sophisticated text-to-speech platform that combines multiple TTS engines for maximum flexibility and reliability:

1. Google Cloud TTS for premium voice quality
2. Coqui YourTTS for open-source multilingual support
3. Piper TTS for offline processing capability

This multi-engine approach ensures high availability and allows for fallback options while providing users with a choice of voice synthesis technologies.

### Vision
To provide enterprise-grade text-to-speech capabilities with unmatched natural speech synthesis and content generation, making professional audio content creation accessible and efficient.

### Key Differentiators
- Multi-engine TTS architecture:
  * Google Cloud TTS for premium quality
  * Open-source engines (Coqui, Piper) for flexibility
  * Automatic fallback system
- Advanced SSML implementation for human-like speech
- Emotion control and natural voice enhancement
- Enterprise-grade security with JWT authentication
- Comprehensive analytics and monitoring
- Flexible subscription models
- Robust file management system

## Core Features

### Voice Synthesis
- **Google Cloud TTS**
  - Neural network-based voice generation
  - Comprehensive SSML support
  - Multiple languages and accents
  - Voice customization
  - Chunked audio processing
  - Real-time preview

- **Coqui YourTTS**
  - Multi-speaker, multi-lingual support
  - Natural-sounding speech
  - Emotion control capabilities
  - Voice cloning features
  - Offline processing capability

- **Piper TTS**
  - Fast and efficient processing
  - Offline capability
  - SSML support
  - Lower resource usage

### Natural Speech Enhancement
- **Emotion Control**
  - Happy, sad, excited tones
  - Dynamic pitch adjustment
  - Speaking rate modification
  - Style weight control

- **Natural Markers**
  - Thoughtful pauses with "hmm"
  - Natural breathing patterns
  - Emphasis markers
  - Contextual pauses

### Authentication & Security
- **Custom JWT Authentication**
  - Secure token-based authentication
  - Role-based access control (RBAC)
  - Token refresh mechanism
  - Secure password hashing
  - Session management

### Studio Environment
- **Audio Workspace**
  - Professional editing interface
  - Content preview
  - SSML visualization
  - Project saving
  - Multi-format export (MP3, WAV)
  - File management system

## Technical Architecture

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Headless UI components
- React Query for data fetching
- React Router for navigation

### Backend
- Express.js server
- MongoDB Atlas database
- Google Cloud TTS integration
- Python TTS services
- Node.js service layer
- JWT authentication
- Stripe integration

### Voice Processing
- Google Cloud TTS API
- Python-based TTS engines
- Audio enhancement pipeline
- SSML processing
- Voice modification system
- Emotion analysis

## Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.7 or higher
- MongoDB Atlas account
- Google Cloud account with TTS API enabled
- npm 6 or higher

### Environment Variables
Create a `.env` file in the root directory with the necessary configuration (see .env.example for template).

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/kameleyon/audiomax.git
   cd audiomax
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Python environment:
   ```bash
   cd server
   pip install -r requirements.txt
   ```

4. Download voice models:
   ```bash
   npm run setup:voices
   ```

5. Configure Google Cloud credentials:
   ```bash
   npm run setup:credentials
   ```

6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   node index.js

   # Terminal 2 - Frontend
   npm run dev
   ```

## Security

### Authentication Flow
1. User registers or logs in
2. Server validates credentials and issues JWT
3. Client stores token securely
4. Token is included in subsequent requests
5. Server validates token for each protected route

### Security Features
- JWT-based authentication
- Secure password hashing
- CORS protection
- Rate limiting
- Input validation
- Request sanitization

## File Management

### Audio Storage
- Generated audio files are stored in `server/audios/`
- Files are named with timestamp: `audio_{timestamp}.mp3`
- Automatic cleanup of temporary files
- Support for long-form audio content

### File Access
- Secure file serving through authenticated routes
- Support for streaming large audio files
- Automatic file type detection
- Content-Type headers for proper playback

## Voice Enhancement

### Emotion Processing
- Text analysis for emotional content
- Dynamic voice parameter adjustment
- Natural speech patterns
- Contextual emphasis

### SSML Implementation
```xml
<speak>
  <p>
    Welcome! <break time="500ms"/>
    Let me tell you a story...
    <prosody rate="slow" pitch="+2st">
      It was a dark and stormy night
    </prosody>
  </p>
  <break time="1s"/>
  <emphasis level="strong">
    But then everything changed!
  </emphasis>
</speak>
```

## Contributing
Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Community

### Documentation
- [API Reference](docs/api.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Security Policy](docs/security.md)

### Support Channels
- Technical Support: support@audiomax.ai
- Security Issues: security@audiomax.ai
- Feature Requests: feedback@audiomax.ai

## Acknowledgments
- [Google Cloud TTS](https://cloud.google.com/text-to-speech) for premium voice synthesis
- [Coqui TTS](https://github.com/coqui-ai/TTS) for open-source voice synthesis
- [Piper TTS](https://github.com/rhasspy/piper) for backup voice synthesis
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) for database
- [Stripe](https://stripe.com) for payment processing
- All contributors and maintainers
