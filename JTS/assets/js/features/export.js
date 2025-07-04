// export.js - Enhanced export functionality

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  
  // Applications sheet with enhanced data
  const enhancedApplications = applications.map(app => ({
    'Application Date': app.applicationDate,
    'Job Title': app.jobTitle,
    'Company': app.company,
    'Job Portal': app.jobPortal || '',
    'Job URL': app.jobUrl || '',
    'Status': app.status,
    'Resume Version': app.resumeVersion || '',
    'Location': app.location || '',
    'Salary Range': app.salaryRange || '',
    'Job Type': app.jobType || '',
    'Priority': app.priority,
    'Follow-up Date': app.followUpDate || '',
    'Notes': app.notes || '',
    'Date Added': new Date(app.dateAdded).toLocaleDateString(),
    'Days Since Application': Math.floor((new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24))
  }));
  
  // Contacts sheet with enhanced data
  const enhancedContacts = contacts.map(contact => ({
    'Name': contact.name,
    'Company': contact.company || '',
    'Position': contact.position || '',
    'LinkedIn URL': contact.linkedinUrl || '',
    'Email': contact.email || '',
    'Phone': contact.phone || '',
    'Relationship': contact.relationship,
    'Status': contact.status,
    'Last Contact Date': contact.lastContactDate || '',
    'Next Follow-up Date': contact.nextFollowUpDate || '',
    'Tags': contact.tags || '',
    'Notes': contact.notes || '',
    'Date Added': new Date(contact.dateAdded).toLocaleDateString()
  }));
  
  // Analytics summary sheet
  const analytics = getDetailedAnalytics();
  const analyticsData = [
    { 'Metric': 'Total Applications', 'Value': applications.length },
    { 'Metric': 'Total Contacts', 'Value': contacts.length },
    { 'Metric': 'Interview Rate', 'Value': analytics.performance?.interviewRate + '%' || '0%' },
    { 'Metric': 'Offer Rate', 'Value': analytics.performance?.offerRate + '%' || '0%' },
    { 'Metric': 'Response Rate', 'Value': calculateResponseRate() + '%' },
    { 'Metric': 'Avg Response Time (Days)', 'Value': calculateAverageResponseTime() },
    { 'Metric': 'Applications Last 30 Days', 'Value': analytics.trends?.last30Days || 0 },
    { 'Metric': 'Applications Last 7 Days', 'Value': analytics.trends?.last7Days || 0 }
  ];
  
  // Add sheets to workbook
  const appWs = XLSX.utils.json_to_sheet(enhancedApplications);
  const contactWs = XLSX.utils.json_to_sheet(enhancedContacts);
  const analyticsWs = XLSX.utils.json_to_sheet(analyticsData);
  
  XLSX.utils.book_append_sheet(wb, appWs, "Applications");
  XLSX.utils.book_append_sheet(wb, contactWs, "Contacts");
  XLSX.utils.book_append_sheet(wb, analyticsWs, "Analytics");
  
  // Add conditional formatting and styling
  addExcelStyling(wb);
  
  // Save file
  XLSX.writeFile(wb, `Job_Tracker_Complete_${new Date().toISOString().split('T')[0]}.xlsx`);
  showMessage('Complete data exported to Excel successfully!', 'success');
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
        
        if (confirm(confirmMessage)) {
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
          if (confirm('Reload page for complete refresh?')) {
            window.location.reload();
          }
        }
        
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

// PDF Export functionality
function exportToPDF() {
  // Check if user has premium access
  if (window.PaymentsModule && !window.PaymentsModule.canUseFeature('pdfExports')) {
    showMessage('PDF export requires a Premium subscription. Please upgrade your plan.', 'error');
    return;
  }

  try {
    showMessage('Generating PDF report...', 'info');
    
    // Create a comprehensive PDF report
    const reportData = generatePDFReportData();
    createPDFDocument(reportData);
    
    // Track usage if payments module is available
    if (window.PaymentsModule) {
      window.PaymentsModule.trackUsage('pdfExports');
    }
    
  } catch (error) {
    console.error('PDF export failed:', error);
    showMessage('Failed to generate PDF. Please try again.', 'error');
  }
}

function generatePDFReportData() {
  const now = new Date();
  const analytics = getDetailedAnalytics();
  
  return {
    title: 'Job Search Report',
    subtitle: `Generated on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
    summary: {
      totalApplications: applications.length,
      totalContacts: contacts.length,
      responseRate: calculateResponseRate(),
      interviewRate: analytics.performance?.interviewRate || 0,
      offerRate: analytics.performance?.offerRate || 0,
      avgResponseTime: calculateAverageResponseTime(),
      pendingFollowUps: calculatePendingFollowUps(),
      last30Days: analytics.trends?.last30Days || 0
    },
    applications: applications.slice(0, 50), // Limit to recent 50 for PDF size
    contacts: contacts.slice(0, 30), // Limit to recent 30
    statusBreakdown: getStatusBreakdown(),
    portalPerformance: calculatePortalPerformance().slice(0, 10),
    monthlyTrends: getMonthlyTrends()
  };
}

function createPDFDocument(data) {
  // Create HTML content for PDF
  const htmlContent = generatePDFHTML(data);
  
  // Create a hidden iframe to generate PDF
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '8.5in';
  iframe.style.height = '11in';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    iframe.contentWindow.print();
    
    // Remove iframe after printing
    setTimeout(() => {
      document.body.removeChild(iframe);
      showMessage('PDF report generated successfully!', 'success');
    }, 1000);
  }, 500);
}

function generatePDFHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    @page {
      margin: 1in;
      size: letter;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.4;
      color: #333;
      font-size: 11pt;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 24pt;
    }
    .header .subtitle {
      color: #666;
      margin: 5px 0 0 0;
      font-size: 10pt;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #2c3e50;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
      margin-bottom: 15px;
      font-size: 14pt;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-item {
      text-align: center;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    .summary-value {
      font-size: 18pt;
      font-weight: bold;
      color: #3498db;
      display: block;
    }
    .summary-label {
      font-size: 9pt;
      color: #666;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 9pt;
    }
    th, td {
      padding: 6px 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
      color: #2c3e50;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .status-applied { color: #3498db; }
    .status-interview { color: #f39c12; }
    .status-offer { color: #27ae60; }
    .status-rejected { color: #e74c3c; }
    .chart-placeholder {
      height: 150px;
      background: #f8f9fa;
      border: 1px dashed #bdc3c7;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-style: italic;
    }
    .page-break {
      page-break-before: always;
    }
    .footer {
      position: fixed;
      bottom: 0.5in;
      left: 1in;
      right: 1in;
      text-align: center;
      font-size: 8pt;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <p class="subtitle">${data.subtitle}</p>
  </div>

  <div class="section">
    <h2>📊 Executive Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-value">${data.summary.totalApplications}</span>
        <div class="summary-label">Total Applications</div>
      </div>
      <div class="summary-item">
        <span class="summary-value">${data.summary.totalContacts}</span>
        <div class="summary-label">Professional Contacts</div>
      </div>
      <div class="summary-item">
        <span class="summary-value">${data.summary.responseRate}%</span>
        <div class="summary-label">Response Rate</div>
      </div>
      <div class="summary-item">
        <span class="summary-value">${data.summary.interviewRate}%</span>
        <div class="summary-label">Interview Rate</div>
      </div>
      <div class="summary-item">
        <span class="summary-value">${data.summary.offerRate}%</span>
        <div class="summary-label">Offer Rate</div>
      </div>
      <div class="summary-item">
        <span class="summary-value">${data.summary.avgResponseTime}</span>
        <div class="summary-label">Avg Response (Days)</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Application Status Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${data.statusBreakdown.map(item => `
          <tr>
            <td class="status-${item.Status.toLowerCase().replace(/\s+/g, '-')}">${item.Status}</td>
            <td>${item.Count}</td>
            <td>${item.Percentage}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🌐 Portal Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Portal</th>
          <th>Applications</th>
          <th>Response Rate</th>
          <th>Interview Rate</th>
          <th>Offer Rate</th>
        </tr>
      </thead>
      <tbody>
        ${data.portalPerformance.map(portal => `
          <tr>
            <td>${portal.Portal}</td>
            <td>${portal.Applications}</td>
            <td>${portal['Response Rate']}</td>
            <td>${portal['Interview Rate']}</td>
            <td>${portal['Offer Rate']}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2>📋 Recent Applications (Last 50)</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Position</th>
          <th>Company</th>
          <th>Status</th>
          <th>Portal</th>
        </tr>
      </thead>
      <tbody>
        ${data.applications.map(app => `
          <tr>
            <td>${app.applicationDate}</td>
            <td>${app.jobTitle}</td>
            <td>${app.company}</td>
            <td class="status-${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</td>
            <td>${app.jobPortal || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>👥 Key Contacts (Last 30)</h2>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Position</th>
          <th>Relationship</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.contacts.map(contact => `
          <tr>
            <td>${contact.name}</td>
            <td>${contact.company || 'N/A'}</td>
            <td>${contact.position || 'N/A'}</td>
            <td>${contact.relationship}</td>
            <td>${contact.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by Job Tracker System | ${new Date().toLocaleDateString()} | Page 1
  </div>
</body>
</html>
  `;
}

function getStatusBreakdown() {
  const statusCount = {};
  const total = applications.length;
  
  applications.forEach(app => {
    statusCount[app.status] = (statusCount[app.status] || 0) + 1;
  });
  
  return Object.entries(statusCount).map(([status, count]) => ({
    Status: status,
    Count: count,
    Percentage: total > 0 ? Math.round((count / total) * 100) + '%' : '0%'
  }));
}

function getMonthlyTrends() {
  const trends = {};
  const months = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
    months.push(monthKey);
    trends[monthKey] = 0;
  }
  
  applications.forEach(app => {
    const appMonth = app.applicationDate?.slice(0, 7);
    if (trends.hasOwnProperty(appMonth)) {
      trends[appMonth]++;
    }
  });
  
  return months.map(month => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    applications: trends[month]
  }));
}

// Enhanced PDF with charts (requires Chart.js)
function exportAdvancedPDF() {
  if (window.PaymentsModule && !window.PaymentsModule.canUseFeature('pdfExports')) {
    showMessage('PDF export requires a Premium subscription. Please upgrade your plan.', 'error');
    return;
  }

  // This would create a more advanced PDF with actual charts
  // For now, falls back to basic PDF
  exportToPDF();
}