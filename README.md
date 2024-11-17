# MaxAudio - Enterprise Text-to-Speech Platform

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

MaxAudio is a sophisticated text-to-speech platform that combines LLaMA 90B for content generation with Google Cloud TTS for high-quality voice synthesis. It enables users to generate natural, human-like audio content with advanced customization features.

### Vision
To provide enterprise-grade text-to-speech capabilities with unmatched natural speech synthesis and content generation, making professional audio content creation accessible and efficient.

### Key Differentiators
- LLaMA 90B integration for natural content generation
- Advanced SSML implementation for human-like speech
- Enterprise-grade security with JWT authentication
- Comprehensive analytics and monitoring
- Flexible subscription models
- Robust file management system

## Core Features

### Authentication & Security
- **Custom JWT Authentication**
  - Secure token-based authentication
  - Role-based access control (RBAC)
  - Token refresh mechanism
  - Secure password hashing
  - Session management

### Content Generation
- **LLaMA 90B Integration**
  - Natural language content generation
  - Genre-specific content (e.g., Comedy, Storytelling)
  - Tone control (e.g., Sarcastic, Professional)
  - 15-minute content generation capability
  - Dynamic prompt templates

### Text-to-Speech Engine
- **Advanced Google Cloud TTS**
  - Neural network-based voice generation
  - Comprehensive SSML support
  - Multiple languages and accents
  - Voice customization
  - Chunked audio processing
  - Real-time preview

### Voice Customization
- **SSML Features**
  - Advanced pause control
  - Dynamic emphasis
  - Intonation control
  - Speed and pitch adjustment
  - Emotional expressions
  - Natural transitions

### Studio Environment
- **Audio Workspace**
  - Professional editing interface
  - Content preview
  - SSML visualization
  - Project saving
  - Multi-format export (MP3, WAV)
  - File management system

## Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Google Cloud account with TTS API enabled
- LLaMA 90B access

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
   git clone https://github.com/kameleyon/maxaudio.git
   cd maxaudio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
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

## Content Generation

### LLaMA 90B Integration
- Natural language generation
- Support for multiple genres
- Tone control and customization
- 15-minute content capability
- Chunked processing for long content

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
    But then, everything changed!
  </emphasis>
</speak>
```

## Contributing
Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [Google Cloud TTS](https://cloud.google.com/text-to-speech) for voice synthesis
- [LLaMA 90B](https://ai.meta.com/llama/) for content generation
- [Stripe](https://stripe.com) for payment processing
- [MongoDB](https://www.mongodb.com) for database
- All contributors and maintainers
## Support & Community

### Documentation
- [API Reference](docs/api.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Security Policy](docs/security.md)

### Community Resources
- [GitHub Discussions](https://github.com/maxaudio/discussions)
- [Discord Server](https://discord.gg/maxaudio)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/maxaudio)

### Support Channels
- Technical Support: support@maxaudio.com
- Security Issues: security@maxaudio.com
- Feature Requests: feedback@maxaudio.com

## Production Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Redis (optional, for caching)
- Stripe account for payments

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/maxaudio

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

# Client URLs
CLIENT_URL=https://your-production-url.com
PRODUCTION_CLIENT_URL=https://your-production-url.com

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Storage Configuration
STORAGE_PROVIDER=local # or 's3', 'gcs'
STORAGE_PATH=./uploads

# Optional Features
ENABLE_2FA=false
ENABLE_CUSTOM_VOICES=true
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=false
```

### Deployment Steps
1. Set up a production-ready server
2. Configure environment variables
3. Deploy the application
4. Set up monitoring and analytics tools

## Monitoring & Analytics

### System Monitoring
- Server health checks
- Resource utilization
- Error tracking
- Performance metrics
- Security events
- API latency

### Usage Analytics
- User activity tracking
- Feature usage stats
- Error reporting
- Performance data
- Business metrics
- Cost analysis

### Alerting
- Error rate thresholds
- Resource utilization
- Security incidents
- Business metrics
- Custom alerts
- Notification channels

## Development & Testing Guide

### Local Development Testing

#### Quick Start
```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
npm run dev
```

#### Mock Services Configuration
For development and testing:
```bash
# .env configuration
MOCK_VOICE_SERVICE=true
USE_IN_MEMORY_CACHE=true
MOCK_STORAGE=true
```

For testing with real services:
```bash
# .env configuration
MOCK_VOICE_SERVICE=false

# Feature Flags
ENABLE_VOICE_CLONING=true
ENABLE_CUSTOM_VOICES=true
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=false

# Security
DISABLE_RATE_LIMITING=false
```

### Launch Steps

1. **Database Setup**
   - Set up MongoDB Atlas cluster
   - Configure network access
   - Create database user
   - Set up automated backups
   - Test connection from development

2. **Voice API Integration**
   - Choose provider (ElevenLabs/Google/Amazon)
   - Set up account and get credentials
   - Test with small requests
   - Configure rate limiting
   - Set up usage monitoring

3. **Email Configuration**
   - Start with Mailtrap for testing
   - Plan email service migration
   - Set up email templates
   - Configure SPF and DKIM
   - Test email delivery

4. **Security Setup**
   - Configure SSL/TLS
   - Set up firewall rules
   - Enable rate limiting
   - Configure CORS
   - Set up monitoring
   - Enable audit logging

5. **Performance Optimization**
   - Enable CDN
   - Configure caching
   - Set up load balancing
   - Enable compression
   - Optimize database queries
   - Configure connection pooling

## Testing

### Test Infrastructure
```plaintext
tests/
├── unit/                  # Unit tests
│   ├── components/        # React component tests
│   ├── hooks/            # Custom hook tests
│   ├── services/         # Service tests
│   └── utils/            # Utility function tests
├── integration/          # Integration tests
│   ├── api/              # API endpoint tests
│   ├── auth/             # Authentication flow tests
│   └── database/         # Database operation tests
└── e2e/                  # End-to-end tests
    ├── flows/            # User flow tests
    └── pages/            # Page-specific tests
```

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage Requirements**: 
  * Statements: 80%
  * Branches: 75%
  * Functions: 85%
  * Lines: 80%

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- path/to/test

# Watch mode
npm run test:watch
```

### Integration Testing
- **Framework**: Jest + Supertest
- **Database**: MongoDB Memory Server
- **Mock Services**: 
  * Stripe Test Mode
  * Google Cloud TTS Mock
  * Clerk Test Environment

```bash
# Run integration tests
npm run test:integration

# Run specific integration suite
npm run test:integration -- -t "auth flows"
```

### E2E Testing
- **Framework**: Cypress
- **Coverage**: Critical user paths
- **Environments**: Development, Staging
- **Browsers**: Chrome, Firefox, Safari

```bash
# Run E2E tests
npm run test:e2e

# Open Cypress UI
npm run cypress:open

# Run specific browser
npm run test:e2e:chrome
```

## API Documentation

### Authentication

#### POST /api/auth/register
Register a new user
```typescript
Request:
{
  email: string
  password: string
  name: string
  role?: 'user' | 'admin'
}

Response:
{
  user: {
    id: string
    email: string
    name: string
    role: string
    createdAt: string
  }
  token: string
}

Errors:
- 400: Invalid input
- 409: Email already exists
- 500: Server error
```

#### POST /api/auth/login
Authenticate user
```typescript
Request:
{
  email: string
  password: string
  remember?: boolean
}

Response:
{
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    settings: UserSettings
  }
}

Errors:
- 400: Invalid credentials
- 401: Account locked
- 500: Server error
```

### Audio Generation

#### POST /api/audio/generate
Generate audio from text
```typescript
Request:
{
  text: string
  voiceId: string
  settings: {
    pitch: number        // -20 to +20
    speed: number        // 0.25 to 4.0
    volume: number       // 0 to 100
    emphasis?: boolean   // Enable word emphasis
    ssml?: boolean      // Process as SSML
  }
  format?: 'mp3' | 'wav' | 'ogg'
}

Response:
{
  id: string
  url: string
  duration: number
  format: string
  metadata: {
    wordCount: number
    charCount: number
    processingTime: number
  }
}

Errors:
- 400: Invalid input
- 402: Usage limit exceeded
- 500: Generation failed
```

#### POST /api/voice/clone
Clone a voice
```typescript
Request:
FormData {
  name: string
  description?: string
  samples: File[]        // 3-5 audio samples
  settings?: {
    quality: 'standard' | 'high'
    language: string
    accent?: string
  }
}

Response:
{
  id: string
  status: 'processing' | 'ready' | 'failed'
  estimatedTime: number
  progress: number
}

Errors:
- 400: Invalid samples
- 402: Subscription required
- 500: Processing failed
```

### File Management

#### GET /api/files
List user's files
```typescript
Query Parameters:
- page: number          // Default: 1
- limit: number         // Default: 20
- sort: string          // Default: '-createdAt'
- search: string        // Optional search term
- type: string[]        // Filter by file type
- favorite: boolean     // Filter favorites

Response:
{
  files: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
    createdAt: string
    metadata: {
      duration?: number
      format?: string
      tags?: string[]
    }
  }>
  total: number
  page: number
  pages: number
}

Errors:
- 401: Unauthorized
- 500: Server error
```

### Subscription Management

#### GET /api/subscription/plans
Get available plans
```typescript
Response:
{
  plans: Array<{
    id: string
    name: string
    description: string
    price: {
      monthly: number
      yearly: number
    }
    features: string[]
    limits: {
      storage: number    // In bytes
      characters: number // Per month
      voices: number     // Custom voices
      quality: string[]  // Available qualities
    }
    metadata: {
      recommended?: boolean
      enterprise?: boolean
    }
  }>
}
```

#### POST /api/subscription/upgrade
Upgrade subscription
```typescript
Request:
{
  planId: string
  interval: 'month' | 'year'
  paymentMethodId?: string
  coupon?: string
}

Response:
{
  subscription: {
    id: string
    status: string
    currentPeriod: {
      start: string
      end: string
    }
    plan: {
      id: string
      name: string
    }
  }
  invoice?: {
    id: string
    amount: number
    status: string
  }
}

Errors:
- 400: Invalid plan
- 402: Payment required
- 500: Upgrade failed
