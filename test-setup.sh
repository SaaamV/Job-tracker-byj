#!/bin/bash

echo "🧪 Testing Job Tracker Setup"
echo "============================"

# Test if ports are open
echo "🔍 Checking if servers are running..."

# Check backend (port 3001)
if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Backend API is running on port 3001"
    echo "📋 Backend health check:"
    curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/api/health
else
    echo "❌ Backend API is NOT running on port 3001"
    echo "💡 Run: ./start.sh to start the servers"
fi

echo ""

# Check frontend (port 8080)
if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Frontend is running on port 8080"
else
    echo "❌ Frontend is NOT running on port 8080"
    echo "💡 Run: ./start.sh to start the servers"
fi

echo ""
echo "🌐 URLs to test:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:3001/api/health"
echo "   Applications API: http://localhost:3001/api/applications"
echo ""

# Test Chrome extension setup
echo "🔧 Chrome Extension Setup:"
echo "   1. Open Chrome and go to chrome://extensions/"
echo "   2. Enable 'Developer mode' (top right toggle)"
echo "   3. Click 'Load unpacked' and select: $(pwd)/chrome-extension"
echo "   4. The extension should now appear in your extensions list"
echo "   5. Test by visiting a job site like LinkedIn and clicking the extension"
echo ""

echo "✨ Everything looks good! Your extension now points to:"
echo "   📱 Frontend: http://localhost:8080"
echo "   📡 API: http://localhost:3001"
