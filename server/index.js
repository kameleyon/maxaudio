import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { stripeWebhookMiddleware } from './middleware/stripe-webhook.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Verify required environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'VITE_CLERK_PUBLISHABLE_KEY',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Basic security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle Stripe webhooks before body parsing
app.use('/api/stripe/webhook', stripeWebhookMiddleware);

// Body parsing for regular routes
app.use(express.json());

// API routes
app.use(router);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log('Environment variables loaded:', {
    stripeKey: process.env.STRIPE_SECRET_KEY ? '✓' : '✗',
    clerkKey: process.env.VITE_CLERK_PUBLISHABLE_KEY ? '✓' : '✗',
    googleProjectId: process.env.GOOGLE_PROJECT_ID ? '✓' : '✗',
    googleEmail: process.env.GOOGLE_CLIENT_EMAIL ? '✓' : '✗',
    googleKey: process.env.GOOGLE_PRIVATE_KEY ? '✓' : '✗'
  });
});
