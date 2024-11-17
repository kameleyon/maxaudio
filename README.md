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

AudioMax is a sophisticated text-to-speech platform that combines Google Cloud TTS for high-quality voice synthesis with open-source TTS engines (Coqui YourTTS and Piper) for enhanced flexibility and offline capabilities. It enables users to generate natural human-like audio content with advanced customization features and emotion control.

### Vision
To provide enterprise-grade text-to-speech capabilities with unmatched natural speech synthesis and content generation, making professional audio content creation accessible and efficient.

### Key Differentiators
- Google Cloud TTS integration for premium voice quality
- Open-source TTS engines with fallback support
- Advanced SSML implementation for human-like speech
- Emotion control and natural voice enhancement
- Enterprise-grade security with JWT authentication
- Comprehensive analytics and monitoring
- Flexible subscription models
- Robust file management system

## Core Features

### Voice Synthesis
- **Primary Engine: Google Cloud TTS**
  - Neural network-based voice generation
  - Comprehensive SSML support
  - Multiple languages and accents
  - Voice customization
  - Chunked audio processing
  - Real-time preview

- **Secondary Engine: Coqui YourTTS**
  - Multi-speaker, multi-lingual support
  - Natural-sounding speech
  - Emotion control capabilities
  - Voice cloning features
  - Offline processing capability

- **Backup Engine: Piper TTS**
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

### Content Generation
- **Text Processing**
  - Natural language analysis
  - Emotion detection
  - SSML generation
  - Prosody control

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
- MongoDB database
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
- MongoDB
- npm 6 or higher
- Google Cloud account with TTS API enabled

### Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
DATABASE_URL=your_mongodb_url
DATABASE_NAME=your_db_name

# Google Cloud TTS
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_CLIENT_EMAIL=your_client_email
GOOGLE_PRIVATE_KEY=your_private_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Security
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
SESSION_SECRET=your_session_secret
COOKIE_SECRET=your_cookie_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

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
- [MongoDB](https://www.mongodb.com) for database
- [Stripe](https://stripe.com) for payment processing
- All contributors and maintainers
