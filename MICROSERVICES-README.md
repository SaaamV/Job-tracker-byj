# Job Tracker Microservices Architecture

## 🏗️ Architecture Overview

Your Job Tracker application has been successfully converted from a monolithic architecture to a microservices-based architecture. This transformation provides better scalability, maintainability, and allows for independent deployment of features.

### Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │  Chrome Extension│
│  (Port 8080)    │    │   Service        │
└─────────┬───────┘    │  (Port 4007)     │
          │            └─────────┬────────┘
          │                      │
          └──────────┬───────────┘
                     │
          ┌──────────▼──────────┐
          │   API Gateway       │
          │   (Port 3000)       │
          └──────────┬──────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼───┐  ┌───▼───┐  ┌───▼───┐
    │Apps    │  │Contacts│  │Resume │
    │Service │  │Service │  │Service│
    │(4001)  │  │(4002)  │  │(4004) │
    └────────┘  └────────┘  └───────┘
         │           │           │
    ┌────▼───┐  ┌───▼────┐ ┌──▼────┐
    │Analytics│  │Export  │ │Templates│
    │Service  │  │Service │ │Service│
    │(4003)   │  │(4005)  │ │(4006) │
    └─────────┘  └────────┘ └───────┘
         │           │           │
         └───────────┼───────────┘
                     │
          ┌──────────▼──────────┐
          │   MongoDB Cloud     │
          │    Database         │
          └─────────────────────┘
```

## 🎯 Microservices Breakdown

### 1. API Gateway (Port 3000)
- **Purpose**: Single entry point for all API requests
- **Features**: Request routing, load balancing, error handling
- **Routes**: Proxies to all other services
- **Technology**: Express.js + http-proxy-middleware

### 2. Applications Service (Port 4001)
- **Purpose**: Job applications CRUD operations
- **Features**: Create, read, update, delete job applications
- **Database**: MongoDB (applications collection)
- **Endpoints**: `/api/applications/*`

### 3. Contacts Service (Port 4002)
- **Purpose**: Professional contacts management
- **Features**: Manage networking contacts and relationships
- **Database**: MongoDB (contacts collection)
- **Endpoints**: `/api/contacts/*`

### 4. Analytics Service (Port 4003)
- **Purpose**: Data analytics and insights
- **Features**: Status distribution, timeline analysis, portal success rates
- **Dependencies**: Applications Service, Contacts Service
- **Endpoints**: `/api/analytics/*`

### 5. Resumes Service (Port 4004)
- **Purpose**: Resume file management
- **Features**: Upload, download, version management
- **Storage**: File system + metadata
- **Endpoints**: `/api/resumes/*`

### 6. Export Service (Port 4005)
- **Purpose**: Data export functionality
- **Features**: CSV, JSON export for applications and contacts
- **Dependencies**: Applications Service, Contacts Service
- **Endpoints**: `/api/export/*`

### 7. Templates Service (Port 4006)
- **Purpose**: Job application templates
- **Features**: Pre-defined application templates by category
- **Storage**: In-memory (can be moved to database)
- **Endpoints**: `/api/templates/*`

### 8. Chrome Extension Service (Port 4007)
- **Purpose**: Chrome extension API support
- **Features**: Quick save, job data extraction, notifications
- **Dependencies**: Applications Service, Contacts Service
- **Endpoints**: `/api/chrome-extension/*`

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- MongoDB Cloud Atlas account
- Node.js 18+ (for development)

### Quick Start

1. **Clone and Navigate**
   ```bash
   cd /path/to/Job-tracker-byj
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start All Services**
   ```bash
   ./start-microservices.sh
   ```

4. **Access Application**
   - Frontend: http://localhost:8080
   - API Gateway: http://localhost:3000

### Manual Development Setup

1. **Install Dependencies**
   ```bash
   # Install dependencies for each service
   cd microservices/api-gateway && npm install
   cd ../applications-service && npm install
   cd ../contacts-service && npm install
   cd ../analytics-service && npm install
   cd ../resumes-service && npm install
   cd ../export-service && npm install
   cd ../templates-service && npm install
   cd ../chrome-extension-service && npm install
   ```

2. **Start Services Individually**
   ```bash
   # Terminal 1 - API Gateway
   cd microservices/api-gateway && npm start

   # Terminal 2 - Applications Service
   cd microservices/applications-service && npm start

   # Terminal 3 - Contacts Service
   cd microservices/contacts-service && npm start

   # ... and so on for each service
   ```

## 📁 Project Structure

```
Job-tracker-byj/
├── microservices/
│   ├── api-gateway/
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env
│   ├── applications-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── config/database.js
│   │   ├── models/Application.js
│   │   └── routes/applications.js
│   ├── contacts-service/
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── config/database.js
│   │   ├── models/Contact.js
│   │   └── routes/contacts.js
│   ├── analytics-service/
│   ├── resumes-service/
│   ├── export-service/
│   ├── templates-service/
│   └── chrome-extension-service/
├── JTS/ (Frontend)
├── chrome-extension/
├── docker-compose.yml
├── nginx.conf
├── start-microservices.sh
└── MICROSERVICES-README.md
```

## 🔧 Development Workflow

### Adding a New Feature

1. **Create New Service** (if needed)
   ```bash
   mkdir microservices/new-service
   cd microservices/new-service
   npm init -y
   # Add dependencies and create server.js
   ```

2. **Update API Gateway**
   ```javascript
   // Add service URL to microservices/api-gateway/server.js
   const SERVICES = {
     // ... existing services
     newService: process.env.NEW_SERVICE_URL || 'http://localhost:4008'
   };

   // Add route proxy
   app.use('/api/new-service', createProxy(SERVICES.newService, 'new-service'));
   ```

3. **Update Frontend API**
   ```javascript
   // Add methods to JTS/assets/js/core/api.js
   async getNewServiceData() {
     return await this.request('/new-service/data');
   }
   ```

4. **Update Docker Compose**
   ```yaml
   # Add service to docker-compose.yml
   new-service:
     build: ./microservices/new-service
     ports:
       - "4008:4008"
     # ... other configuration
   ```

### Database Changes

- Each service manages its own database collections
- Applications Service: `applications` collection
- Contacts Service: `contacts` collection
- Shared MongoDB instance with service-specific collections

### Testing Services

```bash
# Health checks
curl http://localhost:3000/api/health                    # API Gateway
curl http://localhost:4001/api/health                    # Applications
curl http://localhost:4002/api/health                    # Contacts
curl http://localhost:4003/api/health                    # Analytics
curl http://localhost:4004/api/health                    # Resumes
curl http://localhost:4005/api/health                    # Export
curl http://localhost:4006/api/health                    # Templates
curl http://localhost:4007/api/health                    # Chrome Extension

# API tests
curl http://localhost:3000/api/applications              # Get applications
curl http://localhost:3000/api/contacts                  # Get contacts
curl http://localhost:3000/api/analytics/overview        # Get analytics
curl http://localhost:3000/api/templates                 # Get templates
```

## 🐳 Docker Operations

### Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Scale a service
docker-compose up -d --scale applications-service=3

# View running services
docker-compose ps

# Execute command in service
docker-compose exec applications-service sh
```

### Environment Variables

Create `.env` file with:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobtracker
NODE_ENV=development
```

## 🔒 Security Considerations

- All services use CORS headers for cross-origin requests
- MongoDB URI should be kept secure (use environment variables)
- Services run as non-root users in Docker containers
- Health checks implemented for all services
- Input validation on all API endpoints

## 📊 Monitoring & Debugging

### Service Health Dashboard

Access the API Gateway health endpoint to see all service statuses:
```bash
curl http://localhost:3000/api/health
```

### Log Analysis

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f applications-service

# View last 100 lines
docker-compose logs --tail=100 analytics-service
```

### Performance Monitoring

- Each service includes response time logging
- Health checks monitor service availability
- Docker health checks provide container status

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   ```

2. **Docker Registry**
   ```bash
   # Build and push images
   docker build -t your-registry/job-tracker-api-gateway:latest microservices/api-gateway
   docker push your-registry/job-tracker-api-gateway:latest
   ```

3. **Kubernetes (Optional)**
   ```yaml
   # Example Kubernetes deployment
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: api-gateway
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: api-gateway
     template:
       metadata:
         labels:
           app: api-gateway
       spec:
         containers:
         - name: api-gateway
           image: your-registry/job-tracker-api-gateway:latest
           ports:
           - containerPort: 3000
   ```

## 🎯 Benefits Achieved

### Scalability
- Each service can be scaled independently
- Resource allocation per service needs
- Horizontal scaling capabilities

### Maintainability
- Clear separation of concerns
- Independent development and deployment
- Easier testing and debugging

### Technology Flexibility
- Different services can use different technologies
- Gradual migration and updates possible
- Team specialization by service

### Fault Isolation
- Service failures don't affect entire application
- Better error handling and recovery
- Graceful degradation

## 📝 Migration Summary

**From Monolithic:**
- Single backend server (port 3001)
- All features in one codebase
- Shared database connection
- Single point of failure

**To Microservices:**
- 8 independent services
- API Gateway pattern
- Service-specific responsibilities
- Fault-tolerant architecture
- Docker containerization
- Easy horizontal scaling

## 🎉 Next Steps

1. **Monitor Performance**: Set up application monitoring
2. **Add Authentication**: Implement JWT-based auth across services
3. **API Documentation**: Add Swagger/OpenAPI docs
4. **Testing**: Implement unit and integration tests
5. **CI/CD**: Set up automated deployment pipeline
6. **Caching**: Add Redis for improved performance
7. **Message Queue**: Implement async communication between services

---

**Congratulations!** Your Job Tracker is now running on a modern microservices architecture. The application is more scalable, maintainable, and ready for production deployment.

For questions or issues, check the service logs and health endpoints for debugging information.