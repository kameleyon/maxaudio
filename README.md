# AUDIOMAX

AUDIOMAX is a powerful web application for AI-powered audio content generation and management. It enables content creators, educators, and storytellers to transform text into high-quality audio content using advanced text-to-speech technology.

## Features

### Content Generation
- **AI-Powered Text Generation**: Generate professional content using advanced language models
- **Multiple Content Categories**: Support for podcasts, educational content, and more
- **Tone Control**: Adjust the tone of your content (professional, casual, etc.)

### Audio Generation
- **High-Quality Text-to-Speech**: Convert text to natural-sounding audio using Google Cloud TTS
- **Voice Selection**: Choose from a variety of professional voices
- **Real-time Preview**: Listen to generated audio before publishing
- **Smart File Naming**: Automatic file naming based on content and date

### Content Management
- **Organized Storage**: All audio files are stored in a structured format
- **Easy Access**: Quick access to all your generated content
- **File Management**: Download, favorite, and organize your audio files

### User Interface
- **Studio Interface**: Professional content creation workspace
- **Mobile Responsive**: Fully responsive design for all device sizes
- **Intuitive Navigation**: Clean and user-friendly sidebar navigation
- **Dark Mode Support**: Comfortable viewing in any lighting condition

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Routing**: React Router for navigation
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **Authentication**: Clerk for secure user management

### Backend (Netlify Functions)
- **Serverless Functions**: API endpoints implemented as Netlify Functions
- **Text-to-Speech**: Google Cloud Text-to-Speech API integration
- **File Storage**: Temporary storage in /tmp directory
- **CORS Support**: Cross-origin resource sharing enabled

### Key Components
- **Studio**: Main workspace for content creation and audio generation
- **Content Editor**: Rich text editor for content creation
- **Audio Player**: Custom audio player for preview and playback
- **File Manager**: Interface for managing generated audio files

## Deployment

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Netlify CLI (optional, for local development)
- Google Cloud account with Text-to-Speech API enabled

### Environment Variables
Set up the following environment variables in your Netlify dashboard:

```env
# Google Cloud Credentials
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Other Configuration
NODE_VERSION=16
```

### Deployment Steps

1. Fork and clone the repository
```bash
git clone https://github.com/yourusername/audiomax.git
cd audiomax
```

2. Install dependencies
```bash
npm install
```

3. Local Development
```bash
# Start development server
npm run dev

# Test Netlify Functions locally (optional)
netlify dev
```

4. Deploy to Netlify

   a. Connect your GitHub repository to Netlify
   b. Configure build settings:
      - Build command: `npm run build`
      - Publish directory: `dist`
      - Functions directory: `netlify/functions`
   c. Add environment variables in Netlify dashboard
   d. Deploy!

### Post-Deployment

1. Verify Functions
   - Check Netlify Functions tab for successful deployment
   - Test endpoints through the browser
   - Monitor function logs in Netlify dashboard

2. Troubleshooting
   - Check function logs for errors
   - Verify environment variables are set correctly
   - Ensure Google Cloud credentials are valid

## Development

### Project Structure
```
audiomax/
├── src/                  # Frontend source code
├── netlify/
│   └── functions/        # Serverless functions
├── public/              # Static assets
└── dist/                # Build output
```

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

### Function Development
Create new functions in `netlify/functions/`:
```typescript
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  // Function logic here
}
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For issues and feature requests, please use the GitHub issue tracker.
