const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // Define your schema fields here
  // Example:
  position: { type: String, required: true },
  company: { type: String, required: true },
  status: { type: String, default: 'applied' },
  dateAdded: { type: Date, default: Date.now },
  // ... add other fields as needed
});

module.exports = mongoose.model('Application', ApplicationSchema);
