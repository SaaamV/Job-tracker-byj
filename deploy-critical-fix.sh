#!/bin/bash

echo "🔧 Applying critical fixes for job application issues..."

# Change to project directory
cd /Users/mario/Desktop/Job-tracker-fixed

# Add all changes
git add .

# Commit changes
git commit -m "CRITICAL FIX: Resolve job application adding issues

🐛 Fixed Issues:
- Applications now save immediately (offline-first approach)
- Fixed API error handling that was blocking saves
- Improved error messaging and user feedback
- Fixed global variable access issues
- Added debugging tools for testing

✅ Improvements:
- Applications save locally first, then sync to cloud
- Better error handling and recovery
- UI updates immediately after saving
- Added test function for debugging: testAddApplication()
- Improved analytics and chart rendering

🧪 Testing:
After deployment, you can test by:
1. Adding a job application normally
2. Or run testAddApplication() in browser console for instant test

This ensures your data is never lost, even if cloud sync fails."

# Push to GitHub
git push origin main

echo "✅ Critical fixes deployed to GitHub!"
echo ""
echo "🚀 Next Steps:"
echo "1. Vercel will auto-deploy in ~2 minutes"
echo "2. Add environment variables in Vercel dashboard:"
echo "   - MONGODB_URI: (your MongoDB connection string)"
echo "   - JWT_SECRET: job-tracker-secret-key-2025-production"
echo "   - NODE_ENV: production"
echo ""
echo "🧪 Testing after deployment:"
echo "- Try adding a job application normally"
echo "- Or open browser console and run: testAddApplication()"
echo ""
echo "📊 Your data is now safe with offline-first architecture!"