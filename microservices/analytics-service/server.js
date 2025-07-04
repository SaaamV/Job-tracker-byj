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

// GET analytics overview
app.get('/api/analytics/overview', async (req, res) => {
  try {
    // Fetch data from other services
    const [applicationsResponse, contactsResponse] = await Promise.all([
      axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`),
      axios.get(`${CONTACTS_SERVICE_URL}/api/contacts`)
    ]);
    
    const applications = applicationsResponse.data;
    const contacts = contactsResponse.data;
    
    // Calculate metrics
    const totalApps = applications.length;
    const interviewStatuses = ['Phone Screen', 'Interview Scheduled', 'Final Interview', 'Technical Assessment'];
    const interviewApps = applications.filter(app => interviewStatuses.includes(app.status)).length;
    const responseStatuses = ['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer', 'Rejected', 'Technical Assessment'];
    const responseApps = applications.filter(app => responseStatuses.includes(app.status)).length;
    const offerApps = applications.filter(app => app.status === 'Offer').length;
    
    const avgResponseTime = calculateAverageResponseTime(applications);
    const pendingFollowUps = calculatePendingFollowUps(applications, contacts);
    
    const overview = {
      totalApps,
      interviewRate: totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) : 0,
      responseRate: totalApps > 0 ? Math.round((responseApps / totalApps) * 100) : 0,
      offerRate: totalApps > 0 ? Math.round((offerApps / totalApps) * 100) : 0,
      avgResponseTime,
      pendingFollowUps,
      totalContacts: contacts.length
    };
    
    res.json(overview);
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET status distribution
app.get('/api/analytics/status-distribution', async (req, res) => {
  try {
    const applicationsResponse = await axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`);
    const applications = applicationsResponse.data;
    
    const statusCounts = {};
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    res.json(statusCounts);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ error: 'Failed to fetch status distribution' });
  }
});

// GET application timeline
app.get('/api/analytics/timeline', async (req, res) => {
  try {
    const applicationsResponse = await axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`);
    const applications = applicationsResponse.data;
    
    const monthCounts = {};
    applications.forEach(app => {
      const month = new Date(app.applicationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthCounts).sort((a, b) => 
      new Date(a + ' 1') - new Date(b + ' 1')
    );
    
    const timeline = sortedMonths.map(month => ({
      month,
      count: monthCounts[month]
    }));
    
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// GET portal analysis
app.get('/api/analytics/portals', async (req, res) => {
  try {
    const applicationsResponse = await axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`);
    const applications = applicationsResponse.data;
    
    const portalCounts = {};
    const portalSuccess = {};
    
    applications.forEach(app => {
      if (app.jobPortal) {
        portalCounts[app.jobPortal] = (portalCounts[app.jobPortal] || 0) + 1;
        
        if (!portalSuccess[app.jobPortal]) {
          portalSuccess[app.jobPortal] = { total: 0, responses: 0 };
        }
        
        portalSuccess[app.jobPortal].total++;
        
        if (['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer'].includes(app.status)) {
          portalSuccess[app.jobPortal].responses++;
        }
      }
    });
    
    const successRates = Object.keys(portalSuccess).map(portal => ({
      portal,
      count: portalCounts[portal],
      successRate: portalSuccess[portal].total > 0 ? 
        Math.round((portalSuccess[portal].responses / portalSuccess[portal].total) * 100) : 0
    }));
    
    res.json({
      counts: portalCounts,
      successRates
    });
  } catch (error) {
    console.error('Error fetching portal analysis:', error);
    res.status(500).json({ error: 'Failed to fetch portal analysis' });
  }
});

// Helper functions
function calculateAverageResponseTime(applications) {
  const responsedApps = applications.filter(app => 
    app.status !== 'Applied' && app.status !== 'Withdrawn' && app.status !== 'On Hold'
  );
  
  if (responsedApps.length === 0) return 0;
  
  const totalDays = responsedApps.reduce((sum, app) => {
    const daysDiff = Math.floor(
      (new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24)
    );
    return sum + daysDiff;
  }, 0);
  
  return Math.round(totalDays / responsedApps.length);
}

function calculatePendingFollowUps(applications, contacts) {
  const today = new Date().toISOString().split('T')[0];
  
  const appFollowUps = applications.filter(app => 
    app.followUpDate && app.followUpDate <= today && 
    !['Offer', 'Rejected', 'Withdrawn'].includes(app.status)
  ).length;
  
  const contactFollowUps = contacts.filter(contact => 
    contact.nextFollowUpDate && contact.nextFollowUpDate <= today
  ).length;
  
  return appFollowUps + contactFollowUps;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    service: 'analytics-service'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Analytics service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});
