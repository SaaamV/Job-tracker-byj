const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Track MongoDB connection status
let isMongoConnected = false;
let applicationsRouter = null;
let contactsRouter = null;

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

// Dynamic applications routes
app.use('/api/applications', (req, res, next) => {
  if (isMongoConnected && applicationsRouter) {
    applicationsRouter(req, res, next);
  } else {
    handleOfflineApplicationsRoute(req, res);
  }
});

// Dynamic contacts routes
app.use('/api/contacts', (req, res, next) => {
  if (isMongoConnected && contactsRouter) {
    contactsRouter(req, res, next);
  } else {
    handleOfflineContactsRoute(req, res);
  }
});

// Offline route handlers
function handleOfflineApplicationsRoute(req, res) {
  if (req.method === 'GET') {
    res.json({ success: true, data: [], message: 'Offline mode', offline: true });
  } else if (req.method === 'POST') {
    res.status(202).json({ success: true, message: 'Saved locally', offline: true, data: { ...req.body, id: Date.now() } });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleOfflineContactsRoute(req, res) {
  if (req.method === 'GET') {
    res.json({ success: true, data: [], message: 'Offline mode', offline: true });
  } else if (req.method === 'POST') {
    res.status(202).json({ success: true, message: 'Saved locally', offline: true, data: { ...req.body, id: Date.now() } });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Initialize database connection
async function initializeDatabase() {
  try {
    if (process.env.MONGODB_URI) {
      const connection = await connectDB();
      if (connection) {
        isMongoConnected = true;
        applicationsRouter = require('./routes/applications');
        contactsRouter = require('./routes/contacts');
        console.log('✅ Database connected and routes loaded');
      }
    }
  } catch (error) {
    console.log('⚠️ Running in offline mode:', error.message);
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