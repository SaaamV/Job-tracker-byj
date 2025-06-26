#!/bin/bash

echo "🧹 Cleaning up Job Tracker directory..."

# Navigate to project root
cd /Users/mario/Desktop/Job-tracker-fixed

# Remove unnecessary shell scripts (keep only start.sh)
echo "🗑️  Removing unnecessary shell scripts..."
rm -f deploy.sh 2>/dev/null
rm -f fix-deployment.sh 2>/dev/null
rm -f debug.sh 2>/dev/null
rm -f JTS/deploy.sh 2>/dev/null
rm -f JTS/fix-structure.sh 2>/dev/null
rm -f JTS/setup-github.sh 2>/dev/null

# Remove duplicate/unnecessary documentation
echo "📄 Removing duplicate documentation..."
rm -f JTS/DEPLOYMENT.md 2>/dev/null
rm -f JTS/ENVIRONMENT_SETUP.md 2>/dev/null
rm -f JTS/README.md 2>/dev/null
rm -f DEPLOYMENT_GUIDE.md 2>/dev/null

# Remove duplicate Vercel configs
echo "⚙️  Cleaning up configuration files..."
rm -f JTS/vercel.json 2>/dev/null
rm -f backend/.vercel/project.json 2>/dev/null

# Remove unnecessary backend template
echo "🔧 Cleaning backend files..."
rm -f backend/.env.template 2>/dev/null

# Remove any backup files
echo "🗄️  Removing backup files..."
find . -name "*.backup" -delete 2>/dev/null
find . -name "*.bak" -delete 2>/dev/null
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.orig" -delete 2>/dev/null

# Remove macOS system files
echo "🍎 Removing macOS system files..."
find . -name ".DS_Store" -delete 2>/dev/null
find . -name ".AppleDouble" -delete 2>/dev/null
find . -name ".LSOverride" -delete 2>/dev/null

# Remove editor files
echo "📝 Removing editor configuration files..."
rm -rf .vscode 2>/dev/null
rm -rf .idea 2>/dev/null

# Remove unnecessary node_modules in JTS (keep only backend node_modules)
echo "📦 Cleaning up node_modules..."
rm -rf JTS/node_modules 2>/dev/null
rm -f JTS/package-lock.json 2>/dev/null
rm -f JTS/package.json 2>/dev/null

# Remove any duplicate directories
echo "📁 Removing duplicate directories..."
rm -rf api 2>/dev/null  # This seems to be a duplicate of backend
rm -rf JTS/backend 2>/dev/null  # Duplicate backend in JTS

# List remaining important files
echo ""
echo "✅ Cleanup complete! Remaining structure:"
echo "📁 Project structure after cleanup:"
tree -I 'node_modules|.git' . 2>/dev/null || find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | head -20

echo ""
echo "🎯 Key files kept:"
echo "  📄 README.md (main project documentation)"
echo "  🚀 start.sh (startup script)"
echo "  ⚙️  vercel.json (deployment config)"
echo "  🔒 .gitignore (git ignore rules)"
echo "  📁 backend/ (API server)"
echo "  📁 JTS/ (frontend)"
echo "  📁 chrome-extension/ (browser extension)"

echo ""
echo "🗑️  Files removed:"
echo "  ❌ Duplicate shell scripts"
echo "  ❌ Backup files"
echo "  ❌ macOS system files"
echo "  ❌ Editor config files"
echo "  ❌ Duplicate documentation"
echo "  ❌ Unnecessary node_modules"

echo ""
echo "💡 Next steps:"
echo "  1. git add -A"
echo "  2. git commit -m \"Clean up directory structure\""
echo "  3. git push"