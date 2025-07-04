# Job Tracker - Full Stack Application

A comprehensive job application tracking system with cloud-based storage and Chrome extension integration.

## 🚀 Features

- **Job Application Management**: Track applications with detailed information
- **Contact Management**: Maintain professional contacts and networking
- **Resume Management**: Upload and manage multiple resume versions (cloud storage)
- **Analytics Dashboard**: Visualize application progress and success rates
- **Chrome Extension**: Auto-extract job data from job boards
- **Cover Letter Generator**: Generate professional cover letters with PDF download
- **Cloud-Only Architecture**: All data stored securely in MongoDB cloud

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- CSS Grid & Flexbox for responsive design
- Chart.js for analytics visualization
- jsPDF for PDF generation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- RESTful API architecture
- Environment-based configuration

### Chrome Extension
- Manifest V3
- Content Scripts for job data extraction
- Background Service Worker
- Real-time sync with web application

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Modern web browser
- Chrome browser (for extension)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Job-tracker-fixed
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials
# Replace placeholder values with actual MongoDB URI and JWT secret
nano .env
```

### 3. Environment Configuration
Update the `.env` file with your actual values:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/job-tracker
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
```

### 4. Start the Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Frontend Setup
```bash
# Navigate back to root directory
cd ../

# Serve the frontend (using Python 3)
python3 -m http.server 8080 --directory JTS

# Or using Node.js serve
npx serve JTS -p 8080
```

### 6. Chrome Extension Setup (Optional)
```bash
# Navigate to chrome-extension directory
cd chrome-extension

# Open Chrome and go to chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked" and select the chrome-extension folder
```

## 🚀 Usage

### Web Application
1. Open your browser and navigate to `http://localhost:8080`
2. Start adding job applications, contacts, and resumes
3. Use the analytics tab to track your progress
4. Generate cover letters with the built-in generator

### Chrome Extension
1. Visit job boards like LinkedIn, Indeed, Glassdoor
2. Click the floating "Track Job" button
3. Review auto-extracted job details
4. Save to your job tracker

## 📁 Project Structure

```
Job-tracker-fixed/
├── JTS/                          # Frontend application
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css         # Comprehensive styling
│   │   └── js/
│   │       ├── core/            # Core functionality
│   │       ├── features/        # Feature modules
│   │       └── integrations/    # External integrations
│   └── index.html               # Main application
├── backend/                      # Node.js backend
│   ├── config/                  # Configuration files
│   ├── models/                  # MongoDB models
│   ├── routes/                  # API routes
│   ├── middleware/              # Security & validation
│   └── server.js               # Main server file
├── chrome-extension/            # Chrome extension
│   ├── background.js
│   ├── content.js
│   ├── popup.js
│   └── manifest.json
└── README.md
```

## 🔒 Security Features

- Environment variable protection
- Rate limiting
- Input validation
- CORS configuration
- Security headers
- Error handling
- Secure credential storage

## 🔧 API Endpoints

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Resumes
- `GET /api/resumes` - Get all resumes
- `POST /api/resumes` - Upload new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `PATCH /api/resumes/:id/default` - Set default resume

### Health
- `GET /api/health` - System health check

## 🌐 Deployment

### Production Deployment
1. Set `NODE_ENV=production` in your environment
2. Update CORS origins to your production domain
3. Use a process manager like PM2
4. Set up SSL/HTTPS
5. Configure MongoDB Atlas with proper security

### Vercel Deployment (Backend)
1. Configure vercel.json for API routes
2. Set environment variables in Vercel dashboard
3. Deploy using Vercel CLI

## 🛡️ Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets
- Regularly update dependencies
- Implement proper CORS
- Validate all user inputs
- Use HTTPS in production
- Monitor for security vulnerabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify MongoDB URI is correct
- Check network connectivity
- Ensure IP is whitelisted in MongoDB Atlas

**Chrome Extension Not Working**
- Verify extension is loaded and enabled
- Check console for errors
- Ensure content scripts are injected

**Frontend/Backend Communication Issues**
- Check CORS configuration
- Verify API endpoints are running
- Check browser console for network errors

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console logs
3. Check backend server logs
4. Create an issue in the repository

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Mobile application
- [ ] Advanced analytics
- [ ] Team collaboration features