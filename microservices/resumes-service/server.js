require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// In-memory store for resume metadata (in production, use a database)
let resumes = [];

// GET all resumes
app.get('/api/resumes', (req, res) => {
  const responseData = resumes.map(resume => {
    const { filePath, ...data } = resume;
    return data;
  });
  res.json(responseData);
});

// POST upload resume
app.post('/api/resumes', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { name, version } = req.body;
    
    if (!name || !version) {
      return res.status(400).json({ error: 'Name and version are required' });
    }
    
    // Check for duplicate names
    if (resumes.some(resume => resume.name.toLowerCase() === name.toLowerCase())) {
      // Delete uploaded file since we're rejecting it
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'A resume with this name already exists' });
    }
    
    const resumeData = {
      id: Date.now() + Math.random(),
      name: name.trim(),
      version: version.trim(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      uploadDate: new Date().toISOString(),
      isDefault: resumes.length === 0
    };
    
    resumes.push(resumeData);
    
    // Return resume data without internal file path
    const { filePath, ...responseData } = resumeData;
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// GET download resume
app.get('/api/resumes/:id/download', (req, res) => {
  const id = parseFloat(req.params.id);
  const resume = resumes.find(r => r.id === id);
  
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  
  const filePath = resume.filePath;
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  
  res.download(filePath, resume.fileName);
});

// PUT set default resume
app.put('/api/resumes/:id/default', (req, res) => {
  const id = parseFloat(req.params.id);
  const resume = resumes.find(r => r.id === id);
  
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  
  // Remove default from all resumes
  resumes.forEach(r => { r.isDefault = false; });
  
  // Set new default
  resume.isDefault = true;
  
  const { filePath, ...responseData } = resume;
  res.json(responseData);
});

// DELETE resume
app.delete('/api/resumes/:id', (req, res) => {
  const id = parseFloat(req.params.id);
  const index = resumes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  
  const deletedResume = resumes[index];
  
  // Delete file from disk
  if (fs.existsSync(deletedResume.filePath)) {
    fs.unlinkSync(deletedResume.filePath);
  }
  
  // Remove from array
  resumes.splice(index, 1);
  
  // If deleted resume was default and there are other resumes, set first one as default
  if (deletedResume.isDefault && resumes.length > 0) {
    resumes[0].isDefault = true;
  }
  
  res.json({ message: 'Resume deleted successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    service: 'resumes-service',
    resumeCount: resumes.length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => {
  console.log(`Resumes Service running on port ${PORT}`);
});
