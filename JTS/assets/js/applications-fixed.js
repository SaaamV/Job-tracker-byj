// applications-fixed.js - Fixed application management

// Global applications array
let applications = [];

function addApplication() {
  const application = {
    id: Date.now() + Math.random(), // Better unique ID generation
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

  // Validate required fields
  if (!application.jobTitle || !application.company) {
    showMessage('Please fill in required fields (Job Title and Company)', 'error');
    return;
  }

  // Set default application date if not provided
  if (!application.applicationDate) {
    application.applicationDate = new Date().toISOString().split('T')[0];
  }

  try {
    // Load existing applications from localStorage
    let currentApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    
    // Add new application to the array (NOT replace it)
    currentApplications.push(application);
    
    // Save back to localStorage
    localStorage.setItem('jobApplications', JSON.stringify(currentApplications));
    
    // Update global variable
    window.applications = currentApplications;
    applications = currentApplications;
    
    // Update UI immediately
    renderApplications();
    updateAnalytics();
    clearForm();
    showMessage('Application added successfully!', 'success');
    
    console.log('Application added. Total applications:', currentApplications.length);
    
    // Try to sync to server if API is available (but don't block on failure)
    if (window.apiService) {
      apiService.saveApplication(application).catch(error => {
        console.warn('Failed to sync to server, but saved locally:', error);
        showMessage('Application saved locally. Will sync when connection is restored.', 'info');
      });
    }
    
  } catch (error) {
    console.error('Error adding application:', error);
    showMessage('Failed to save application. Please try again.', 'error');
  }
}

function loadApplications() {
  try {
    // Load from localStorage
    const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    applications = savedApplications;
    window.applications = savedApplications;
    
    console.log('Loaded applications:', applications.length);
    
    // Render immediately
    renderApplications();
    updateAnalytics();
    
  } catch (error) {
    console.error('Error loading applications:', error);
    applications = [];
    window.applications = [];
  }
}

function renderApplications() {
  const tbody = document.getElementById('applicationsBody');
  if (!tbody) {
    console.error('Applications table body not found');
    return;
  }
  
  tbody.innerHTML = '';

  let filteredApps = getFilteredApplications();

  if (filteredApps.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9">No applications found. Add your first application above!</td></tr>';
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

  console.log('Rendered applications:', filteredApps.length);
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
    try {
      // Remove from local array
      applications = applications.filter(app => app.id !== id);
      
      // Update localStorage
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      
      // Update global variable
      window.applications = applications;
      
      // Update UI
      renderApplications();
      updateAnalytics();
      
      showMessage('Application deleted successfully!', 'success');
      
      // Try to sync to server
      if (window.apiService) {
        apiService.deleteApplication(id).catch(error => {
          console.warn('Failed to delete from server:', error);
        });
      }
      
    } catch (error) {
      console.error('Error deleting application:', error);
      showMessage('Failed to delete application. Please try again.', 'error');
    }
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
  window.applications = applications;
  
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

function clearForm() {
  const form = document.querySelector('#applications form') || document.querySelector('.form-section');
  if (form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'date' && input.id === 'applicationDate') {
        input.value = new Date().toISOString().split('T')[0]; // Set to today
      } else if (input.id === 'status') {
        input.value = 'Applied'; // Default status
      } else if (input.id === 'priority') {
        input.value = 'Medium'; // Default priority
      } else {
        input.value = '';
      }
    });
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
}

function showMessage(message, type = 'info') {
  // Create or update message element
  let messageEl = document.getElementById('message');
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'message';
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      max-width: 400px;
    `;
    document.body.appendChild(messageEl);
  }
  
  // Set colors based on type
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196F3'
  };
  
  messageEl.style.backgroundColor = colors[type] || colors.info;
  messageEl.textContent = message;
  messageEl.style.display = 'block';
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    if (messageEl) {
      messageEl.style.display = 'none';
    }
  }, 4000);
}

// Initialize applications when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Applications module initializing...');
  
  // Load applications
  loadApplications();
  
  // Set default application date to today
  const applicationDateInput = document.getElementById('applicationDate');
  if (applicationDateInput && !applicationDateInput.value) {
    applicationDateInput.value = new Date().toISOString().split('T')[0];
  }
  
  // Add debug function to window for testing
  window.testAddApplication = function() {
    const testApp = {
      id: Date.now() + Math.random(),
      jobTitle: 'Test Job ' + Date.now(),
      company: 'Test Company ' + Math.floor(Math.random() * 100),
      jobPortal: 'LinkedIn',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      priority: 'Medium',
      dateAdded: new Date().toISOString()
    };
    
    console.log('Adding test application:', testApp);
    
    // Add to applications array
    applications.push(testApp);
    localStorage.setItem('jobApplications', JSON.stringify(applications));
    window.applications = applications;
    
    // Update UI
    renderApplications();
    updateAnalytics();
    
    console.log('Test application added. Total applications:', applications.length);
    showMessage('Test application added successfully!', 'success');
  };
  
  console.log('Applications module initialized. Total applications:', applications.length);
});

// Make functions globally available
window.addApplication = addApplication;
window.renderApplications = renderApplications;
window.filterApplications = filterApplications;
window.deleteApplication = deleteApplication;
window.editApplication = editApplication;
window.duplicateApplication = duplicateApplication;
window.clearForm = clearForm;