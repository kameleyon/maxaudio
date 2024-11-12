# AudioMax - Enterprise Text-to-Speech Platform

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Development Guide](#development-guide)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [API Documentation](#api-documentation)
10. [Security](#security)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Contributing](#contributing)
13. [Production Setup](#production-setup)

## Overview

AudioMax is a sophisticated text-to-speech platform that combines advanced AI capabilities with intuitive voice customization features. It enables users to generate high-quality audio content with customizable voices, making it ideal for content creators, educators, and professionals.

### Vision
To provide enterprise-grade text-to-speech capabilities with unmatched customization and quality, making audio content creation accessible and efficient.

### Key Differentiators
- Advanced voice customization and cloning
- Enterprise-grade security and scalability
- Comprehensive analytics and monitoring
- Flexible subscription models
- Robust file management system

## Core Features

### Text-to-Speech Engine
- **Voice Synthesis**
  - Integration with Google Cloud TTS
  - Neural network-based voice generation
  - Support for multiple languages and accents
  - Custom voice model training
  - Real-time voice preview
  - Batch processing capabilities

### Voice Customization
- Pitch adjustment (-20 to +20)
- Speed control (0.25x to 4x)
- Emphasis markers
- Pronunciation dictionary
- SSML support
- Custom voice cloning

### Studio Environment
- **Audio Workspace**
  - Professional editing interface
  - Waveform visualization
  - Multi-track support
  - Real-time effects preview
  - Project saving and versioning
  - Export in multiple formats (MP3, WAV, OGG)

### File Management System
- **Organization**
  - Hierarchical folder structure
  - Tags and metadata
  - Smart folders
  - Search functionality
  - Batch operations
  - Access control

- **Storage Features**
  - Cloud storage integration
  - Automatic backup
  - Version control
  - User preferences management
  - Subscription plans with Stripe integration
  - Real-time usage tracking and analytics
  - Smart notification system

## Services Overview

### Usage Service
The `UsageService` is responsible for tracking user usage data, including API requests, character usage, and voice cloning. It implements a retry mechanism for operations and maintains an in-memory cache for usage data.

### Notification Service
The `NotificationService` handles sending notifications to users regarding their subscription status, payment confirmations, and usage limits. It supports both email and push notifications.

### Subscription Service
The `SubscriptionService` manages user subscriptions, including updating subscription status, handling cancellations, and recording payments. It integrates with Stripe for payment processing.

## Routes Overview

### Auth Routes
The `auth.routes.js` file defines the authentication routes for the application, including login, registration, fetching user details, and logout functionalities.

### Subscription Routes
The `subscription.routes.js` file manages user subscriptions, including fetching subscription status, payment methods, and usage statistics. It also handles updating notification preferences and checking feature access.

### Studio Environment
- **Audio Workspace**
  - Professional editing interface
  - Waveform visualization
  - Multi-track support
  - Real-time effects preview
  - Project saving and versioning
  - Export in multiple formats (MP3, WAV, OGG)

### File Management System
- **Organization**
  - Hierarchical folder structure
  - Tags and metadata
  - Smart folders
  - Search functionality
  - Batch operations
  - Access control

- **Storage Features**
  - Cloud storage integration
  - Automatic backup
  - Version control
  - File compression
  - Format conversion
  - Bulk operations

### User Management
- **Authentication & Authorization**
  - Clerk integration
  - Role-based access control
  - Single Sign-On (SSO)
  - Two-factor authentication
  - Session management
  - Activity logging

- **User Roles**
  - Admin
  - Manager
  - Editor
  - Viewer
  - Custom role definitions

### Subscription System
- **Plans**
  - Free Tier
    * 1000 characters/month
    * Basic voices
    * Standard quality
    * 5 GB storage
  
  - Pro Tier ($29/month)
    * 100,000 characters/month
    * Premium voices
    * High quality
    * 50 GB storage
    * Priority support
  
  - Enterprise Tier ($99/month)
    * Unlimited characters
    * All voices + custom voices
    * Ultra-high quality
    * 500 GB storage
    * Dedicated support
    * API access

- **Billing Features**
  - Stripe integration
  - Usage-based billing
  - Multiple payment methods
  - Automatic invoicing
  - Tax handling
  - Custom plans

### Analytics & Monitoring
- **Usage Analytics**
  - Real-time usage tracking
  - Historical usage data
  - Usage trend analysis
  - Subscription tier limits monitoring
  - Usage alerts and notifications
  - Character count tracking
  - API call monitoring
  - Storage utilization
  - User activity logs
  - Performance metrics
  - Cost analysis

## Technical Architecture

The application is built with a modern tech stack:

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS + Styled Components
- **State Management**: React Context + React Query
- **Authentication**: Clerk Authentication
- **Payments**: Stripe Integration with webhooks
- **Backend**: Node.js with Express
- **Cloud Services**: Google Cloud TTS, OpenRouter AI
- **Deployment**: Netlify with Serverless Functions

### Frontend Architecture
- **Core Technologies**
  - React 18 with TypeScript
  - Vite for build tooling
  - TailwindCSS + Styled Components
  - React Query for data fetching
  - Context API for state management
  - React Router for navigation

### Backend Architecture
- **Core Technologies**
  - Node.js with Express
  - MongoDB for data storage
  - Redis for caching
  - Bull for job queues
  - Socket.IO for real-time features

- **API Design**
  - RESTful architecture
  - GraphQL support
  - OpenAPI specification
  - Rate limiting
  - Caching strategy
  - Error handling

### Infrastructure
- **Cloud Services**
  - Google Cloud Platform
    * Cloud Text-to-Speech
    * Cloud Storage
    * Cloud Functions
    * Cloud Run
  
  - MongoDB Atlas
    * Database clusters
    * Backup service
    * Monitoring
  
  - Redis Labs
    * Caching layer
    * Session storage
    * Rate limiting

- **DevOps**
  - Docker containerization
  - GitHub Actions CI/CD
  - Terraform for infrastructure
  - Kubernetes orchestration
  - Monitoring with Datadog
  - Logging with ELK Stack

## Project Structure

```plaintext
maxaudio/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── admin/         # Admin dashboard components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── files/         # File management
│   │   ├── settings/      # User settings
│   │   ├── studio/        # Audio studio
│   │   └── voice/         # Voice management
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── validation/        # Request validation
├── scripts/               # Utility scripts
└── docs/                 # Documentation
```

## Setup & Installation

### Prerequisites
- Node.js v16+
- MongoDB v5+
- Redis v6+
- Google Cloud account
- Stripe account
- Clerk account

### Development Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/maxaudio.git
   cd maxaudio
   ```

2. Install Dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install
   ```

3. Copy the environment example files:
   ```bash
   # Copy environment files
   cp .env.example .env
   cd server && cp .env.example .env
   ```

4. Configure environment variables (see Configuration section).

5. Start MongoDB:
   ```bash
   mongod --dbpath /path/to/data
   ```

6. Run database migrations:
   ```bash
   npm run migrate
   ```

7. Start Development Servers:
   ```bash
   # Start frontend (from root)
   npm run dev

   # Start backend (from server directory)
   cd server && npm run dev
   ```

## Development Guide

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
```

## Security

### Authentication & Authorization
- JWT-based authentication
- Token refresh mechanism
- Role-based access control
- IP-based rate limiting
- Session management
- 2FA support (SMS/Email)

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 for data in transit
- CORS configuration
- XSS prevention
- CSRF protection
- SQL injection prevention

### API Security
- Request validation
- Input sanitization
- Rate limiting
- Request size limits
- Error handling
- Audit logging

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Cloud TTS](https://cloud.google.com/text-to-speech) for voice synthesis
- [Clerk](https://clerk.dev) for authentication
- [Stripe](https://stripe.com) for payment processing
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- All contributors and maintainers

---

© 2024 MaxAudio. All rights reserved.
