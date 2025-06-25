const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Connect to MongoDB with error handling
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
}

// Middleware
app.use(cors({
  origin: [
    'https://job-tracker-42vf48icv-mario263s-projects.vercel.app',
    'https://job-tracker-chi-eight.vercel.app',
    'https://job-tracker-5q3lneriz-mario263s-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8080',
    'chrome-extension://*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Database connection middleware
app.use(async (req, res, next) => {
  await ensureConnection();
  next();
});

// Health check endpoint - No database required
app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: isConnected ? 'Connected' : 'Disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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

// Routes - with error handling
try {
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/contacts', require('./routes/contacts'));
} catch (error) {
  console.error('Route loading error:', error);
}

// Sync endpoint for bulk operations
app.post('/api/sync', async (req, res) => {
  try {
    const { applications, contacts } = req.body;
    
    const results = {
      applications: 0,
      contacts: 0,
      errors: []
    };

    // Sync applications
    if (applications && Array.isArray(applications)) {
      for (const appData of applications) {
        try {
          const Application = require('./models/Application');
          const app = new Application(appData);
          await app.save();
          results.applications++;
        } catch (error) {
          results.errors.push(`Application error: ${error.message}`);
        }
      }
    }

    // Sync contacts
    if (contacts && Array.isArray(contacts)) {
      for (const contactData of contacts) {
        try {
          const Contact = require('./models/Contact');
          const contact = new Contact(contactData);
          await contact.save();
          results.contacts++;
        } catch (error) {
          results.errors.push(`Contact error: ${error.message}`);
        }
      }
    }

    res.json({
      message: 'Sync completed',
      results
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Sync failed', 
      details: error.message 
    });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
