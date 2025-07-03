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

    console.log('Connecting to MongoDB Cloud...');

    const conn = await mongoose.connect(mongoUri, {
      // Modern MongoDB connection options for Mongoose 6+
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      bufferCommands: false,
      // Connection timeout
      connectTimeoutMS: 30000,
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
    throw error;
  }
};

// Export connection status checker
const isMongoConnected = () => isConnected;

module.exports = connectDB;
module.exports.isConnected = isMongoConnected;