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
      ssl: true,
      authSource: 'admin'
    };

    // Connect to MongoDB Atlas
    await mongoose.connect(dbUrl, options);
    console.log('Connected to MongoDB Atlas successfully');
    console.log(`Database: ${dbName}`);

    // Create indexes
    await createIndexes();
    console.log('Database indexes created successfully');

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
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

const createIndexes = async () => {
  try {
    // Get all model files
    const fs = require('fs');
    const path = require('path');
    const modelsPath = path.join(__dirname, '../models');
    
    // Skip if models directory doesn't exist
    if (!fs.existsSync(modelsPath)) {
      return;
    }

    const modelFiles = fs.readdirSync(modelsPath)
      .filter(file => file.endsWith('.model.js'));

    // Create indexes for each model
    for (const file of modelFiles) {
      const model = require(path.join(modelsPath, file));
      if (model.createIndexes) {
        await model.createIndexes();
      }
    }
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

module.exports = {
  connect,
  disconnect,
  createIndexes
};
