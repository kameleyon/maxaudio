const mongoose = require('mongoose');

const connect = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const dbName = process.env.DATABASE_NAME || 'audiomax';

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Configure MongoDB connection
    const options = {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    // Connect to MongoDB Atlas
    await mongoose.connect(dbUrl, options);
    console.log('Connected to MongoDB Atlas successfully');
    console.log(`Database: ${dbName}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connect, 5000);
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Retry connection after delay
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connect, 5000);
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect
};
