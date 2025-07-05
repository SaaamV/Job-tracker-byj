require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const applicationsRouter = require('./routes/applications');

const app = express();
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON');
    return res.status(400).send({ error: 'Invalid JSON' });
  }
  next();
});

connectDB();

app.get('/api/applications/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'applications-service' });
});

app.use('/api/applications', applicationsRouter);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Applications Service running on port ${PORT}`);
});
