// export.js - Enhanced export functionality

function exportToExcel() {
  try {
    if (typeof XLSX === 'undefined') {
      showMessage('Excel export library not loaded. Please refresh the page.', 'error');
      return;
    }

    const wb = XLSX.utils.book_new();
    
    // Get data from global state
    const currentApplications = window.jobTracker?.applications || window.applications || [];
    const currentContacts = window.jobTracker?.contacts || window.contacts || [];
    const currentResumes = window.jobTracker?.resumes || window.resumes || [];
    
    console.log('Export data:', { 
      applications: currentApplications.length, 
      contacts: currentContacts.length,
      resumes: currentResumes.length 
    });
    
    if (currentApplications.length === 0 && currentContacts.length === 0) {
      showMessage('No data to export. Please add some applications or contacts first.', 'error');
      return;
    }
    
    // Professional Applications sheet with enhanced data and calculated metrics
    const enhancedApplications = currentApplications.map((app, index) => {
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
  
  // Professional Contacts sheet with relationship tracking
  const enhancedContacts = currentContacts.map((contact, index) => ({
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
  
  // Professional Analytics and Summary Report
  const stats = calculateProfessionalStats(currentApplications, currentContacts);
  const analyticsData = [
    { 'Report Section': 'OVERVIEW', 'Metric': 'Total Applications Submitted', 'Value': stats.totalApplications, 'Benchmark': 'Industry Average: 50-100' },
    { 'Report Section': 'OVERVIEW', 'Metric': 'Total Professional Contacts', 'Value': stats.totalContacts, 'Benchmark': 'Recommended: 20+' },
    { 'Report Section': 'OVERVIEW', 'Metric': 'Total Resume Versions', 'Value': stats.totalResumes, 'Benchmark': 'Recommended: 2-3' },
    { 'Report Section': 'OVERVIEW', 'Metric': 'Report Generation Date', 'Value': new Date().toLocaleDateString(), 'Benchmark': 'Current' },
    { 'Report Section': 'PERFORMANCE', 'Metric': 'Interview Rate (%)', 'Value': stats.interviewRate + '%', 'Benchmark': 'Industry Average: 10-20%' },
    { 'Report Section': 'PERFORMANCE', 'Metric': 'Response Rate (%)', 'Value': stats.responseRate + '%', 'Benchmark': 'Industry Average: 25-35%' },
    { 'Report Section': 'PERFORMANCE', 'Metric': 'Offer Rate (%)', 'Value': stats.offerRate + '%', 'Benchmark': 'Industry Average: 2-5%' },
    { 'Report Section': 'PERFORMANCE', 'Metric': 'Average Response Time (Days)', 'Value': stats.avgResponseTime, 'Benchmark': 'Industry Average: 14-21 days' },
    { 'Report Section': 'ACTIVITY', 'Metric': 'Applications This Month', 'Value': stats.thisMonth, 'Benchmark': 'Recommended: 10-15/month' },
    { 'Report Section': 'ACTIVITY', 'Metric': 'Applications Last 7 Days', 'Value': stats.lastWeek, 'Benchmark': 'Recommended: 2-4/week' },
    { 'Report Section': 'PIPELINE', 'Metric': 'Active Applications', 'Value': stats.activeApplications, 'Benchmark': 'Monitor Progress' },
    { 'Report Section': 'PIPELINE', 'Metric': 'Pending Follow-ups', 'Value': stats.pendingFollowups, 'Benchmark': 'Take Action Soon' },
    { 'Report Section': 'NETWORK', 'Metric': 'High-Value Contacts', 'Value': stats.highValueContacts, 'Benchmark': 'Leverage Network' },
    { 'Report Section': 'NETWORK', 'Metric': 'Recent Contact Activity', 'Value': stats.recentContactActivity, 'Benchmark': 'Stay Engaged' }
  ];
  
  // Resumes sheet  
  const enhancedResumes = currentResumes.map(resume => ({
    'Name': resume.name,
    'Version': resume.version,
    'File Name': resume.fileName,
    'File Size': resume.fileSize,
    'File Type': resume.fileType,
    'Is Default': resume.isDefault ? 'Yes' : 'No',
    'Upload Date': new Date(resume.uploadDate || resume.createdAt).toLocaleDateString()
  }));

  // Add sheets to workbook
  const appWs = XLSX.utils.json_to_sheet(enhancedApplications);
  const contactWs = XLSX.utils.json_to_sheet(enhancedContacts);
  const resumeWs = XLSX.utils.json_to_sheet(enhancedResumes);
  const analyticsWs = XLSX.utils.json_to_sheet(analyticsData);
  
  XLSX.utils.book_append_sheet(wb, appWs, "Applications");
  XLSX.utils.book_append_sheet(wb, contactWs, "Contacts");
  XLSX.utils.book_append_sheet(wb, resumeWs, "Resumes");
  XLSX.utils.book_append_sheet(wb, analyticsWs, "Analytics");
  
  // Add conditional formatting and styling
  addExcelStyling(wb);
  
  // Save file
  XLSX.writeFile(wb, `Job_Tracker_Complete_${new Date().toISOString().split('T')[0]}.xlsx`);
  showMessage('Complete data exported to Excel successfully!', 'success');
  
  } catch (error) {
    console.error('Export to Excel failed:', error);
    showMessage('Failed to export to Excel. Please try again.', 'error');
  }
}

function addExcelStyling(workbook) {
  // Add some basic styling to make the Excel more readable
  // This is a simplified version - full styling would require additional libraries
  
  // Set column widths for Applications sheet
  if (workbook.Sheets['Applications']) {
    const ws = workbook.Sheets['Applications'];
    ws['!cols'] = [
      { wch: 12 }, // Application Date
      { wch: 25 }, // Job Title
      { wch: 20 }, // Company
      { wch: 15 }, // Job Portal
      { wch: 40 }, // Job URL
      { wch: 15 }, // Status
      { wch: 20 }, // Resume Version
      { wch: 20 }, // Location
      { wch: 15 }, // Salary Range
      { wch: 12 }, // Job Type
      { wch: 10 }, // Priority
      { wch: 12 }, // Follow-up Date
      { wch: 30 }, // Notes
      { wch: 12 }, // Date Added
      { wch: 15 }  // Days Since Application
    ];
  }
  
  // Set column widths for Contacts sheet
  if (workbook.Sheets['Contacts']) {
    const ws = workbook.Sheets['Contacts'];
    ws['!cols'] = [
      { wch: 20 }, // Name
      { wch: 20 }, // Company
      { wch: 20 }, // Position
      { wch: 40 }, // LinkedIn URL
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // Relationship
      { wch: 15 }, // Status
      { wch: 15 }, // Last Contact Date
      { wch: 15 }, // Next Follow-up Date
      { wch: 20 }, // Tags
      { wch: 30 }, // Notes
      { wch: 12 }  // Date Added
    ];
  }
}

function exportReport() {
  const totalApps = applications.length;
  const analytics = getDetailedAnalytics();
  
  const reportData = [{
    'Report Generated': new Date().toLocaleDateString(),
    'Total Applications': totalApps,
    'Total Contacts': contacts.length,
    'Interview Rate': analytics.performance?.interviewRate + '%' || '0%',
    'Response Rate': calculateResponseRate() + '%',
    'Offer Rate': analytics.performance?.offerRate + '%' || '0%',
    'Applications Last 30 Days': analytics.trends?.last30Days || 0,
    'Most Active Portal': getMostSuccessfulPortal(),
    'Pending Follow-ups': calculatePendingFollowUps()
  }];

  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const reportWs = XLSX.utils.json_to_sheet(reportData);
  
  // Detailed applications
  const appWs = XLSX.utils.json_to_sheet(applications);
  
  // Detailed contacts
  const contactWs = XLSX.utils.json_to_sheet(contacts);
  
  // Status breakdown
  const statusBreakdown = {};
  applications.forEach(app => {
    statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
  });
  const statusData = Object.entries(statusBreakdown).map(([status, count]) => ({
    'Status': status,
    'Count': count,
    'Percentage': Math.round((count / totalApps) * 100) + '%'
  }));
  const statusWs = XLSX.utils.json_to_sheet(statusData);
  
  // Portal performance
  const portalPerformance = calculatePortalPerformance();
  const portalWs = XLSX.utils.json_to_sheet(portalPerformance);
  
  XLSX.utils.book_append_sheet(wb, reportWs, "Executive Summary");
  XLSX.utils.book_append_sheet(wb, statusWs, "Status Breakdown");
  XLSX.utils.book_append_sheet(wb, portalWs, "Portal Performance");
  XLSX.utils.book_append_sheet(wb, appWs, "All Applications");
  XLSX.utils.book_append_sheet(wb, contactWs, "All Contacts");

  XLSX.writeFile(wb, `Job_Search_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  showMessage('Comprehensive report generated successfully!', 'success');
}

function calculatePortalPerformance() {
  const portalStats = {};
  
  applications.forEach(app => {
    if (!app.jobPortal) return;
    
    if (!portalStats[app.jobPortal]) {
      portalStats[app.jobPortal] = {
        portal: app.jobPortal,
        applications: 0,
        responses: 0,
        interviews: 0,
        offers: 0
      };
    }
    
    portalStats[app.jobPortal].applications++;
    
    if (['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer', 'Rejected'].includes(app.status)) {
      portalStats[app.jobPortal].responses++;
    }
    
    if (['Phone Screen', 'Interview Scheduled', 'Final Interview'].includes(app.status)) {
      portalStats[app.jobPortal].interviews++;
    }
    
    if (app.status === 'Offer') {
      portalStats[app.jobPortal].offers++;
    }
  });
  
  return Object.values(portalStats).map(stat => ({
    'Portal': stat.portal,
    'Applications': stat.applications,
    'Responses': stat.responses,
    'Response Rate': stat.applications > 0 ? Math.round((stat.responses / stat.applications) * 100) + '%' : '0%',
    'Interviews': stat.interviews,
    'Interview Rate': stat.applications > 0 ? Math.round((stat.interviews / stat.applications) * 100) + '%' : '0%',
    'Offers': stat.offers,
    'Offer Rate': stat.applications > 0 ? Math.round((stat.offers / stat.applications) * 100) + '%' : '0%'
  }));
}

function importData() {
  const file = document.getElementById('importFile').files[0];
  const replaceData = document.getElementById('replaceData').checked;
  
  if (!file) {
    showMessage('Please select a file to import', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      let importedApps = [];
      let importedContacts = [];
      let importCount = 0;

      // Import Applications
      if (workbook.SheetNames.includes('Applications')) {
        const appSheet = workbook.Sheets['Applications'];
        const rawApps = XLSX.utils.sheet_to_json(appSheet);
        
        importedApps = rawApps.map(app => ({
          id: Date.now() + Math.random(),
          jobTitle: app['Job Title'] || app.jobTitle || '',
          company: app['Company'] || app.company || '',
          jobPortal: app['Job Portal'] || app.jobPortal || '',
          jobUrl: app['Job URL'] || app.jobUrl || '',
          applicationDate: app['Application Date'] || app.applicationDate || new Date().toISOString().split('T')[0],
          status: app['Status'] || app.status || 'Applied',
          resumeVersion: app['Resume Version'] || app.resumeVersion || '',
          location: app['Location'] || app.location || '',
          salaryRange: app['Salary Range'] || app.salaryRange || '',
          jobType: app['Job Type'] || app.jobType || '',
          priority: app['Priority'] || app.priority || 'Medium',
          followUpDate: app['Follow-up Date'] || app.followUpDate || '',
          notes: app['Notes'] || app.notes || '',
          dateAdded: new Date().toISOString()
        }));
        
        importCount += importedApps.length;
      }

      // Import Contacts
      if (workbook.SheetNames.includes('Contacts')) {
        const contactSheet = workbook.Sheets['Contacts'];
        const rawContacts = XLSX.utils.sheet_to_json(contactSheet);
        
        importedContacts = rawContacts.map(contact => ({
          id: Date.now() + Math.random(),
          name: contact['Name'] || contact.name || '',
          company: contact['Company'] || contact.company || '',
          position: contact['Position'] || contact.position || '',
          linkedinUrl: contact['LinkedIn URL'] || contact.linkedinUrl || '',
          email: contact['Email'] || contact.email || '',
          phone: contact['Phone'] || contact.phone || '',
          relationship: contact['Relationship'] || contact.relationship || 'Network Contact',
          status: contact['Status'] || contact.status || 'Not Contacted',
          lastContactDate: contact['Last Contact Date'] || contact.lastContactDate || '',
          nextFollowUpDate: contact['Next Follow-up Date'] || contact.nextFollowUpDate || '',
          tags: contact['Tags'] || contact.tags || '',
          notes: contact['Notes'] || contact.notes || '',
          dateAdded: new Date().toISOString()
        }));
        
        importCount += importedContacts.length;
      }

      if (importCount === 0) {
        showMessage('No valid data found in the file', 'error');
        return;
      }

      // Handle data replacement vs merging
      if (replaceData) {
        applications = importedApps;
        contacts = importedContacts;
        showMessage(`Data replaced successfully! Imported ${importedApps.length} applications and ${importedContacts.length} contacts.`, 'success');
      } else {
        // Merge data, avoiding duplicates
        let addedApps = 0;
        let addedContacts = 0;
        
        importedApps.forEach(importedApp => {
          const exists = applications.some(app => 
            app.jobTitle.toLowerCase() === importedApp.jobTitle.toLowerCase() &&
            app.company.toLowerCase() === importedApp.company.toLowerCase() &&
            app.applicationDate === importedApp.applicationDate
          );
          
          if (!exists) {
            applications.push(importedApp);
            addedApps++;
          }
        });
        
        importedContacts.forEach(importedContact => {
          const exists = contacts.some(contact => 
            contact.name.toLowerCase() === importedContact.name.toLowerCase() &&
            contact.email === importedContact.email
          );
          
          if (!exists) {
            contacts.push(importedContact);
            addedContacts++;
          }
        });
        
        showMessage(`Data merged successfully! Added ${addedApps} new applications and ${addedContacts} new contacts.`, 'success');
      }

      // Save to localStorage and refresh UI
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      localStorage.setItem('jobContacts', JSON.stringify(contacts));

      renderApplications();
      renderContacts();
      updateAnalytics();
      updateResumeDropdown();
      populateEmailContacts();

    } catch (error) {
      console.error('Import failed:', error);
      showMessage('Error importing file. Please make sure it\'s a valid Excel file with the correct format.', 'error');
    }
  };

  reader.readAsArrayBuffer(file);
}

// CSV Export functions
function exportApplicationsToCSV() {
  if (applications.length === 0) {
    showMessage('No applications to export', 'error');
    return;
  }
  
  const csvContent = convertApplicationsToCSV();
  downloadCSV(csvContent, 'applications');
}

function exportContactsToCSV() {
  if (contacts.length === 0) {
    showMessage('No contacts to export', 'error');
    return;
  }
  
  const csvContent = convertContactsToCSV();
  downloadCSV(csvContent, 'contacts');
}

function convertApplicationsToCSV() {
  const headers = [
    'Application Date', 'Job Title', 'Company', 'Job Portal', 'Job URL', 'Status',
    'Resume Version', 'Location', 'Salary Range', 'Job Type', 'Priority',
    'Follow-up Date', 'Notes', 'Date Added', 'Days Since Application'
  ];
  
  const rows = applications.map(app => [
    app.applicationDate,
    app.jobTitle,
    app.company,
    app.jobPortal || '',
    app.jobUrl || '',
    app.status,
    app.resumeVersion || '',
    app.location || '',
    app.salaryRange || '',
    app.jobType || '',
    app.priority,
    app.followUpDate || '',
    app.notes || '',
    formatDate(app.dateAdded),
    Math.floor((new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24))
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function convertContactsToCSV() {
  const headers = [
    'Name', 'Company', 'Position', 'LinkedIn URL', 'Email', 'Phone',
    'Relationship', 'Status', 'Last Contact Date', 'Next Follow-up Date',
    'Tags', 'Notes', 'Date Added'
  ];
  
  const rows = contacts.map(contact => [
    contact.name,
    contact.company || '',
    contact.position || '',
    contact.linkedinUrl || '',
    contact.email || '',
    contact.phone || '',
    contact.relationship,
    contact.status,
    contact.lastContactDate || '',
    contact.nextFollowUpDate || '',
    contact.tags || '',
    contact.notes || '',
    formatDate(contact.dateAdded)
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function downloadCSV(csvContent, type) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `job-tracker-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} exported to CSV successfully!`, 'success');
}

// JSON Export/Import for complete backups
function exportCompleteBackup() {
  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    applications: applications,
    contacts: contacts,
    resumes: resumes || [],
    customTemplates: customTemplates || [],
    settings: {
      autoSyncSetting: localStorage.getItem('autoSyncSetting'),
      googleSheetsId: localStorage.getItem('googleSheetsId'),
      googleSheetsUrl: localStorage.getItem('googleSheetsUrl'),
      jobSearchGoals: localStorage.getItem('jobSearchGoals')
    },
    statistics: getDetailedAnalytics()
  };
  
  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `job-tracker-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showMessage('Complete backup created successfully!', 'success');
}

function importCompleteBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const backupData = JSON.parse(e.target.result);
        
        // Validate backup structure
        if (!backupData.version || !backupData.applications || !backupData.contacts) {
          throw new Error('Invalid backup file format');
        }
        
        const confirmMessage = `This will restore data from ${new Date(backupData.exportDate).toLocaleDateString()}.\n` +
                              `Applications: ${backupData.applications.length}\n` +
                              `Contacts: ${backupData.contacts.length}\n` +
                              `Resumes: ${(backupData.resumes || []).length}\n\n` +
                              `Current data will be replaced. Continue?`;
        
        window.showCustomConfirmDialog(
          'Restore Backup',
          confirmMessage,
          () => {
          // Restore all data
          applications = backupData.applications || [];
          contacts = backupData.contacts || [];
          resumes = backupData.resumes || [];
          customTemplates = backupData.customTemplates || [];
          
          // Save to localStorage
          localStorage.setItem('jobApplications', JSON.stringify(applications));
          localStorage.setItem('jobContacts', JSON.stringify(contacts));
          localStorage.setItem('jobResumes', JSON.stringify(resumes));
          localStorage.setItem('customEmailTemplates', JSON.stringify(customTemplates));
          
          // Restore settings
          if (backupData.settings) {
            Object.keys(backupData.settings).forEach(key => {
              if (backupData.settings[key]) {
                localStorage.setItem(key, backupData.settings[key]);
              }
            });
          }
          
          // Refresh entire UI
          renderApplications();
          renderContacts();
          renderResumes();
          updateResumeDropdown();
          updateAnalytics();
          populateEmailContacts();
          updateTemplateDropdown();
          
          showMessage('Complete backup restored successfully!', 'success');
          
          // Optionally reload page for fresh start
          window.showCustomConfirmDialog(
            'Reload Page',
            'Reload page for complete refresh?',
            () => window.location.reload()
          );
        });
        
      } catch (error) {
        console.error('Restore failed:', error);
        showMessage('Failed to restore backup. Please check the file format.', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Template exports for sharing
function exportEmailTemplates() {
  if (!customTemplates || customTemplates.length === 0) {
    showMessage('No custom email templates to export', 'error');
    return;
  }
  
  const templateData = {
    exportDate: new Date().toISOString(),
    templates: customTemplates
  };
  
  const dataStr = JSON.stringify(templateData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `email-templates-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showMessage('Email templates exported successfully!', 'success');
}

// Quick export shortcuts
function quickExportApplications() {
  exportApplicationsToCSV();
}

function quickExportContacts() {
  exportContactsToCSV();
}

function quickExportAll() {
  exportToExcel();
}

// Export to PDF function using jsPDF
function exportToPDF() {
  try {
    if (typeof window.jspdf === 'undefined') {
      showMessage('PDF library not loaded. Generating HTML report instead.', 'info');
      exportReport();
      return;
    }
    
    const currentApplications = window.jobTracker?.applications || window.applications || [];
    
    if (currentApplications.length === 0) {
      showMessage('No applications data to export to PDF.', 'error');
      return;
    }
    
    // Create Professional PDF Report using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const stats = calculateProfessionalStats(currentApplications, currentContacts);
    
    // Header Section
    doc.setFillColor(41, 98, 255);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('JOB SEARCH ANALYTICS REPORT', 20, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total Applications: ${stats.totalApplications}`, 20, 30);
    
    // Executive Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', 20, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Key Metrics Box
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 55, 170, 45);
    
    const metrics = [
      `Interview Rate: ${stats.interviewRate}% (Industry Avg: 10-20%)`,
      `Response Rate: ${stats.responseRate}% (Industry Avg: 25-35%)`,
      `Offer Rate: ${stats.offerRate}% (Industry Avg: 2-5%)`,
      `Active Applications: ${stats.activeApplications}`,
      `Professional Contacts: ${stats.totalContacts}`,
      `Avg Response Time: ${stats.avgResponseTime} days`
    ];
    
    let yPos = 65;
    metrics.forEach((metric, index) => {
      if (index % 2 === 0) {
        doc.text(metric, 25, yPos);
      } else {
        doc.text(metric, 110, yPos);
        yPos += 8;
      }
    });
    
    // Recent Applications Table
    yPos = 115;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT APPLICATIONS', 20, yPos);
    
    // Table Headers
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 20, yPos);
    doc.text('Job Title', 45, yPos);
    doc.text('Company', 85, yPos);
    doc.text('Status', 125, yPos);
    doc.text('Portal', 155, yPos);
    
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Table Data
    doc.setFont('helvetica', 'normal');
    yPos += 8;
    
    const recentApps = currentApplications
      .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
      .slice(0, 15);
    
    recentApps.forEach((app, index) => {
      if (yPos > 260) { // New page if needed
        doc.addPage();
        yPos = 30;
      }
      
      const date = new Date(app.applicationDate).toLocaleDateString();
      const title = app.jobTitle.length > 15 ? app.jobTitle.substring(0, 15) + '...' : app.jobTitle;
      const company = app.company.length > 12 ? app.company.substring(0, 12) + '...' : app.company;
      
      doc.text(date, 20, yPos);
      doc.text(title, 45, yPos);
      doc.text(company, 85, yPos);
      doc.text(app.status, 125, yPos);
      doc.text(app.jobPortal || 'Other', 155, yPos);
      
      yPos += 6;
    });
    
    // Footer
    if (yPos > 240) {
      doc.addPage();
      yPos = 30;
    }
    
    yPos += 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, 170, 20, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('This report provides insights into your job search performance and networking activities.', 25, yPos + 8);
    doc.text('Continue tracking applications and building professional relationships for optimal results.', 25, yPos + 15);
    
    doc.save(`Job_Tracker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showMessage('PDF report generated successfully!', 'success');
    
  } catch (error) {
    console.error('PDF export error:', error);
    showMessage('PDF export failed. Generating HTML report instead.', 'info');
    exportReport(); // Fallback to HTML report
  }
}

// Generate report function
function exportReport() {
  try {
    const currentApplications = window.jobTracker?.applications || window.applications || [];
    
    if (currentApplications.length === 0) {
      showMessage('No applications data to generate report.', 'error');
      return;
    }
    
    // Create a comprehensive report
    const reportContent = generateReportContent(currentApplications);
    
    // Create and download as HTML file
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Job_Tracker_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showMessage('Report generated and downloaded successfully!', 'success');
    
  } catch (error) {
    console.error('Report generation failed:', error);
    showMessage('Failed to generate report. Please try again.', 'error');
  }
}

// Generate report content
function generateReportContent(applications) {
  const totalApps = applications.length;
  const statusCounts = {};
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Job Tracker Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; color: #333; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px; padding: 10px; background: white; border-radius: 5px; min-width: 150px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Job Tracker Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary Statistics</h2>
        <div class="stat">
            <strong>Total Applications:</strong><br>${totalApps}
        </div>
        ${Object.entries(statusCounts).map(([status, count]) => 
          `<div class="stat"><strong>${status}:</strong><br>${count}</div>`
        ).join('')}
    </div>
    
    <h2>All Applications</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Status</th>
                <th>Portal</th>
            </tr>
        </thead>
        <tbody>
            ${applications.map(app => `
                <tr>
                    <td>${app.applicationDate}</td>
                    <td>${app.jobTitle}</td>
                    <td>${app.company}</td>
                    <td>${app.status}</td>
                    <td>${app.jobPortal}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
  `;
}

// Professional Statistics Calculation Function
function calculateProfessionalStats(applications, contacts) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Application metrics
  const totalApplications = applications.length;
  const interviewStatuses = ['Phone Screen', 'Interview Scheduled', 'Final Interview', 'Technical Assessment'];
  const responseStatuses = ['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Technical Assessment', 'Offer', 'Rejected'];
  const activeStatuses = ['Applied', 'Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Technical Assessment'];
  
  const interviewApps = applications.filter(app => interviewStatuses.includes(app.status)).length;
  const responseApps = applications.filter(app => responseStatuses.includes(app.status)).length;
  const offerApps = applications.filter(app => app.status === 'Offer').length;
  const activeApps = applications.filter(app => activeStatuses.includes(app.status)).length;
  const pendingFollowups = applications.filter(app => app.followUpDate && new Date(app.followUpDate) <= now).length;
  
  // Time-based metrics
  const thisMonthApps = applications.filter(app => new Date(app.applicationDate) >= oneMonthAgo).length;
  const lastWeekApps = applications.filter(app => new Date(app.applicationDate) >= oneWeekAgo).length;
  
  // Response time calculation
  const responseAppsWithDates = applications.filter(app => 
    responseStatuses.includes(app.status) && app.applicationDate
  );
  const avgResponseTime = responseAppsWithDates.length > 0 
    ? Math.round(responseAppsWithDates.reduce((sum, app) => {
        const appDate = new Date(app.applicationDate);
        const responseDate = new Date(app.dateAdded || app.applicationDate);
        return sum + Math.max(0, (responseDate - appDate) / (1000 * 60 * 60 * 24));
      }, 0) / responseAppsWithDates.length)
    : 0;
  
  // Contact metrics
  const totalContacts = contacts.length;
  const highValueContacts = contacts.filter(contact => 
    contact.relationship === 'Recruiter' || 
    contact.relationship === 'Hiring Manager' || 
    contact.relationship === 'Referral'
  ).length;
  const recentContactActivity = contacts.filter(contact => 
    contact.lastContactDate && new Date(contact.lastContactDate) >= oneMonthAgo
  ).length;
  
  return {
    totalApplications,
    totalContacts,
    totalResumes: window.jobTracker?.resumes?.length || 0,
    interviewRate: totalApplications > 0 ? Math.round((interviewApps / totalApplications) * 100) : 0,
    responseRate: totalApplications > 0 ? Math.round((responseApps / totalApplications) * 100) : 0,
    offerRate: totalApplications > 0 ? Math.round((offerApps / totalApplications) * 100) : 0,
    avgResponseTime,
    thisMonth: thisMonthApps,
    lastWeek: lastWeekApps,
    activeApplications: activeApps,
    pendingFollowups,
    highValueContacts,
    recentContactActivity
  };
}