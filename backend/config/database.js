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

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    isConnected = false;
    
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    
    throw error;
  }
};

module.exports = connectDB;
