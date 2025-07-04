require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory store for templates (in production, use a database)
let templates = [
  {
    id: 1,
    name: 'Software Engineer Template',
    category: 'Technology',
    fields: {
      jobTitle: 'Software Engineer',
      priority: 'High',
      jobType: 'Full-time',
      status: 'Applied'
    },
    description: 'Template for software engineering positions'
  },
  {
    id: 2,
    name: 'Data Scientist Template',
    category: 'Technology',
    fields: {
      jobTitle: 'Data Scientist',
      priority: 'High',
      jobType: 'Full-time',
      status: 'Applied'
    },
    description: 'Template for data science positions'
  },
  {
    id: 3,
    name: 'Product Manager Template',
    category: 'Product',
    fields: {
      jobTitle: 'Product Manager',
      priority: 'Medium',
      jobType: 'Full-time',
      status: 'Applied'
    },
    description: 'Template for product management roles'
  }
];

// GET all templates
app.get('/api/templates', (req, res) => {
  const { category } = req.query;
  
  let filteredTemplates = templates;
  
  if (category) {
    filteredTemplates = templates.filter(template => 
      template.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  res.json(filteredTemplates);
});

// GET template by ID
app.get('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const template = templates.find(t => t.id === id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

// POST create new template
app.post('/api/templates', (req, res) => {
  const { name, category, fields, description } = req.body;
  
  if (!name || !category || !fields) {
    return res.status(400).json({ error: 'Name, category, and fields are required' });
  }
  
  const newTemplate = {
    id: Math.max(...templates.map(t => t.id)) + 1,
    name: name.trim(),
    category: category.trim(),
    fields,
    description: description?.trim() || '',
    createdAt: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  
  res.status(201).json(newTemplate);
});

// PUT update template
app.put('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const templateIndex = templates.findIndex(t => t.id === id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  const { name, category, fields, description } = req.body;
  
  templates[templateIndex] = {
    ...templates[templateIndex],
    ...(name && { name: name.trim() }),
    ...(category && { category: category.trim() }),
    ...(fields && { fields }),
    ...(description !== undefined && { description: description.trim() }),
    updatedAt: new Date().toISOString()
  };
  
  res.json(templates[templateIndex]);
});

// DELETE template
app.delete('/api/templates/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const templateIndex = templates.findIndex(t => t.id === id);
  
  if (templateIndex === -1) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  templates.splice(templateIndex, 1);
  
  res.json({ message: 'Template deleted successfully' });
});

// GET template categories
app.get('/api/templates/categories', (req, res) => {
  const categories = [...new Set(templates.map(t => t.category))];
  res.json(categories);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    service: 'templates-service',
    templateCount: templates.length
  });
});

const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`Templates Service running on port ${PORT}`);
});
