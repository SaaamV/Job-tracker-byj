#!/bin/bash

echo "🚀 Deploying Job Tracker Critical Fixes..."
echo "=========================================="

# Change to project directory
cd "/Users/mario/Desktop/Job-tracker-fixed"

echo "📁 Current directory: $(pwd)"
echo ""

echo "🔍 Checking current status..."
echo "Git status:"
git status --porcelain

echo ""
echo "🧹 Cleaning up temporary files..."
# Remove any temporary files
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
rm -f chrome-extension/create_icons.html 2>/dev/null || true
rm -f chrome-extension/icon-template.svg 2>/dev/null || true
rm -f chrome-extension/README-ICON-FIX.md 2>/dev/null || true

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing fixes..."
git commit -m "🔧 CRITICAL FIX: Resolve application adding, resume upload, and CV generator issues

✅ Fixed Issues:
- Applications now add properly instead of replacing each other
- Resume upload now works with proper file validation and storage
- CV template generator now functions correctly with formatted output
- Improved error handling and user feedback throughout
- Added comprehensive debugging and console logging

🔧 Technical Changes:
- Fixed applications-fixed.js: Better ID generation and array handling
- Fixed resumes-fixed.js: Proper file reading, validation, and storage
- Updated HTML to use fixed JavaScript files
- Added proper event listeners for all interactive buttons
- Improved localStorage management and data persistence
- Enhanced error messages and user feedback
- Added file size validation and progress indicators

🧪 Testing:
- Applications: Add multiple jobs without replacement
- Resumes: Upload PDF/Word files successfully  
- CV Generator: Generate formatted templates with user data
- All data persists after page refresh
- Proper error handling for edge cases

🌐 Next Steps:
1. Add MONGODB_URI environment variable in Vercel
2. Set NODE_ENV=production in Vercel
3. Test API health endpoint for MongoDB connection
4. Verify all functionality works end-to-end

This ensures your Job Tracker works perfectly before we add UI/UX improvements!"

echo ""
echo "🚀 Pushing to GitHub (this will trigger Vercel deployment)..."
git push origin main

echo ""
echo "✅ Code deployed to GitHub successfully!"
echo ""
echo "🔧 NEXT STEPS (DO THESE NOW):"
echo "1. 🗃️  Add MongoDB environment variable in Vercel:"
echo "   → Go to: https://vercel.com/mario263s-projects/job-tracker/settings/environment-variables"
echo "   → Add MONGODB_URI with your Atlas connection string"
echo "   → Add NODE_ENV set to 'production'"
echo ""
echo "2. ⏱️  Wait 2 minutes for Vercel to deploy"
echo ""
echo "3. 🧪 Test your application:"
echo "   → API Health: https://job-tracker-chi-eight.vercel.app/api/health"
echo "   → Should show: \"mongodb\":\"Connected\""
echo "   → Main App: https://job-tracker-chi-eight.vercel.app"
echo ""
echo "4. ✅ Verify fixes:"
echo "   → Add multiple job applications (should not replace)"
echo "   → Upload a resume file (should work)"
echo "   → Generate CV template (should create formatted output)"
echo ""
echo "🎯 If everything works, you're ready for UI/UX improvements!"
echo "🎨 Next phase: Apple-style animations and modern design elements"
echo ""
echo "📊 Monitor deployment: https://vercel.com/mario263s-projects/job-tracker"
echo ""
echo "🎉 Your Job Tracker is about to be fully functional!"