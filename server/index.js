import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { stripeWebhookMiddleware } from './middleware/stripe-webhook.js';

// Load environment variables
dotenv.config();

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
});
