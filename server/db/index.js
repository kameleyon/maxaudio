const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Handle connection errors
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

const disconnectDb = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

module.exports = {
  connectDb,
  disconnectDb
};
