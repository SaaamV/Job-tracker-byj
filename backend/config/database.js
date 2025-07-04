const mongoose = require('mongoose');
const { getConfig } = require('./environment');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    const config = getConfig();
    const mongoUri = config.mongodb.uri;

    console.log('Connecting to MongoDB Cloud...');

    const conn = await mongoose.connect(mongoUri, {
      ...config.mongodb.options,
      // Additional MongoDB connection options for Mongoose 6+
      bufferCommands: false,
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