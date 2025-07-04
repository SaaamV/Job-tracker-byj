// Environment Configuration
// This file handles environment variable loading and validation

const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Environment validation
function validateEnvironment() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
}

// Get configuration object
function getConfig() {
  validateEnvironment();

  return {
    // Server Configuration
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    
    // Security Configuration
    security: {
      jwtSecret: process.env.JWT_SECRET,
      sessionSecret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
      corsOrigin: process.env.CORS_ORIGIN || '*',
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
      }
    },
    
    // Frontend Configuration
    frontend: {
      url: process.env.FRONTEND_URL || 'http://localhost:8080'
    },
    
    // Logging Configuration
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    },
    
    // Feature Flags
    features: {
      enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
      enableCors: process.env.ENABLE_CORS !== 'false', // Default to true
      enableLogging: process.env.ENABLE_LOGGING !== 'false' // Default to true
    }
  };
}

// Export configuration
module.exports = {
  getConfig,
  validateEnvironment,
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test'
};