#!/bin/bash

echo "🚀 Deploying Job Tracker System..."

# Add all changes
git add .

# Commit changes
git commit -m "Fix Vercel deployment configuration and MongoDB integration

- Updated API URL detection for production
- Fixed Vercel routing configuration
- Added proper CORS settings for deployment
- Enhanced MongoDB connection with better error handling
- Added health check endpoints for debugging
- Updated environment variables documentation"

# Push to GitHub
git push origin main

echo "✅ Changes pushed to GitHub"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Your project should auto-deploy from GitHub"
echo "3. Set up environment variables in Vercel dashboard"
echo "4. Add your MongoDB connection string"
echo ""
echo "📋 Environment Variables to add in Vercel:"
echo "- MONGODB_URI: (your MongoDB Atlas connection string)"
echo "- JWT_SECRET: (generate a random secret)"
echo "- NODE_ENV: production"