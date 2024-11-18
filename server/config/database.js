const mongoose = require('mongoose');

const connect = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb+srv://arcanadraconi:9cshn8xjVOFEIQyS@audiomax.q25pz.mongodb.net/?retryWrites=true&w=majority&appName=audiomax';
        const dbName = process.env.DATABASE_NAME || 'audiomax';

        await mongoose.connect(dbUrl, {
            dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`Connected to MongoDB Atlas successfully`);
        console.log(`Database: ${dbName}`);

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        // Retry connection after delay
        setTimeout(connect, 5000);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    setTimeout(connect, 5000);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    setTimeout(connect, 5000);
});

const disconnectDb = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
    }
};

process.on('SIGINT', async () => {
    try {
        await disconnectDb();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = { connect, disconnectDb };
