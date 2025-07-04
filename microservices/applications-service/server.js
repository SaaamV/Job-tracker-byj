require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const applicationsRouter = require('./routes/applications');

const app = express();
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/applications', applicationsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'applications-service' });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Applications Service running on port ${PORT}`);
});
