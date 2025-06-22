# Environment Variables for Vercel

# 1. Go to your Vercel dashboard: https://vercel.com/dashboard
# 2. Select your job-tracker project
# 3. Go to Settings > Environment Variables
# 4. Add these variables:

NODE_ENV=production

# MongoDB Connection String (REQUIRED)
# Get this from your MongoDB Atlas cluster
# Format: mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://username:password@jobtrackingsystem.xxxxx.mongodb.net/jobtracker?retryWrites=true&w=majority

# JWT Secret for authentication (REQUIRED)
# Generate a random string for security
JWT_SECRET=your-super-secret-jwt-key-12345

# Optional: Google API credentials (if using Google Sheets)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Instructions:
# 1. Replace 'username' and 'password' with your MongoDB Atlas credentials
# 2. Replace 'xxxxx' with your actual cluster ID from MongoDB Atlas
# 3. Generate a strong JWT secret (use: openssl rand -base64 32)
# 4. Add each variable separately in Vercel dashboard