const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDb, disconnectDb } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Connect to MongoDB
connectDb().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || 'http://localhost:5174',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/files', require('./routes/files.routes'));
app.use('/api/usage', require('./routes/usage.routes'));
app.use('/api/stripe', require('./routes/stripe.routes'));
app.use('/api/subscription', require('./routes/subscription.routes'));
app.use('/api/tts', require('./routes/tts.routes'));
app.use('/api/user', require('./routes/user.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    dbStatus: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined
  });

  res.status(err.status || 500).json({
    error: {
      message: isDevelopment ? err.message : 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack })
    }
  });
});

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

// Start server with port retry logic
const startServer = (retryCount = 0) => {
  const server = app.listen(PORT)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retryCount < 3) {
        console.warn(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
        server.close();
        startServer(retryCount + 1);
      } else {
        console.error('Failed to start server:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      const actualPort = server.address().port;
      console.log(`Server is running on port ${actualPort}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

  return server;
};

startServer();