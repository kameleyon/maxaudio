# Production Setup Guide

## Required Services

### 1. MongoDB (Required)
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free cluster (M0 Free Tier)
- Get connection string
- Update DATABASE_URL in production env

### 2. Stripe (Already Set Up)
✅ Using test keys for development
- Keep using test keys until ready to accept real payments
- Then switch to live keys from Stripe Dashboard

### 3. Email (Already Set Up)
✅ Using Mailtrap for development
- Keep using Mailtrap for testing
- When ready for real emails:
  * SendGrid (recommended, 100 emails/day free)
  * Amazon SES (cheap for high volume)
  * Mailgun

### 4. Voice API Options (Choose One)
1. **ElevenLabs** (Recommended)
   - Free tier: 10,000 characters/month
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Get API key from dashboard
   - Best voice quality

2. **Google Cloud Text-to-Speech**
   - Free tier: 1 million characters/month
   - Sign up for [Google Cloud](https://cloud.google.com)
   - Enable Text-to-Speech API
   - Create service account & get key

3. **Amazon Polly**
   - Free tier: 5 million characters/month
   - Sign up for [AWS](https://aws.amazon.com)
   - Enable Polly
   - Create IAM user & get credentials

### 5. Redis (Optional - Can Wait)
- Not required for initial deployment
- Can add later for better caching
- Options when needed:
  * Redis Labs free tier
  * Managed Redis from your cloud provider

## Environment Files

### 1. Development (.env)
```env
# Already set up with:
- MongoDB Memory Server
- Stripe Test Keys
- Mailtrap
- Mock Voice Service
```

### 2. Production (.env.prod)
```env
# Database
DATABASE_URL=your_mongodb_atlas_url
DATABASE_NAME=maxaudio

# JWT (Same as dev)
JWT_SECRET=your_existing_jwt_secret

# Stripe (Already have)
STRIPE_SECRET_KEY=your_live_key
STRIPE_PUBLISHABLE_KEY=your_live_key
STRIPE_WEBHOOK_SECRET=your_live_webhook_secret

# Email (Keep Mailtrap for now)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass

# Voice API (Choose one)
VOICE_API_KEY=your_api_key
VOICE_API_URL=api_endpoint
VOICE_API_REGION=region
MOCK_VOICE_SERVICE=false

# Feature Flags
ENABLE_VOICE_CLONING=true
ENABLE_CUSTOM_VOICES=true
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=false

# Security
DISABLE_RATE_LIMITING=false
```

## Immediate Next Steps

1. **Get MongoDB Atlas**
   - Sign up and create free cluster
   - Get connection string
   - Test with development environment

2. **Choose Voice API**
   - Decide between ElevenLabs/Google/Amazon
   - Sign up and get API key
   - Test with small requests

3. **Keep Current Services**
   - Keep using Stripe test mode
   - Keep using Mailtrap
   - JWT stays the same

## Testing Checklist

1. **With Mock Services** (Current)
```bash
npm run dev # Uses .env with mock services
```

2. **With Real Services**
```bash
# Copy .env to .env.prod
cp .env .env.prod

# Update .env.prod with:
- MongoDB Atlas URL
- Voice API credentials
- Set MOCK_VOICE_SERVICE=false
```

## Production Launch Steps

1. **Database**
   - Set up MongoDB Atlas
   - Test connection
   - Set up backups

2. **Voice API**
   - Choose provider
   - Set up account
   - Test API calls

3. **Keep Current**
   - Mailtrap for emails
   - Stripe test mode
   - Current JWT setup

4. **Optional Later**
   - Redis for caching
   - Production email service
   - Stripe live mode
