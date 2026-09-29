const mongoose = require('mongoose');

/**
 * Connects to MongoDB.
 * Uses MONGO_URI from environment if provided, otherwise falls back to an
 * in-memory MongoDB instance so the app runs with zero setup.
 * Note: In-memory data is lost on restart. The server auto-seeds demo data.
 */
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoURI = mongod.getUri();
      console.log('⚠️  MONGO_URI not set — using in-memory MongoDB (data resets on restart).');
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
