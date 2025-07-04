#!/bin/bash
# Job Tracker Microservices Startup Script
echo "🚀 Starting Job Tracker Microservices Architecture"
# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your MongoDB URI before running again."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# MongoDB is now running locally via Docker, no external URI needed
echo "✅ Using local MongoDB via Docker"

echo "📦 Building and starting all microservices..."

# Start services with Docker Compose
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 15

# Health check function
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service_name (attempt $attempt/$max_attempts)..."
        sleep 3
        ((attempt++))
    done
    
    echo "❌ $service_name failed to start"
    return 1
}

# Check all services
echo "🔍 Checking service health..."

check_service "API Gateway" "http://localhost:3000/api/health"
check_service "Applications Service" "http://localhost:4001/api/health"
check_service "Contacts Service" "http://localhost:4002/api/health"
check_service "Analytics Service" "http://localhost:4003/api/health"
check_service "Resumes Service" "http://localhost:4004/api/health"
check_service "Export Service" "http://localhost:4005/api/health"
check_service "Templates Service" "http://localhost:4006/api/health"
check_service "Chrome Extension Service" "http://localhost:4007/api/health"
check_service "Payments Service" "http://localhost:4008/api/health"

echo ""
echo "🎉 Job Tracker Microservices are running!"
echo ""
echo "📋 Service URLs:"
echo "   API Gateway:          http://localhost:3000"
echo "   Frontend:             http://localhost:8080"
echo "   Applications Service: http://localhost:4001"
echo "   Contacts Service:     http://localhost:4002"
echo "   Analytics Service:    http://localhost:4003"
echo "   Resumes Service:      http://localhost:4004"
echo "   Export Service:       http://localhost:4005"
echo "   Templates Service:    http://localhost:4006"
echo "   Chrome Ext Service:   http://localhost:4007"
echo "   Payments Service:     http://localhost:4008"
echo "   MongoDB Database:     mongodb://localhost:27017"
echo ""
echo "🔧 Management Commands:"
echo "   View logs:    docker-compose logs -f [service-name]"
echo "   Stop all:     docker-compose down"
echo "   Restart:      docker-compose restart [service-name]"
echo "   View status:  docker-compose ps"
echo ""
echo "🌐 Open http://localhost:8080 to access the application"