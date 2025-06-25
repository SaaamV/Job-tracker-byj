const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'https://job-tracker-chi-eight.vercel.app',
    'https://job-tracker-5q3lneriz-mario263s-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'chrome-extension://*'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/applications', require('./routes/applications'));
app.use('/api/contacts', require('./routes/contacts'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: 'Connected'
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
    }
  });
});

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
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;