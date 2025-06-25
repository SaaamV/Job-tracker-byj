#!/bin/bash

# Job Tracker Deployment Fix Script
# This script fixes common deployment issues and prepares the app for production

echo "🚀 Starting Job Tracker Deployment Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. Please run this script from the Job-tracker-fixed directory."
    exit 1
fi

print_status "Checking project structure..."

# 1. Create missing directories
print_status "Creating missing directories..."
mkdir -p backend/api
mkdir -p JTS/assets/{css,js,images}

# 2. Check if MongoDB URI is set
print_status "Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    print_warning ".env file not found in backend directory"
    print_status "Creating template .env file..."
    cat > backend/.env << EOF
# IMPORTANT: Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/jobtracker?retryWrites=true&w=majority

# Application Configuration
NODE_ENV=production
PORT=5000

# JWT Secret - CHANGE THIS TO A SECURE RANDOM STRING
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# API Configuration
API_BASE_URL=\${VERCEL_URL:+https://\$VERCEL_URL}
EOF
    print_warning "Please update the MONGODB_URI in backend/.env with your actual MongoDB connection string"
fi

# 3. Fix package.json in backend if missing
print_status "Checking backend package.json..."
if [ ! -f "backend/package.json" ]; then
    print_status "Creating backend package.json..."
    cat > backend/package.json << 'EOF'
{
  "name": "job-tracker-backend",
  "version": "1.0.0",
  "description": "Job Tracker Backend API with MongoDB integration",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": ["job", "tracker", "mongodb", "express", "api"],
  "author": "Your Name",
  "license": "MIT"
}
EOF
fi

# 4. Create API health check endpoint for serverless
print_status "Creating serverless API endpoint..."
mkdir -p api
cat > api/health.js << 'EOF'
// Serverless health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Job Tracker API is running'
  });
}
EOF

# 5. Create deployment guide
print_status "Creating deployment guide..."
cat > DEPLOYMENT_GUIDE.md << 'EOF'
# Job Tracker Deployment Guide

## Quick Setup (5 minutes)

### 1. Get MongoDB Atlas Database (Free)
1. Visit: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create free cluster (M0 Sandbox)
4. Create database user with password
5. Set Network Access to "Allow from anywhere" (0.0.0.0/0)
6. Get connection string

### 2. Update Environment Variables
```bash
# Edit backend/.env file
MONGODB_URI=your_mongodb_connection_string_here
```

### 3. Deploy to Vercel (Free)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

## Detailed Instructions

### MongoDB Setup
1. **Create Atlas Account**: Go to https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Choose "Create a New Cluster" → Free tier (M0)
3. **Create User**: Database Access → Add New Database User
4. **Network Access**: Add IP Address → Allow Access from Anywhere
5. **Get Connection String**: Clusters → Connect → Connect your application

### Environment Configuration
Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobtracker
NODE_ENV=production
JWT_SECRET=your_secure_secret_here
```

### Local Testing
```bash
# Start development servers
./start.sh

# Frontend: http://localhost:8080
# Backend: http://localhost:5000
```

### Production Deployment
```bash
# Deploy to Vercel
./deploy.sh

# Or manually:
vercel --prod
```

### Post-Deployment
1. Set environment variables in Vercel dashboard
2. Test `/api/health` endpoint
3. Test application functionality
4. Monitor for errors

## Troubleshooting

### Common Issues
- **500 Error**: Check MongoDB connection string
- **CORS Error**: Verify domain in server.js CORS config
- **Auth Error**: Usually Vercel authentication, check logs

### Quick Fixes
```bash
# Test MongoDB connection
node -e "require('./backend/config/database')()"

# Check Vercel logs
vercel logs

# Test API locally
curl http://localhost:5000/api/health
```

## Security Checklist
- [ ] MongoDB user has minimal required permissions
- [ ] JWT secret is secure and random
- [ ] Environment variables are set correctly
- [ ] No sensitive data in git repository
- [ ] HTTPS enabled (automatic with Vercel)

Your Job Tracker is now ready for production! 🚀
EOF

# 6. Create simple deployment script
print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
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
EOF

chmod +x deploy.sh

# 7. Final success message
print_success "Job Tracker deployment fix completed!"
echo ""
print_status "🎯 Quick Start Guide:"
echo "1. 📝 Get MongoDB Atlas database (free): https://www.mongodb.com/cloud/atlas"
echo "2. 🔧 Update backend/.env with your MongoDB connection string"
echo "3. 🧪 Test locally: ./start.sh"
echo "4. 🚀 Deploy: ./deploy.sh"
echo "5. ⚙️  Set environment variables in Vercel dashboard"
echo ""
print_warning "💡 Important: Never commit .env files to git!"
echo ""
print_success "📖 Read DEPLOYMENT_GUIDE.md for detailed instructions"
print_success "Your modern Job Tracker with Apple-inspired design is ready! 🎉"
