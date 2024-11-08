# AudioMax

A text-to-speech application with advanced voice customization features.

## Environment Variables

The following environment variables are required for the application to function:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
OPENROUTERAI_API_KEY=your_openrouter_api_key

# Google Cloud Text-to-Speech Credentials
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_AUTH_CODE=your_auth_code

# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Deployment

When deploying to Netlify:

1. Go to Site Settings > Build & Deploy > Environment Variables
2. Add all the environment variables listed above
3. Make sure to add them exactly as shown, including the VITE_ prefix where applicable
4. For the GOOGLE_PRIVATE_KEY, make sure to keep the newline characters (\n)

## Development

1. Clone the repository
2. Copy .env.example to .env and fill in your credentials
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`

## Build

```bash
npm run build
```

The build command will create a production-ready build in the `dist` directory.
