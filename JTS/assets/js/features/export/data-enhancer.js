// Data enhancement utilities for export functionality

const DataEnhancer = {
  // Enhanced application data with calculated metrics
  enhanceApplicationData(applications) {
    return applications.map((app, index) => {
      const applicationDate = new Date(app.applicationDate);
      const daysSinceApplication = Math.floor((new Date() - applicationDate) / (1000 * 60 * 60 * 24));
      const status = app.status || 'Applied';
      const priority = app.priority || 'Medium';
      
      return {
        'ID': index + 1,
        'Application Date': applicationDate.toLocaleDateString(),
        'Job Title': app.jobTitle || '',
        'Company': app.company || '',
        'Job Portal': app.jobPortal || 'Other',
        'Location': app.location || 'Remote/Not Specified',
        'Job Type': app.jobType || 'Full-time',
        'Status': status,
        'Priority': priority,
        'Salary Range': app.salaryRange || 'Not Disclosed',
        'Resume Version': app.resumeVersion || 'Standard',
        'Follow-up Date': app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : 'None',
        'Days Since Application': daysSinceApplication,
        'Response Time Category': daysSinceApplication < 7 ? 'Recent' : daysSinceApplication < 30 ? 'Pending' : 'Long-term',
        'Job URL': app.jobUrl || '',
        'Notes': app.notes || '',
        'Date Added': new Date(app.dateAdded || app.applicationDate).toLocaleDateString()
      };
    });
  },

  // Enhanced contact data with relationship tracking
  enhanceContactData(contacts) {
    return contacts.map((contact, index) => ({
      'ID': index + 1,
      'Contact Name': contact.name || '',
      'Company': contact.company || 'Independent',
      'Position/Title': contact.position || 'Not Specified',
      'Relationship Type': contact.relationship || 'Network Contact',
      'Contact Status': contact.contactStatus || contact.status || 'Not Contacted',
      'Email Address': contact.email || '',
      'Phone Number': contact.phone || '',
      'LinkedIn Profile': contact.linkedinUrl || '',
      'Last Contact Date': contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : 'Never',
      'Next Follow-up': contact.nextFollowUpDate ? new Date(contact.nextFollowUpDate).toLocaleDateString() : 'None Scheduled',
      'Contact Priority': contact.priority || 'Medium',
      'Tags/Categories': contact.tags || '',
      'Interaction Notes': contact.notes || '',
      'Date Added': new Date(contact.dateAdded || Date.now()).toLocaleDateString(),
      'Contact Value': contact.relationship === 'Recruiter' ? 'High' : contact.relationship === 'Hiring Manager' ? 'High' : 'Medium'
    }));
  },

  // Enhanced resume data
  enhanceResumeData(resumes) {
    return resumes.map(resume => ({
      'Name': resume.name,
      'Version': resume.version,
      'File Name': resume.fileName,
      'File Size': resume.fileSize,
      'Upload Date': new Date(resume.uploadDate || Date.now()).toLocaleDateString(),
      'Description': resume.description || 'No description',
      'Usage Count': resume.usageCount || 0,
      'Last Used': resume.lastUsed ? new Date(resume.lastUsed).toLocaleDateString() : 'Never'
    }));
  }
};

// Export for use in other modules
window.DataEnhancer = DataEnhancer;