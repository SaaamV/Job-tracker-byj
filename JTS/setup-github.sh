#!/bin/bash

# GitHub Repository Setup Script
# Run this script to initialize your repository and deploy to GitHub

echo "🚀 Setting up Job Tracker System for GitHub deployment..."

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Job Tracker System with cloud sync and analytics"

# Add GitHub remote (replace with your repository URL)
echo "📝 Please create a repository on GitHub and paste the URL below:"
read -p "GitHub repository URL (e.g., https://github.com/username/job-tracker.git): " repo_url

if [ ! -z "$repo_url" ]; then
    git remote add origin $repo_url
    git branch -M main
    git push -u origin main
    echo "✅ Repository pushed to GitHub!"
else
    echo "⚠️  Skipping GitHub push. You can add the remote later with:"
    echo "   git remote add origin YOUR_REPO_URL"
    echo "   git push -u origin main"
fi

echo ""
echo "🌐 Next steps for deployment:"
echo "1. Frontend: Deploy to Vercel or Netlify"
echo "2. Backend: Deploy to Vercel, Railway, or Heroku"
echo "3. Database: Set up MongoDB Atlas (free tier available)"
echo ""
echo "📚 See README.md for detailed deployment instructions"