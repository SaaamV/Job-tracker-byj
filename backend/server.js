// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Import routes
const applicationsRouter = require('./routes/applications');
const contactsRouter = require('./routes/contacts');

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'Connected',
    mode: 'Cloud-only',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Tracker API is running!',
    endpoints: {
      health: '/api/health',
      applications: '/api/applications',
      contacts: '/api/contacts'
    },
    version: '1.0.0'
  });
});

// API routes
app.use('/api/applications', applicationsRouter);
app.use('/api/contacts', contactsRouter);


// Initialize database connection
async function initializeDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      process.exit(1);
    }
    
    console.log('🚀 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Initialize database connection
initializeDatabase();

// Error handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// For Vercel
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;