#!/bin/bash

echo "🔧 Job Tracker Database Connection Troubleshooter"
echo "================================================="

# Navigate to backend directory
cd /Users/mario/Desktop/Job-tracker-fixed/backend

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ .env file found"

# Check if MongoDB URI is in .env
if grep -q "MONGODB_URI" .env; then
    echo "✅ MONGODB_URI found in .env"
    
    # Extract and display MongoDB URI (without showing password)
    MONGO_URI=$(grep "MONGODB_URI" .env | cut -d'=' -f2)
    MONGO_PREVIEW=$(echo "$MONGO_URI" | sed 's/:[^@]*@/:***@/')
    echo "📍 MongoDB URI: $MONGO_PREVIEW"
else
    echo "❌ MONGODB_URI not found in .env"
    exit 1
fi

# Test MongoDB connection
echo ""
echo "🚀 Testing MongoDB connection..."
node test-db.js

# If test passed, start the backend
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MongoDB connection successful!"
    echo "🚀 Starting backend server..."
    npm start
else
    echo ""
    echo "❌ MongoDB connection failed!"
    echo "💡 Common solutions:"
    echo "   1. Check your internet connection"
    echo "   2. Verify MongoDB Atlas credentials"
    echo "   3. Check if IP address is whitelisted in MongoDB Atlas"
    echo "   4. Ensure cluster is running in MongoDB Atlas"
    echo ""
    echo "🔄 Starting backend in offline mode..."
    npm start
fi
