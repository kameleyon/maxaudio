# Testing Guide

## Local Development Testing

### 1. Start the Development Environment
```bash
# Terminal 1 - Start the server
cd server
npm run dev

# Terminal 2 - Start the client
npm run dev
```

### 2. Admin Access
To access admin section:
1. Log in with your account
2. Go to MongoDB memory server data
3. Update your user role to 'admin':
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```
4. Access admin panel at: `/admin`

### 3. Feature Testing Checklist

#### Studio Testing
- [ ] Create new audio project
- [ ] Test text input
- [ ] Test voice selection
- [ ] Test audio generation
- [ ] Test audio playback
- [ ] Test saving project
- [ ] Test downloading audio

#### File Manager Testing
- [ ] Upload files
- [ ] List files
- [ ] Download files
- [ ] Delete files
- [ ] Test file search
- [ ] Test file filters
- [ ] Check storage limits

#### Voice Features
- [ ] Test basic TTS
- [ ] Test voice customization
- [ ] Test voice presets
- [ ] Check voice quality
- [ ] Verify usage limits

#### User Management
- [ ] Test user registration
- [ ] Test user login
- [ ] Test password reset
- [ ] Test profile updates
- [ ] Test subscription management

#### Admin Features
- [ ] Access admin dashboard
- [ ] View user management
- [ ] Check analytics
- [ ] Manage subscriptions
- [ ] View system settings

## Current Setup

### Frontend (Netlify)
✅ Already deployed
- Static files hosting
- Automatic builds
- SSL/TLS enabled
- CDN distribution

### Backend (Needs Setup)
For full functionality, you need:

1. **Database** (Choose one):
   - MongoDB Atlas (Free Tier)
   - Or keep using in-memory for testing

2. **Email Service** (Choose one):
   - Keep using Mailtrap for testing
   - SendGrid/Mailgun for production

3. **Voice API** (Choose one):
   - Mock service (current)
   - Google Cloud TTS
   - Amazon Polly
   - ElevenLabs

## Quick Start Testing

1. **Test with Mock Services**
```bash
# Update .env
MOCK_VOICE_SERVICE=true
USE_IN_MEMORY_CACHE=true
MOCK_STORAGE=true
```

2. **Test with Real Services**
```bash
# Update .env
MOCK_VOICE_SERVICE=false
VOICE_API_KEY=your_key
DATABASE_URL=your_mongodb_url
```

## Deployment Options

1. **Keep Current Setup**
- Frontend: Netlify (already done)
- Backend: Deploy to:
  * Heroku
  * Railway
  * Render
  * DigitalOcean App Platform

2. **Full Production Setup**
- Frontend: Keep on Netlify
- Backend: Full cloud setup
- Database: MongoDB Atlas
- Email: Production email service
- Storage: Cloud storage
- Voice API: Production API key

## Next Steps

1. **Test Current Setup**
- Run through testing checklist
- Verify all features work locally

2. **Choose Services**
- Decide on voice API provider
- Set up MongoDB Atlas if needed
- Choose email service

3. **Deploy Backend**
- Choose hosting platform
- Set up environment variables
- Deploy server code

4. **Monitor & Scale**
- Set up logging
- Monitor performance
- Track usage
- Scale as needed
