require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connect: connectDb, disconnect: disconnectDb } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV === 'development';

// CORS configuration
const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : [process.env.PRODUCTION_CLIENT_URL],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));

// Parse raw body for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Parse JSON body for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/files', require('./routes/files.routes'));
app.use('/api/usage', require('./routes/usage.routes'));
app.use('/api/stripe', require('./routes/stripe.routes'));
app.use('/api/subscription', require('./routes/subscription.routes'));
app.use('/api/tts', require('./routes/tts.routes'));
app.use('/api/user', require('./routes/user.routes'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });

  // Handle Stripe errors
  if (err.type?.startsWith('Stripe')) {
    return res.status(402).json({
      error: {
        message: err.message,
        type: err.type,
        code: err.code
      }
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        details: err.errors
      }
    });
  }

  // Handle authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Authentication required'
      }
    });
  }

  // Handle not found errors
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: {
        message: err.message || 'Resource not found'
      }
    });
  }

  // Handle all other errors
  res.status(err.status || 500).json({ 
    error: {
      message: isDevelopment ? err.message : 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack })
    }
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDb();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await disconnectDb();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await disconnectDb();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  disconnectDb().then(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  disconnectDb().then(() => process.exit(1));
});

// Start the server
startServer();
