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
