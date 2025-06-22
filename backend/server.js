const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://job-tracker-mario263.vercel.app', 'https://job-tracker-git-main-mario263.vercel.app']
    : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtracker';

console.log('Connecting to MongoDB:', MONGODB_URI ? 'URI provided' : 'No URI provided');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('Database name:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Application Schema
const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  jobPortal: String,
  jobUrl: String,
  applicationDate: { type: Date, required: true },
  status: { type: String, default: 'Applied' },
  resumeVersion: String,
  location: String,
  salaryRange: String,
  jobType: String,
  priority: { type: String, default: 'Medium' },
  followUpDate: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  company: String,
  position: String,
  linkedinUrl: String,
  email: String,
  phone: String,
  relationship: { type: String, default: 'Network Contact' },
  status: { type: String, default: 'Not Contacted' },
  lastContactDate: Date,
  nextFollowUpDate: Date,
  tags: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: String,
  description: String,
  fileName: String,
  fileSize: Number,
  fileData: String, // Base64 encoded file
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Application = mongoose.model('Application', applicationSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Resume = mongoose.model('Resume', resumeSchema);

// Simple authentication middleware (you should use proper JWT in production)
const auth = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'No user ID provided' });
    }
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: '1.0.0'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Applications CRUD
app.get('/api/applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/applications', auth, async (req, res) => {
  try {
    const application = new Application({
      ...req.body,
      userId: req.userId
    });
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/applications/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/applications/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Contacts CRUD
app.get('/api/contacts', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contacts', auth, async (req, res) => {
  try {
    const contact = new Contact({
      ...req.body,
      userId: req.userId
    });
    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/contacts/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/contacts/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Resumes CRUD
app.get('/api/resumes', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/resumes', auth, async (req, res) => {
  try {
    const resume = new Resume({
      ...req.body,
      userId: req.userId
    });
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/resumes/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk sync endpoint
app.post('/api/sync', auth, async (req, res) => {
  try {
    const { applications, contacts, resumes } = req.body;
    
    // Clear existing data for this user
    await Application.deleteMany({ userId: req.userId });
    await Contact.deleteMany({ userId: req.userId });
    await Resume.deleteMany({ userId: req.userId });
    
    // Insert new data
    if (applications && applications.length > 0) {
      const appsWithUserId = applications.map(app => ({ ...app, userId: req.userId }));
      await Application.insertMany(appsWithUserId);
    }
    
    if (contacts && contacts.length > 0) {
      const contactsWithUserId = contacts.map(contact => ({ ...contact, userId: req.userId }));
      await Contact.insertMany(contactsWithUserId);
    }
    
    if (resumes && resumes.length > 0) {
      const resumesWithUserId = resumes.map(resume => ({ ...resume, userId: req.userId }));
      await Resume.insertMany(resumesWithUserId);
    }
    
    res.json({ message: 'Data synced successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all data for a user
app.get('/api/sync', auth, async (req, res) => {
  try {
    const [applications, contacts, resumes] = await Promise.all([
      Application.find({ userId: req.userId }),
      Contact.find({ userId: req.userId }),
      Resume.find({ userId: req.userId })
    ]);
    
    res.json({
      applications,
      contacts,
      resumes,
      lastSync: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User registration (simplified)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user (in production, hash the password)
    const user = new User({ email, password, name });
    await user.save();
    
    res.status(201).json({ 
      userId: user._id, 
      email: user.email, 
      name: user.name,
      message: 'User created successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login (simplified)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      userId: user._id, 
      email: user.email, 
      name: user.name,
      message: 'Login successful' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});