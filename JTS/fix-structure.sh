#!/bin/bash

echo "🔧 Fixing Job Tracker repository structure..."

# Create the correct structure
mkdir -p Job-tracker-fixed/JTS
mkdir -p Job-tracker-fixed/backend

# Copy frontend files to JTS folder
cp -r JTS/* Job-tracker-fixed/JTS/
cp -r backend/* Job-tracker-fixed/backend/

# Copy root files
cp vercel.json Job-tracker-fixed/
cp package.json Job-tracker-fixed/
cp README.md Job-tracker-fixed/
cp .gitignore Job-tracker-fixed/
cp DEPLOYMENT.md Job-tracker-fixed/
cp ENVIRONMENT_SETUP.md Job-tracker-fixed/

echo "✅ Fixed repository structure!"
echo ""
echo "📁 New structure:"
echo "Job-tracker-fixed/"
echo "├── JTS/           # Frontend"
echo "├── backend/       # API Server"
echo "├── vercel.json    # Deployment config"
echo "└── ..."
echo ""
echo "🚀 Next steps:"
echo "1. cd Job-tracker-fixed"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Fix repository structure for Vercel deployment'"
echo "5. git remote add origin https://github.com/Mario263/Job-tracker.git"
echo "6. git push -f origin main"