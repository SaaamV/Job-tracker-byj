require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Service endpoints
const SERVICES = {
  applications: process.env.APPLICATIONS_SERVICE_URL || 'http://localhost:4001',
  contacts: process.env.CONTACTS_SERVICE_URL || 'http://localhost:4002',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4003',
  resumes: process.env.RESUMES_SERVICE_URL || 'http://localhost:4004',
  export: process.env.EXPORT_SERVICE_URL || 'http://localhost:4005',
  templates: process.env.TEMPLATES_SERVICE_URL || 'http://localhost:4006',
  chromeExtension: process.env.CHROME_EXTENSION_SERVICE_URL || 'http://localhost:4007',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:4008'
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: '1.0.0',
    services: SERVICES
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Tracker API Gateway',
    endpoints: {
      health: '/api/health',
      applications: '/api/applications',
      contacts: '/api/contacts',
      analytics: '/api/analytics',
      resumes: '/api/resumes',
      export: '/api/export',
      templates: '/api/templates',
      chromeExtension: '/api/chrome-extension',
      payments: '/api/payments'
    },
    version: '1.0.0'
  });
});

// Proxy configuration with error handling
const createProxy = (target, service) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`❌ Error proxying to ${service}:`, err.message);
      res.status(503).json({
        error: `Service ${service} is unavailable`,
        message: err.message,
        service: service
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔄 Proxying ${req.method} ${req.url} to ${service}`);
    }
  });
};

// Route proxying
app.use('/api/applications', createProxy(SERVICES.applications, 'applications-service'));
app.use('/api/contacts', createProxy(SERVICES.contacts, 'contacts-service'));
app.use('/api/analytics', createProxy(SERVICES.analytics, 'analytics-service'));
app.use('/api/resumes', createProxy(SERVICES.resumes, 'resumes-service'));
app.use('/api/export', createProxy(SERVICES.export, 'export-service'));
app.use('/api/templates', createProxy(SERVICES.templates, 'templates-service'));
app.use('/api/chrome-extension', createProxy(SERVICES.chromeExtension, 'chrome-extension-service'));
app.use('/api/payments', createProxy(SERVICES.payments, 'payments-service'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ 
    error: 'Internal gateway error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log('📡 Routing to services:');
  Object.entries(SERVICES).forEach(([service, url]) => {
    console.log(`  - ${service}: ${url}`);
  });
});

module.exports = app;