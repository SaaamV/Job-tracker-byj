#!/bin/bash

echo "🚀 Deploying Fixed Job Tracker System..."

# Change to project directory
cd /Users/mario/Desktop/Job-tracker-fixed

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    # Commit changes
    git commit -m "Fix job application issues and improve deployment

    - Fixed API endpoints for job applications
    - Updated CORS configuration for production
    - Enhanced error handling and logging
    - Fixed database connection issues
    - Updated environment variable handling
    - Improved UI responsiveness for job forms"
fi

# Push to GitHub
git push origin main

echo "✅ Changes pushed to GitHub"
echo ""
echo "🌐 Vercel will automatically deploy from GitHub"
echo "📋 Make sure to add these environment variables in Vercel:"
echo "   - MONGODB_URI: (your MongoDB Atlas connection string)"
echo "   - JWT_SECRET: job-tracker-secret-key-2025-production"
echo "   - NODE_ENV: production"
echo ""
echo "🔗 Check deployment status at: https://vercel.com/dashboard"