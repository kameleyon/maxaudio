const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connect: connectDb } = require('../../server/config/database');

const app = express();

// CORS configuration with credentials
const corsOptions = {
  origin: process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : [process.env.URL, 'https://audiomax.netlify.app'], // Netlify automatically sets URL env variable
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  exposedHeaders: ['set-cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Parse JSON body for routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDb();

// Import and use routes
app.use('/api/auth', require('../../server/routes/auth.routes'));
app.use('/api/files', require('../../server/routes/files.routes'));
app.use('/api/usage', require('../../server/routes/usage.routes'));
app.use('/api/stripe', require('../../server/routes/stripe.routes'));
app.use('/api/subscription', require('../../server/routes/subscription.routes'));
app.use('/api/tts', require('../../server/routes/tts.routes'));
app.use('/api/user', require('../../server/routes/user.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err.type?.startsWith('Stripe')) {
    return res.status(402).json({
      error: {
        message: err.message,
        type: err.type,
        code: err.code
      }
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        details: err.errors
      }
    });
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
