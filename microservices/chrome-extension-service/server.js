require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Service URLs
const APPLICATIONS_SERVICE_URL = process.env.APPLICATIONS_SERVICE_URL || 'http://localhost:4001';
const CONTACTS_SERVICE_URL = process.env.CONTACTS_SERVICE_URL || 'http://localhost:4002';

// Chrome extension specific endpoints

// POST Quick save application from extension
app.post('/api/chrome-extension/quick-save', async (req, res) => {
  try {
    const { jobData, source } = req.body;
    
    // Validate required fields
    if (!jobData.jobTitle || !jobData.company) {
      return res.status(400).json({ error: 'Job title and company are required' });
    }
    
    // Format application data
    const applicationData = {
      jobTitle: jobData.jobTitle,
      company: jobData.company,
      jobPortal: source || 'Web Extension',
      jobUrl: jobData.jobUrl || '',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      location: jobData.location || '',
      salaryRange: jobData.salaryRange || '',
      jobType: jobData.jobType || '',
      priority: 'Medium',
      notes: `Saved from ${source || 'extension'} on ${new Date().toLocaleDateString()}`,
      dateAdded: new Date().toISOString()
    };
    
    // Save to applications service
    const response = await axios.post(`${APPLICATIONS_SERVICE_URL}/api/applications`, applicationData);
    
    res.status(201).json({
      success: true,
      message: 'Application saved successfully',
      data: response.data
    });
    
  } catch (error) {
    console.error('Error in quick save:', error);
    res.status(500).json({ 
      error: 'Failed to save application',
      details: error.message 
    });
  }
});

// GET Extension data summary
app.get('/api/chrome-extension/summary', async (req, res) => {
  try {
    const [applicationsResponse, contactsResponse] = await Promise.all([
      axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`),
      axios.get(`${CONTACTS_SERVICE_URL}/api/contacts`)
    ]);
    
    const applications = applicationsResponse.data;
    const contacts = contactsResponse.data;
    
    // Recent applications (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentApps = applications.filter(app => 
      new Date(app.dateAdded || app.applicationDate) > oneWeekAgo
    );
    
    // Pending follow-ups
    const today = new Date().toISOString().split('T')[0];
    const pendingFollowUps = applications.filter(app => 
      app.followUpDate && app.followUpDate <= today && 
      !['Offer', 'Rejected', 'Withdrawn'].includes(app.status)
    );
    
    const summary = {
      totalApplications: applications.length,
      recentApplications: recentApps.length,
      pendingFollowUps: pendingFollowUps.length,
      totalContacts: contacts.length,
      statusBreakdown: {
        applied: applications.filter(app => app.status === 'Applied').length,
        interview: applications.filter(app => ['Phone Screen', 'Interview Scheduled', 'Final Interview'].includes(app.status)).length,
        offer: applications.filter(app => app.status === 'Offer').length,
        rejected: applications.filter(app => app.status === 'Rejected').length
      },
      recentApplicationsList: recentApps.slice(0, 5).map(app => ({
        id: app._id,
        jobTitle: app.jobTitle,
        company: app.company,
        status: app.status,
        dateAdded: app.dateAdded || app.applicationDate
      }))
    };
    
    res.json(summary);
    
  } catch (error) {
    console.error('Error fetching extension summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST Job site detection and data extraction
app.post('/api/chrome-extension/extract-job-data', async (req, res) => {
  try {
    const { url, pageContent, source } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Extract job data based on source
    let extractedData = {};
    
    switch (source) {
      case 'linkedin':
        extractedData = extractLinkedInJobData(pageContent, url);
        break;
      case 'indeed':
        extractedData = extractIndeedJobData(pageContent, url);
        break;
      case 'glassdoor':
        extractedData = extractGlassdoorJobData(pageContent, url);
        break;
      default:
        extractedData = extractGenericJobData(pageContent, url);
    }
    
    res.json({
      success: true,
      data: extractedData,
      source: source
    });
    
  } catch (error) {
    console.error('Error extracting job data:', error);
    res.status(500).json({ error: 'Failed to extract job data' });
  }
});

// GET Health check for extension
app.get('/api/chrome-extension/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'chrome-extension-service',
    features: [
      'quick-save',
      'job-extraction',
      'summary-data'
    ]
  });
});

// Helper functions for job data extraction
function extractLinkedInJobData(pageContent, url) {
  // Basic extraction logic for LinkedIn
  // In a real implementation, you'd parse the HTML content
  return {
    jobTitle: 'Job Title', // Extract from page
    company: 'Company Name', // Extract from page
    location: 'Location', // Extract from page
    jobUrl: url,
    source: 'LinkedIn'
  };
}

function extractIndeedJobData(pageContent, url) {
  // Basic extraction logic for Indeed
  return {
    jobTitle: 'Job Title',
    company: 'Company Name',
    location: 'Location',
    jobUrl: url,
    source: 'Indeed'
  };
}

function extractGlassdoorJobData(pageContent, url) {
  // Basic extraction logic for Glassdoor
  return {
    jobTitle: 'Job Title',
    company: 'Company Name',
    location: 'Location',
    jobUrl: url,
    source: 'Glassdoor'
  };
}

function extractGenericJobData(pageContent, url) {
  // Generic extraction for unknown job sites
  return {
    jobTitle: '',
    company: '',
    location: '',
    jobUrl: url,
    source: 'Unknown'
  };
}

// POST Notification to frontend
app.post('/api/chrome-extension/notify-frontend', async (req, res) => {
  try {
    const { type, data, frontendUrl } = req.body;
    
    // This would typically use WebSockets or Server-Sent Events
    // For now, we'll just log and return success
    console.log(`📡 Extension notification: ${type}`, data);
    
    res.json({
      success: true,
      message: 'Notification processed'
    });
    
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({ error: 'Failed to process notification' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Chrome extension service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4007;
app.listen(PORT, () => {
  console.log(`Chrome Extension Service running on port ${PORT}`);
});