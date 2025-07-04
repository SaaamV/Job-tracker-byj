// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the jobtracker database
db = db.getSiblingDB('jobtracker');

// Create collections
db.createCollection('applications');
db.createCollection('contacts');

// Create indexes for better performance
db.applications.createIndex({ "dateAdded": -1 });
db.applications.createIndex({ "status": 1 });
db.applications.createIndex({ "company": 1 });
db.applications.createIndex({ "applicationDate": -1 });

db.contacts.createIndex({ "dateAdded": -1 });
db.contacts.createIndex({ "company": 1 });
db.contacts.createIndex({ "name": 1 });

// Insert sample data for testing
db.applications.insertMany([
  {
    jobTitle: "Senior Software Engineer",
    company: "TechCorp Inc",
    jobPortal: "LinkedIn",
    jobUrl: "https://linkedin.com/jobs/sample1",
    applicationDate: new Date("2024-01-15"),
    status: "Applied",
    resumeVersion: "Senior Dev Resume v2.1",
    location: "San Francisco, CA",
    salaryRange: "$120,000 - $150,000",
    jobType: "Full-time",
    priority: "High",
    followUpDate: new Date("2024-01-29"),
    notes: "Great company culture, matches my experience perfectly",
    dateAdded: new Date()
  },
  {
    jobTitle: "Full Stack Developer",
    company: "StartupXYZ",
    jobPortal: "Indeed",
    jobUrl: "https://indeed.com/jobs/sample2",
    applicationDate: new Date("2024-01-10"),
    status: "Interview Scheduled",
    resumeVersion: "Full Stack Resume v1.3",
    location: "Austin, TX",
    salaryRange: "$90,000 - $110,000",
    jobType: "Full-time",
    priority: "Medium",
    followUpDate: new Date("2024-01-25"),
    notes: "Technical interview scheduled for next week",
    dateAdded: new Date()
  },
  {
    jobTitle: "Product Manager",
    company: "InnovateLabs",
    jobPortal: "Glassdoor",
    jobUrl: "https://glassdoor.com/jobs/sample3",
    applicationDate: new Date("2024-01-05"),
    status: "Under Review",
    resumeVersion: "PM Resume v1.0",
    location: "New York, NY",
    salaryRange: "$130,000 - $160,000",
    jobType: "Full-time",
    priority: "High",
    followUpDate: new Date("2024-01-20"),
    notes: "Product role focusing on AI/ML products",
    dateAdded: new Date()
  }
]);

db.contacts.insertMany([
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1-555-0123",
    company: "TechCorp Inc",
    position: "Engineering Manager",
    linkedinProfile: "https://linkedin.com/in/sarahjohnson",
    notes: "Met at TechConf 2023, very helpful with company insights",
    lastContactDate: new Date("2024-01-10"),
    nextFollowUpDate: new Date("2024-02-10"),
    tags: ["engineering", "manager", "techcorp"],
    dateAdded: new Date()
  },
  {
    name: "Mike Chen",
    email: "mike.chen@startupxyz.com",
    phone: "+1-555-0124",
    company: "StartupXYZ",
    position: "CTO",
    linkedinProfile: "https://linkedin.com/in/mikechen",
    notes: "Former colleague, referred me for the Full Stack position",
    lastContactDate: new Date("2024-01-08"),
    nextFollowUpDate: new Date("2024-01-22"),
    tags: ["cto", "referral", "startup"],
    dateAdded: new Date()
  }
]);

print("Database initialized with sample data");
print("Collections created: applications, contacts");
print("Indexes created for performance optimization");
print("Sample applications inserted: " + db.applications.countDocuments());
print("Sample contacts inserted: " + db.contacts.countDocuments());