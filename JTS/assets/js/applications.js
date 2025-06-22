// applications.js - Enhanced application management

function addApplication() {
  const application = {
    id: Date.now(),
    jobTitle: document.getElementById('jobTitle').value.trim(),
    company: document.getElementById('company').value.trim(),
    jobPortal: document.getElementById('jobPortal').value,
    jobUrl: document.getElementById('jobUrl').value.trim(),
    applicationDate: document.getElementById('applicationDate').value,
    status: document.getElementById('status').value,
    resumeVersion: document.getElementById('resumeVersion').value,
    location: document.getElementById('location').value.trim(),
    salaryRange: document.getElementById('salaryRange').value.trim(),
    jobType: document.getElementById('jobType').value,
    priority: document.getElementById('priority').value,
    followUpDate: document.getElementById('followUpDate').value,
    notes: document.getElementById('notes').value.trim(),
    dateAdded: new Date().toISOString()
  };

  if (!application.jobTitle || !application.company) {
    showMessage('Please fill in required fields (Job Title and Company)', 'error');
    return;
  }

  // Check for potential duplicates
  const duplicate = applications.find(app => 
    app.jobTitle.toLowerCase() === application.jobTitle.toLowerCase() &&
    app.company.toLowerCase() === application.company.toLowerCase() &&
    app.applicationDate === application.applicationDate
  );

  if (duplicate) {
    if (!confirm('A similar application already exists. Do you want to add this anyway?')) {
      return;
    }
  }

  // Use API service to save
  addApplicationAPI(application);
  
  clearForm();
  showMessage('Application added successfully!', 'success');
}

function renderApplications() {
  const tbody = document.getElementById('applicationsBody');
  tbody.innerHTML = '';

  let filteredApps = getFilteredApplications();

  if (filteredApps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">No applications found matching your filters.</td></tr>';
    return;
  }

  filteredApps.forEach(app => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(app.applicationDate)}</td>
      <td><strong>${app.jobTitle}</strong></td>
      <td>${app.company}</td>
      <td>${app.jobPortal || 'N/A'}</td>
      <td><span class="status-${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span></td>
      <td>${app.resumeVersion || 'N/A'}</td>
      <td><span class="priority-${app.priority.toLowerCase()}">${app.priority}</span></td>
      <td>${getFollowUpStatus(app.followUpDate)}</td>
      <td>
        ${app.jobUrl ? `<a href="${app.jobUrl}" target="_blank" title="View Job Posting">🔗</a> | ` : ''}
        <a href="#" onclick="editApplication(${app.id})" title="Edit">✏️</a> |
        <a href="#" onclick="duplicateApplication(${app.id})" title="Duplicate">📋</a> |
        <a href="#" onclick="deleteApplication(${app.id})" style="color: red;" title="Delete">🗑️</a>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function getFilteredApplications() {
  let filtered = [...applications];
  
  // Filter by status
  const statusFilter = document.getElementById('statusFilter')?.value;
  if (statusFilter) {
    filtered = filtered.filter(app => app.status === statusFilter);
  }
  
  // Filter by company
  const companyFilter = document.getElementById('companyFilter')?.value?.toLowerCase();
  if (companyFilter) {
    filtered = filtered.filter(app => 
      app.company.toLowerCase().includes(companyFilter)
    );
  }
  
  // Sort applications
  const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.applicationDate) - new Date(b.applicationDate);
      case 'date-desc':
        return new Date(b.applicationDate) - new Date(a.applicationDate);
      case 'company':
        return a.company.localeCompare(b.company);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      default:
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });
  
  return filtered;
}

function filterApplications() {
  renderApplications();
}

function getFollowUpStatus(followUpDate) {
  if (!followUpDate) return 'N/A';
  
  const today = new Date().toISOString().split('T')[0];
  const followUp = followUpDate;
  
  if (followUp < today) {
    return `<span class="follow-up-overdue">Overdue</span>`;
  } else if (followUp === today) {
    return `<span class="follow-up-today">Today</span>`;
  } else {
    return `<span class="follow-up-upcoming">${formatDate(followUp)}</span>`;
  }
}

function deleteApplication(id) {
  if (confirm('Are you sure you want to delete this application?')) {
    deleteApplicationAPI(id);
  }
}

function editApplication(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;

  // Populate form with existing data
  document.getElementById('jobTitle').value = app.jobTitle || '';
  document.getElementById('company').value = app.company || '';
  document.getElementById('jobPortal').value = app.jobPortal || '';
  document.getElementById('jobUrl').value = app.jobUrl || '';
  document.getElementById('applicationDate').value = app.applicationDate || '';
  document.getElementById('status').value = app.status || 'Applied';
  document.getElementById('resumeVersion').value = app.resumeVersion || '';
  document.getElementById('location').value = app.location || '';
  document.getElementById('salaryRange').value = app.salaryRange || '';
  document.getElementById('jobType').value = app.jobType || '';
  document.getElementById('priority').value = app.priority || 'Medium';
  document.getElementById('followUpDate').value = app.followUpDate || '';
  document.getElementById('notes').value = app.notes || '';

  // Delete old version
  applications = applications.filter(a => a.id !== id);
  localStorage.setItem('jobApplications', JSON.stringify(applications));
  renderApplications();
  updateAnalytics();
  
  // Scroll to form
  document.getElementById('applications').scrollIntoView({ behavior: 'smooth' });
  showMessage('Application loaded for editing. Make changes and click "Add Application" to save.', 'info');
}

function duplicateApplication(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;

  // Populate form with existing data but clear some fields
  document.getElementById('jobTitle').value = app.jobTitle || '';
  document.getElementById('company').value = ''; // Clear company for new application
  document.getElementById('jobPortal').value = app.jobPortal || '';
  document.getElementById('jobUrl').value = ''; // Clear URL
  document.getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('status').value = 'Applied';
  document.getElementById('resumeVersion').value = app.resumeVersion || '';
  document.getElementById('location').value = app.location || '';
  document.getElementById('salaryRange').value = app.salaryRange || '';
  document.getElementById('jobType').value = app.jobType || '';
  document.getElementById('priority').value = app.priority || 'Medium';
  document.getElementById('followUpDate').value = '';
  document.getElementById('notes').value = '';

  // Scroll to form
  document.getElementById('applications').scrollIntoView({ behavior: 'smooth' });
  showMessage('Application duplicated. Modify details and click "Add Application" to save.', 'info');
}

// Bulk operations
function selectAllApplications() {
  const checkboxes = document.querySelectorAll('.app-checkbox');
  checkboxes.forEach(cb => cb.checked = true);
}

function deselectAllApplications() {
  const checkboxes = document.querySelectorAll('.app-checkbox');
  checkboxes.forEach(cb => cb.checked = false);
}

function bulkUpdateStatus() {
  const selectedIds = Array.from(document.querySelectorAll('.app-checkbox:checked'))
    .map(cb => parseInt(cb.value));
  
  if (selectedIds.length === 0) {
    showMessage('Please select applications to update', 'error');
    return;
  }
  
  const newStatus = prompt('Enter new status for selected applications:');
  if (!newStatus) return;
  
  let updated = 0;
  applications.forEach(app => {
    if (selectedIds.includes(app.id)) {
      app.status = newStatus;
      updated++;
    }
  });
  
  localStorage.setItem('jobApplications', JSON.stringify(applications));
  renderApplications();
  updateAnalytics();
  showMessage(`Updated ${updated} application(s)`, 'success');
}

function bulkDelete() {
  const selectedIds = Array.from(document.querySelectorAll('.app-checkbox:checked'))
    .map(cb => parseInt(cb.value));
  
  if (selectedIds.length === 0) {
    showMessage('Please select applications to delete', 'error');
    return;
  }
  
  if (confirm(`Are you sure you want to delete ${selectedIds.length} application(s)?`)) {
    applications = applications.filter(app => !selectedIds.includes(app.id));
    localStorage.setItem('jobApplications', JSON.stringify(applications));
    renderApplications();
    updateAnalytics();
    showMessage(`Deleted ${selectedIds.length} application(s)`, 'success');
  }
}

// Application statistics for individual entries
function getApplicationStats(app) {
  const daysSinceApplication = Math.floor(
    (new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24)
  );
  
  const avgResponseTime = getAverageResponseTime();
  const isOverdue = daysSinceApplication > avgResponseTime && app.status === 'Applied';
  
  return {
    daysSinceApplication,
    isOverdue,
    avgResponseTime
  };
}

function getAverageResponseTime() {
  const responsedApps = applications.filter(app => 
    app.status !== 'Applied' && app.status !== 'Withdrawn'
  );
  
  if (responsedApps.length === 0) return 14; // Default 2 weeks
  
  const totalDays = responsedApps.reduce((sum, app) => {
    const daysDiff = Math.floor(
      (new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24)
    );
    return sum + daysDiff;
  }, 0);
  
  return Math.round(totalDays / responsedApps.length);
}

// Quick add functionality for common job portals
function quickAddFromLinkedIn() {
  const url = prompt('Paste LinkedIn job URL:');
  if (url) {
    document.getElementById('jobPortal').value = 'LinkedIn';
    document.getElementById('jobUrl').value = url;
    document.getElementById('jobTitle').focus();
  }
}

function quickAddFromIndeed() {
  const url = prompt('Paste Indeed job URL:');
  if (url) {
    document.getElementById('jobPortal').value = 'Indeed';
    document.getElementById('jobUrl').value = url;
    document.getElementById('jobTitle').focus();
  }
}

// Application insights and recommendations
function getApplicationInsights() {
  const insights = [];
  
  // Check application frequency
  const recentApps = applications.filter(app => {
    const daysAgo = Math.floor((new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24));
    return daysAgo <= 7;
  });
  
  if (recentApps.length < 3) {
    insights.push('Consider increasing your application frequency. Aim for 5-10 applications per week.');
  }
  
  // Check for follow-ups needed
  const needFollowUp = applications.filter(app => {
    const daysAgo = Math.floor((new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24));
    return app.status === 'Applied' && daysAgo >= 14 && !app.followUpDate;
  });
  
  if (needFollowUp.length > 0) {
    insights.push(`${needFollowUp.length} application(s) may need follow-up. Consider reaching out.`);
  }
  
  // Check resume variety
  const resumeUsage = {};
  applications.forEach(app => {
    if (app.resumeVersion) {
      resumeUsage[app.resumeVersion] = (resumeUsage[app.resumeVersion] || 0) + 1;
    }
  });
  
  const resumeTypes = Object.keys(resumeUsage).length;
  if (resumeTypes <= 1 && applications.length > 10) {
    insights.push('Consider creating targeted resume versions for different types of roles.');
  }
  
  return insights;
}

// Auto-complete functionality
function setupAutoComplete() {
  const companyInput = document.getElementById('company');
  const existingCompanies = [...new Set(applications.map(app => app.company))];
  
  // Simple autocomplete implementation
  companyInput.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    const suggestions = existingCompanies.filter(company => 
      company.toLowerCase().includes(value)
    ).slice(0, 5);
    
    // You could implement a dropdown here
    console.log('Company suggestions:', suggestions);
  });
}

// Initialize application enhancements
function initializeApplicationEnhancements() {
  setupAutoComplete();
}

// Call initialization
window.addEventListener('load', initializeApplicationEnhancements);