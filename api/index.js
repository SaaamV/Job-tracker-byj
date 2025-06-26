// Import the main backend server
const app = require('../backend/server');

// Export for Vercel serverless function
module.exports = app;