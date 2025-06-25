const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(mongoUri, {
      // Modern MongoDB connection options
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // Removed deprecated options:
      // - useNewUrlParser (default in Mongoose 6+)
      // - useUnifiedTopology (default in Mongoose 6+) 
      // - bufferMaxEntries (deprecated)
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    isConnected = false;
    
    // In development, don't exit - allow app to continue without DB
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Continuing in offline mode...');
      return null;
    }
    
    throw error;
  }
};

// Export connection status checker
const isMongoConnected = () => isConnected;

module.exports = connectDB;
module.exports.isConnected = isMongoConnected;