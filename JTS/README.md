# Job Tracker System

A comprehensive job application tracking system with analytics, contact management, and cloud sync capabilities.

## 🚀 Features

- **Application Tracking**: Track job applications with detailed information
- **Contact Management**: Manage networking contacts and potential referrals
- **Analytics Dashboard**: Visualize your job search progress with charts
- **Resume Management**: Upload and manage multiple resume versions
- **Email Templates**: Pre-built templates for networking and follow-ups
- **Cloud Sync**: Automatic backup and sync across devices
- **Offline Support**: Works offline with automatic sync when online
- **Export/Import**: Export data to Excel, CSV, or PDF formats

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js, MongoDB
- **Charts**: Chart.js
- **Authentication**: Simple user management
- **Deployment**: Vercel (Frontend & Backend)

## 📦 Installation

### Frontend (Client)
```bash
# Clone the repository
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker/JTS

# Open index.html in your browser or serve with a local server
# For development, you can use:
python -m http.server 8000
# or
npx serve .
```

### Backend (API)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm start
```

## 🌐 Environment Variables

Create a `.env` file in the backend directory:

```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobtracker
JWT_SECRET=your-super-secret-jwt-key
```

## 🚀 Deployment

### Deploy Frontend to Vercel
```bash
cd JTS
vercel --prod
```

### Deploy Backend to Vercel
```bash
cd backend
vercel --prod
```

### Alternative: Deploy to Netlify (Frontend)
```bash
# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

## 📱 Usage

1. **Add Applications**: Track your job applications with detailed information
2. **Manage Contacts**: Build your professional network
3. **Upload Resumes**: Store multiple resume versions for different roles
4. **View Analytics**: Monitor your job search progress
5. **Use Templates**: Send professional emails using pre-built templates
6. **Export Data**: Generate reports for analysis

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

### Sync
- `GET /api/sync` - Get all user data
- `POST /api/sync` - Bulk sync data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/job-tracker/issues) page
2. Create a new issue if needed
3. Contact: your-email@example.com

## 🔮 Roadmap

- [ ] Advanced analytics and insights
- [ ] Integration with job boards APIs
- [ ] Mobile app (React Native)
- [ ] AI-powered resume optimization
- [ ] Interview scheduling integration
- [ ] Salary negotiation tools

---

Made with ❤️ for job seekers everywhere