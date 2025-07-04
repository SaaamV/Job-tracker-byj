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

// GET Export applications as CSV
app.get('/api/export/applications/csv', async (req, res) => {
  try {
    const response = await axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`);
    const applications = response.data;
    
    // Create CSV content
    const headers = ['Date', 'Job Title', 'Company', 'Status', 'Location', 'Salary Range', 'Job Portal', 'Priority', 'Follow Up Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.applicationDate || '',
        `"${app.jobTitle || ''}"`,
        `"${app.company || ''}"`,
        app.status || '',
        `"${app.location || ''}"`,
        `"${app.salaryRange || ''}"`,
        app.jobPortal || '',
        app.priority || '',
        app.followUpDate || '',
        `"${app.notes || ''}"`
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="job_applications.csv"');
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting applications:', error);
    res.status(500).json({ error: 'Failed to export applications' });
  }
});

// GET Export contacts as CSV
app.get('/api/export/contacts/csv', async (req, res) => {
  try {
    const response = await axios.get(`${CONTACTS_SERVICE_URL}/api/contacts`);
    const contacts = response.data;
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'LinkedIn', 'Notes', 'Last Contact', 'Next Follow Up'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.name || ''}"`,
        contact.email || '',
        contact.phone || '',
        `"${contact.company || ''}"`,
        `"${contact.position || ''}"`,
        contact.linkedinProfile || '',
        `"${contact.notes || ''}"`,
        contact.lastContactDate || '',
        contact.nextFollowUpDate || ''
      ].join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

// GET Export applications as JSON
app.get('/api/export/applications/json', async (req, res) => {
  try {
    const response = await axios.get(`${APPLICATIONS_SERVICE_URL}/api/applications`);
    const applications = response.data;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="job_applications.json"');
    res.json({
      exportDate: new Date().toISOString(),
      totalApplications: applications.length,
      applications: applications
    });
    
  } catch (error) {
    console.error('Error exporting applications as JSON:', error);
    res.status(500).json({ error: 'Failed to export applications' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    service: 'export-service'
  });
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, () => {
  console.log(`Export Service running on port ${PORT}`);
});
