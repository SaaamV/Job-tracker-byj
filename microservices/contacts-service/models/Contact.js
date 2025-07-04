const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  // Define your schema fields here
  // Example:
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  dateAdded: { type: Date, default: Date.now },
  // ... add other fields as needed
});

module.exports = mongoose.model('Contact', ContactSchema);
