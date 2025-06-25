#!/bin/bash

echo "🚀 Deploying Job Tracker..."

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔑 Don't forget to set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI (your MongoDB connection string)"
echo "   - JWT_SECRET (secure random string)"
echo "   - NODE_ENV=production"
echo ""
echo "📊 Visit: https://vercel.com/dashboard"
