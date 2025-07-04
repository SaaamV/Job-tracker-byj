// Security Middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { getConfig } = require('../config/environment');

const config = getConfig();

// Rate limiting middleware
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
    ...options
  };

  return rateLimit(defaultOptions);
};

// API rate limiting (stricter)
const apiRateLimit = createRateLimit({
  max: 50, // 50 requests per window
  message: {
    error: 'API rate limit exceeded. Please slow down your requests.',
    retryAfter: Math.ceil(config.security.rateLimit.windowMs / 1000)
  }
});

// Upload rate limiting (even stricter)
const uploadRateLimit = createRateLimit({
  max: 10, // 10 uploads per window
  windowMs: 60 * 1000, // 1 minute window
  message: {
    error: 'Upload rate limit exceeded. Please wait before uploading again.',
    retryAfter: 60
  }
});

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://apis.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API usage
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Request validation middleware
const validateRequest = (req, res, next) => {
  // Basic request validation
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
    return res.status(413).json({ 
      success: false, 
      error: 'Request entity too large. Maximum size is 10MB.' 
    });
  }

  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && 
      req.headers['content-type'] && 
      !req.headers['content-type'].includes('application/json') &&
      !req.headers['content-type'].includes('multipart/form-data')) {
    return res.status(415).json({ 
      success: false, 
      error: 'Unsupported media type. Expected application/json.' 
    });
  }

  next();
};

// Error handling middleware for security
const securityErrorHandler = (err, req, res, next) => {
  // Don't expose internal errors in production
  if (config.nodeEnv === 'production') {
    console.error('Security Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }

  // In development, provide more details
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

// CORS options factory
const createCorsOptions = (origins = config.security.corsOrigin) => {
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (origins === '*') {
        return callback(null, true);
      }
      
      const allowedOrigins = Array.isArray(origins) ? origins : [origins];
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-Forwarded-For'
    ]
  };
};

module.exports = {
  createRateLimit,
  apiRateLimit,
  uploadRateLimit,
  securityHeaders,
  validateRequest,
  securityErrorHandler,
  createCorsOptions
};