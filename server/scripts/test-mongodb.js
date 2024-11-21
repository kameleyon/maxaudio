const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connection URL
    const url = 'mongodb+srv://arcanadraconi:9cshn8xjVOFEIQyS@audiomax.q25pz.mongodb.net/audiomax?retryWrites=true&w=majority';
    
    // Create a new MongoClient
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    // Connect to the MongoDB cluster
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');

    // Get database information
    const db = client.db('audiomax');
    const stats = await db.stats();
    console.log('\nDatabase Stats:');
    console.log('- Database:', db.databaseName);
    console.log('- Collections:', stats.collections);
    console.log('- Objects:', stats.objects);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Close connection
    await client.close();
    console.log('\nConnection closed successfully');

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);
