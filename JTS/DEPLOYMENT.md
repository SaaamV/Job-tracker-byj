# Deployment Guide

## 🚀 Quick Deploy (Recommended)

### Option 1: Deploy to Vercel (Easiest)

1. **Push to GitHub first:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/job-tracker.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Import your repository
   - Vercel will automatically deploy both frontend and backend

3. **Set up MongoDB:**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string
   - Add it to Vercel environment variables

### Option 2: Deploy Frontend + Backend Separately

#### Frontend (Netlify or GitHub Pages)
```bash
# For Netlify
npm install -g netlify-cli
cd JTS
netlify deploy --prod --dir=.
```

#### Backend (Railway or Heroku)
```bash
# For Railway
npm install -g @railway/cli
cd backend
railway login
railway link
railway up
```

## 🔧 Environment Setup

### Required Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobtracker
JWT_SECRET=your-super-secret-key-here
```

**Frontend (automatic detection):**
- Development: http://localhost:3001
- Production: https://your-api-domain.vercel.app

## 📱 MongoDB Atlas Setup

1. **Create Account:** [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster:** Choose free tier (M0)
3. **Create Database User:** Set username and password
4. **Network Access:** Add `0.0.0.0/0` (or your specific IPs)
5. **Get Connection String:** Replace username, password, and database name

Example connection string:
```
mongodb+srv://jobtracker:yourpassword@cluster0.abc123.mongodb.net/jobtracker?retryWrites=true&w=majority
```

## 🌐 Domain Setup (Optional)

### Custom Domain on Vercel
1. Go to your project dashboard
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### SSL Certificate
- Automatically provided by Vercel/Netlify
- No additional setup required

## 🔒 Security Checklist

- [ ] MongoDB connection string uses strong password
- [ ] JWT secret is randomly generated and secure
- [ ] CORS origins are properly configured
- [ ] Environment variables are not exposed in frontend
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced

## 📊 Monitoring

### Set up monitoring (optional):
- **Vercel Analytics:** Built-in performance monitoring
- **MongoDB Atlas Monitoring:** Database performance
- **Error Tracking:** Consider adding Sentry

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check backend CORS configuration
   - Ensure frontend URL is in allowed origins

2. **Database Connection Failed:**
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Ensure database user has proper permissions

3. **API Not Found:**
   - Check Vercel routing configuration
   - Verify backend deployment logs

4. **Charts Not Loading:**
   - Check browser console for errors
   - Ensure Chart.js is loading properly

### Debug Commands:
```bash
# Check backend logs
vercel logs your-backend-url

# Test API endpoints
curl https://your-api-url/health

# Check frontend build
cd JTS && python -m http.server 8000
```

## 💡 Performance Tips

1. **Enable caching** for static assets
2. **Compress images** and optimize file sizes
3. **Use CDN** for faster global access (Vercel provides this)
4. **Monitor bundle size** and optimize if needed
5. **Enable gzip compression** (automatic on Vercel)

## 🔄 Updates and Maintenance

### Regular Updates:
- Monitor dependency vulnerabilities
- Update Node.js and npm packages
- Backup database regularly
- Monitor usage and performance

### Scaling:
- MongoDB Atlas auto-scales
- Vercel serverless functions scale automatically
- Consider upgrading plans as usage grows

---

**Need help?** Open an issue on GitHub or contact support.