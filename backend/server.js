const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Track MongoDB connection status
let isMongoConnected = false;
let applicationsRouter = null;
let contactsRouter = null;

// CORS configuration
app.use(cors({
  origin: [
    'https://job-tracker-42vf48icv-mario263s-projects.vercel.app',
    'https://job-tracker-chi-eight.vercel.app',
    'https://job-tracker-5q3lneriz-mario263s-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'chrome-extension://*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: isMongoConnected ? 'Connected' : 'Offline',
    mode: isMongoConnected ? 'Full-stack' : 'Frontend-only',
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

// Dynamic applications routes - check MongoDB status and route accordingly
app.use('/api/applications', (req, res, next) => {
  if (isMongoConnected && applicationsRouter) {
    // Use database routes
    applicationsRouter(req, res, next);
  } else {
    // Use offline routes
    handleOfflineApplicationsRoute(req, res);
  }
});

// Dynamic contacts routes - check MongoDB status and route accordingly  
app.use('/api/contacts', (req, res, next) => {
  if (isMongoConnected && contactsRouter) {
    // Use database routes
    contactsRouter(req, res, next);
  } else {
    // Use offline routes
    handleOfflineContactsRoute(req, res);
  }
});

// Sync endpoint
app.post('/api/sync', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      error: 'Sync unavailable in offline mode',
      message: 'Database connection required for sync functionality'
    });
  }

  try {
    const { applications, contacts } = req.body;
    const results = { applications: 0, contacts: 0, errors: [] };

    if (applications && Array.isArray(applications)) {
      const Application = require('./models/Application');
      for (const appData of applications) {
        try {
          const app = new Application(appData);
          await app.save();
          results.applications++;
        } catch (error) {
          results.errors.push(`Application error: ${error.message}`);
        }
      }
    }

    if (contacts && Array.isArray(contacts)) {
      const Contact = require('./models/Contact');
      for (const contactData of contacts) {
        try {
          const contact = new Contact(contactData);
          await contact.save();
          results.contacts++;
        } catch (error) {
          results.errors.push(`Contact error: ${error.message}`);
        }
      }
    }

    res.json({ message: 'Sync completed', results });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

// Offline applications route handler
function handleOfflineApplicationsRoute(req, res) {
  if (req.method === 'GET') {
    res.json({
      success: true,
      data: [],
      message: 'Running in offline mode - using localStorage',
      offline: true
    });
  } else if (req.method === 'POST') {
    res.status(202).json({
      success: true,
      message: 'Application received - save to localStorage for now',
      offline: true,
      data: { ...req.body, id: Date.now() }
    });
  } else if (req.method === 'PUT') {
    res.status(202).json({
      success: true,
      message: 'Application update received - save to localStorage for now',
      offline: true,
      data: { ...req.body, id: req.params.id }
    });
  } else if (req.method === 'DELETE') {
    res.json({
      success: true,
      message: 'Application deletion received - remove from localStorage',
      offline: true
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Offline contacts route handler
function handleOfflineContactsRoute(req, res) {
  if (req.method === 'GET') {
    res.json({
      success: true,
      data: [],
      message: 'Running in offline mode - using localStorage',
      offline: true
    });
  } else if (req.method === 'POST') {
    res.status(202).json({
      success: true,
      message: 'Contact received - save to localStorage for now', 
      offline: true,
      data: { ...req.body, id: Date.now() }
    });
  } else if (req.method === 'PUT') {
    res.status(202).json({
      success: true,
      message: 'Contact update received - save to localStorage for now',
      offline: true,
      data: { ...req.body, id: req.params.id }
    });
  } else if (req.method === 'DELETE') {
    res.json({
      success: true,
      message: 'Contact deletion received - remove from localStorage',
      offline: true
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - This should be LAST
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/applications',
      'POST /api/applications',
      'GET /api/contacts',
      'POST /api/contacts',
      'POST /api/sync'
    ]
  });
});

const PORT = process.env.PORT || 3001;

// START THE SERVER IMMEDIATELY
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Apps: http://localhost:${PORT}/api/applications`);
  console.log(`✅ Backend server is ready and accepting connections`);
  
  // Try to connect to MongoDB in background
  connectToDatabase();
});

// Background database connection
async function connectToDatabase() {
  try {
    console.log('🔌 Attempting MongoDB connection...');
    const connection = await connectDB();
    
    if (connection) {
      console.log('✅ MongoDB connected - loading database routes');
      isMongoConnected = true;
      
      // Load database routes
      try {
        applicationsRouter = require('./routes/applications');
        contactsRouter = require('./routes/contacts');
        
        console.log('🔄 Database routes loaded - now in full-stack mode');
      } catch (error) {
        console.error('❌ Failed to load database routes:', error);
        console.log('📱 Continuing with offline routes');
        isMongoConnected = false;
      }
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('📱 Continuing in offline mode with localStorage');
    isMongoConnected = false;
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = app;