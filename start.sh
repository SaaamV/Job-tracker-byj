#!/bin/bash

echo "Starting Job Tracker Development Environment..."

# Kill any existing processes on ports 5000 and 8080
echo "🧹 Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 2

# Check if we're in development
if [ "$NODE_ENV" != "production" ]; then
    echo "🔧 Development mode - starting local servers..."
    
    # Start backend server first
    echo "📡 Starting backend server on port 5000..."
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Check if .env file exists and has MongoDB URI
    if [ ! -f ".env" ]; then
        echo "⚠️  Warning: .env file not found. Creating template..."
        cat > .env << 'EOF'
# IMPORTANT: Replace with your actual MongoDB connection string
MONGODB_URI=mongodb+srv://sharmaabhishek263:Abhishek1@jobtrack.bc5ykhu.mongodb.net/?retryWrites=true&w=majority&appName=JobTrack

# Application Configuration
NODE_ENV=development
PORT=5000

# JWT Secret - CHANGE THIS TO A SECURE RANDOM STRING
JWT_SECRET=your_secure_jwt_secret_key_change_this

# API Configuration
API_BASE_URL=http://localhost:5000
EOF
        echo "✅ .env file created with your MongoDB credentials"
    fi
    
    # Start backend in background
    echo "🚀 Starting backend API server..."
    npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to initialize..."
    sleep 8  # Increased wait time
    
    # Test backend health with retry logic
    echo "🏥 Testing backend health..."
    BACKEND_READY=false
    for i in {1..15}; do  # Increased retry attempts
        # First check if the port is even open
        if nc -z localhost 5000 2>/dev/null; then
            # Then check if the health endpoint returns valid JSON
            HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health 2>/dev/null)
            if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "status"; then
                echo "✅ Backend is healthy and ready!"
                echo "📋 Health status: $HEALTH_RESPONSE"
                BACKEND_READY=true
                break
            fi
        fi
        echo "⏳ Backend not ready yet (attempt $i/15)..."
        sleep 2
    done
    
    if [ "$BACKEND_READY" = false ]; then
        echo "❌ Backend failed to start properly."
        echo "🔍 This could be due to:"
        echo "   - MongoDB connection issues (check your .env file)"
        echo "   - Port 5000 already in use"
        echo "   - Missing dependencies (try: cd backend && npm install)"
        echo "💡 Don't worry - the frontend will work with localStorage!"
    fi
    
    # Return to root directory
    cd ..
    
    # Start frontend server
    echo "🌐 Starting frontend server on port 8080..."
    cd JTS
    
    # Check if we can use Python 3
    if command -v python3 &> /dev/null; then
        echo "📱 Using Python 3 HTTP server..."
        python3 -m http.server 8080 &
        FRONTEND_PID=$!
    elif command -v python &> /dev/null; then
        echo "📱 Using Python 2 HTTP server..."
        python -m SimpleHTTPServer 8080 &
        FRONTEND_PID=$!
    else
        echo "⚠️  Python not found. Trying Node.js server..."
        if command -v npx &> /dev/null; then
            npx serve . -p 8080 &
            FRONTEND_PID=$!
        else
            echo "❌ No suitable HTTP server found. Please install Python or Node.js"
            exit 1
        fi
    fi
    
    # Wait for frontend to start
    sleep 3
    
    cd ..
    
    echo ""
    echo "🎉 Job Tracker is running!"
    echo "==============================================="
    echo "📱 Frontend:     http://localhost:8080"
    echo "🔧 Backend API:  http://localhost:5000"
    echo "🏥 Health Check: http://localhost:5000/api/health"
    echo "📊 Applications: http://localhost:5000/api/applications"
    echo "==============================================="
    echo ""
    
    if [ "$BACKEND_READY" = true ]; then
        echo "✅ Full-stack mode: Data will be saved to MongoDB"
    else
        echo "⚠️  Frontend-only mode: Data will be saved to localStorage"
        echo "🔧 To fix backend: Check MongoDB connection in backend/.env"
    fi
    
    echo ""
    echo "💡 Tips:"
    echo "   - Open http://localhost:8080 in your browser"
    echo "   - Install Chrome extension from /chrome-extension"
    echo "   - Check backend logs if API calls fail"
    echo ""
    echo "Press Ctrl+C to stop all servers"
    
    # Function to cleanup on exit
    cleanup() {
        echo ""
        echo "🛑 Stopping servers..."
        if [ ! -z "$BACKEND_PID" ]; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        if [ ! -z "$FRONTEND_PID" ]; then
            kill $FRONTEND_PID 2>/dev/null || true
        fi
        # Kill any remaining processes on our ports
        lsof -ti:5000 | xargs kill -9 2>/dev/null || true
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        echo "✅ Cleanup complete"
        exit 0
    }
    
    # Set up signal handlers
    trap cleanup INT TERM
    
    # Wait for user to stop (this keeps the script running)
    while true; do
        sleep 1
        
        # Check if backend is still running
        if [ ! -z "$BACKEND_PID" ] && ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo "⚠️  Backend process stopped unexpectedly"
            BACKEND_PID=""
        fi
        
        # Check if frontend is still running
        if [ ! -z "$FRONTEND_PID" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "⚠️  Frontend process stopped unexpectedly"
            FRONTEND_PID=""
        fi
    done
    
else
    echo "🚀 Production mode detected"
    echo "💡 Use Vercel deployment instead"
    echo "Run: ./deploy.sh"
fi