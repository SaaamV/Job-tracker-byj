// Applications Feature Module - Clean and Consolidated
// Manages job application CRUD operations with local storage and API sync

(function() {
  'use strict';
  
  console.log('📋 Loading Applications Module...');
  
  // Module state
  let applications = [];
  let isInitialized = false;
  
  // Initialize the module
  async function initialize() {
    if (isInitialized) {
      console.log('✅ Applications module already initialized');
      return;
    }
    
    await loadApplications();
    setupEventListeners();
    setDefaultValues();
    
    isInitialized = true;
    console.log(`📋 Applications module initialized with ${applications.length} applications`);
  }
  
  // Load applications from API or localStorage
  async function loadApplications() {
    try {
      if (window.apiService) {
        applications = await window.apiService.getApplications();
      } else {
        applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      }
      
      // Update global reference for backward compatibility
      window.applications = applications;
      
      renderApplications();
      
      if (typeof window.updateAnalytics === 'function') {
        window.updateAnalytics();
      }
      
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      applications = [];
      window.applications = [];
    }
  }
  
  // Add new application - FIXED to prevent ObjectId issues
  async function addApplication() {
    console.log('📝 Adding new application...');
    
    const applicationData = getFormData();
    
    // Validate required fields
    if (!applicationData.jobTitle || !applicationData.company) {
      showMessage('Please fill in Job Title and Company', 'error');
      return;
    }
    
    try {
      // Try to save to API if available
      if (window.apiService) {
        try {
          // Make a clean copy without problematic fields for API
          const apiData = { ...applicationData };
          delete apiData.id; // Remove local ID to prevent ObjectId issues
          
          const savedApp = await window.apiService.saveApplication(apiData);
          
          // Add the API response (with proper MongoDB _id) to local state
          applications.push(savedApp);
          window.applications = applications;
          
          showMessage('Application saved successfully!', 'success');
        } catch (error) {
          console.log('📱 API failed, saving locally:', error);
          
          // Fallback to local storage with local ID
          applications.push(applicationData);
          window.applications = applications;
          
          showMessage('Application saved locally. Will sync when connection is restored.', 'info');
        }
      } else {
        // No API service, save locally
        applications.push(applicationData);
        window.applications = applications;
        showMessage('Application saved successfully!', 'success');
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      
      // Update UI
      renderApplications();
      
      if (typeof window.updateAnalytics === 'function') {
        window.updateAnalytics();
      }
      
      clearForm();
      
    } catch (error) {
      console.error('❌ Error adding application:', error);
      showMessage('Failed to save application. Please try again.', 'error');
    }
  }
  
  // Get form data - FIXED to prevent ObjectId issues and enum validation
  function getFormData() {
    const data = {
      // Don't send ID - let MongoDB generate it
      jobTitle: getElementById('jobTitle').value.trim(),
      company: getElementById('company').value.trim(),
      jobPortal: getElementById('jobPortal').value || 'Other',
      jobUrl: getElementById('jobUrl').value.trim(),
      applicationDate: getElementById('applicationDate').value || new Date().toISOString().split('T')[0],
      status: getElementById('status').value || 'Applied',
      resumeVersion: getElementById('resumeVersion').value,
      location: getElementById('location').value.trim(),
      salaryRange: getElementById('salaryRange').value.trim(),
      jobType: getElementById('jobType').value || 'Full-time',
      priority: getElementById('priority').value || 'Medium',
      followUpDate: getElementById('followUpDate').value,
      notes: getElementById('notes').value.trim(),
      dateAdded: new Date().toISOString()
    };
    
    // Only add ID for local storage (not for API)
    if (!window.apiService) {
      data.id = Date.now() + Math.random();
    }
    
    return data;
  }
  
  // Render applications table
  function renderApplications() {
    const tbody = document.getElementById('applicationsBody');
    if (!tbody) {
      console.warn('⚠️ Applications table body not found');
      return;
    }
    
    tbody.innerHTML = '';
    
    const filteredApps = getFilteredApplications();
    
    if (filteredApps.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">📋</div>
            No applications yet. Add your first application above!
          </td>
        </tr>
      `;
      return;
    }
    
    filteredApps.forEach((app, index) => {
      const row = document.createElement('tr');
      
      // Apply priority styling
      if (app.priority === 'High') {
        row.classList.add('priority-high');
      } else if (app.priority === 'Medium') {
        row.classList.add('priority-medium');
      } else if (app.priority === 'Low') {
        row.classList.add('priority-low');
      }
      
      row.innerHTML = `
        <td>${formatDate(app.applicationDate)}</td>
        <td><strong>${escapeHtml(app.jobTitle)}</strong></td>
        <td>${escapeHtml(app.company)}</td>
        <td>${app.jobPortal || 'N/A'}</td>
        <td><span class="status-badge status-${app.status.toLowerCase().replace(/\\s+/g, '-')}">${app.status}</span></td>
        <td>${app.resumeVersion || 'N/A'}</td>
        <td>
          <span class="priority-badge priority-${app.priority.toLowerCase()}">${app.priority}</span>
        </td>
        <td>${getFollowUpStatus(app.followUpDate)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm" onclick="Applications.edit(${app.id || index})" title="Edit">✏️</button>
            <button class="btn btn-sm" onclick="Applications.duplicate(${app.id || index})" title="Duplicate">📋</button>
            <button class="btn btn-sm btn-danger" onclick="Applications.delete(${app.id || index})" title="Delete">🗑️</button>
            ${app.jobUrl ? `<a href="${app.jobUrl}" target="_blank" class="btn btn-sm" title="View Job">🔗</a>` : ''}
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
    
    console.log(`📋 Rendered ${filteredApps.length} applications`);
  }
  
  // Get filtered and sorted applications
  function getFilteredApplications() {
    let filtered = [...applications];
    
    // Status filter
    const statusFilter = getElementById('statusFilter')?.value;
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Company filter
    const companyFilter = getElementById('companyFilter')?.value?.toLowerCase();
    if (companyFilter) {
      filtered = filtered.filter(app => 
        app.company.toLowerCase().includes(companyFilter)
      );
    }
    
    // Sort
    const sortBy = getElementById('sortBy')?.value || 'date-desc';
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
          return new Date(b.dateAdded || b.applicationDate) - new Date(a.dateAdded || a.applicationDate);
      }
    });
    
    return filtered;
  }
  
  // Edit application
  function editApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) {
      console.warn('⚠️ Application not found for editing:', id);
      return;
    }
    
    // Populate form with existing data
    getElementById('jobTitle').value = app.jobTitle || '';
    getElementById('company').value = app.company || '';
    getElementById('jobPortal').value = app.jobPortal || '';
    getElementById('jobUrl').value = app.jobUrl || '';
    getElementById('applicationDate').value = app.applicationDate || '';
    getElementById('status').value = app.status || 'Applied';
    getElementById('resumeVersion').value = app.resumeVersion || '';
    getElementById('location').value = app.location || '';
    getElementById('salaryRange').value = app.salaryRange || '';
    getElementById('jobType').value = app.jobType || '';
    getElementById('priority').value = app.priority || 'Medium';
    getElementById('followUpDate').value = app.followUpDate || '';
    getElementById('notes').value = app.notes || '';
    
    // Remove the original (will be re-added when form is submitted)
    deleteApplicationById(id, false);
    
    showMessage('Application loaded for editing. Make changes and click "Add Application" to save.', 'info');
    
    // Scroll to form
    document.getElementById('applications').scrollIntoView({ behavior: 'smooth' });
  }
  
  // Duplicate application
  function duplicateApplication(id) {
    const app = applications.find(a => a.id === id);
    if (!app) {
      console.warn('⚠️ Application not found for duplication:', id);
      return;
    }
    
    // Populate form with existing data but clear some fields
    getElementById('jobTitle').value = app.jobTitle || '';
    getElementById('company').value = ''; // Clear company for new application
    getElementById('jobPortal').value = app.jobPortal || '';
    getElementById('jobUrl').value = ''; // Clear URL
    getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
    getElementById('status').value = 'Applied';
    getElementById('resumeVersion').value = app.resumeVersion || '';
    getElementById('location').value = app.location || '';
    getElementById('salaryRange').value = app.salaryRange || '';
    getElementById('jobType').value = app.jobType || '';
    getElementById('priority').value = app.priority || 'Medium';
    getElementById('followUpDate').value = '';
    getElementById('notes').value = '';
    
    showMessage('Application template loaded. Fill in the details and click "Add Application" to save.', 'info');
    
    // Scroll to form
    document.getElementById('applications').scrollIntoView({ behavior: 'smooth' });
  }
  
  // Delete application
  async function deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    await deleteApplicationById(id, true);
  }
  
  // Delete application by ID
  async function deleteApplicationById(id, showConfirmation = true) {
    try {
      // Remove from local state
      applications = applications.filter(app => app.id !== id);
      window.applications = applications;
      
      // Update localStorage
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      
      // Try to delete from API
      if (window.apiService) {
        try {
          await window.apiService.deleteApplication(id);
        } catch (error) {
          console.log('📱 Deleted locally, will sync when online');
        }
      }
      
      // Update UI
      renderApplications();
      
      if (typeof window.updateAnalytics === 'function') {
        window.updateAnalytics();
      }
      
      if (showConfirmation) {
        showMessage('Application deleted successfully!', 'success');
      }
      
    } catch (error) {
      console.error('❌ Error deleting application:', error);
      showMessage('Failed to delete application. Please try again.', 'error');
    }
  }
  
  // Filter applications
  function filterApplications() {
    renderApplications();
  }
  
  // Clear form
  function clearForm() {
    const inputs = document.querySelectorAll('#applications input, #applications select, #applications textarea');
    inputs.forEach(input => {
      if (input.id === 'applicationDate') {
        input.value = new Date().toISOString().split('T')[0];
      } else if (input.id === 'status') {
        input.value = 'Applied';
      } else if (input.id === 'priority') {
        input.value = 'Medium';
      } else {
        input.value = '';
      }
    });
  }
  
  // Set default values
  function setDefaultValues() {
    const applicationDateInput = getElementById('applicationDate');
    if (applicationDateInput && !applicationDateInput.value) {
      applicationDateInput.value = new Date().toISOString().split('T')[0];
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Listen for API sync events
    window.addEventListener('apiSyncComplete', () => {
      console.log('🔄 API sync completed, refreshing applications');
      loadApplications();
    });
  }
  
  // Utility functions
  function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`⚠️ Element not found: ${id}`);
      return { value: '' }; // Return mock element to prevent errors
    }
    return element;
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }
  
  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
  
  function showMessage(message, type = 'info') {
    if (typeof window.showMessage === 'function') {
      window.showMessage(message, type);
      return;
    }
    
    // Fallback message display
    console.log(`${type.toUpperCase()}: ${message}`);
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const colors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 4000);
  }
  
  // Public API
  window.Applications = {
    initialize,
    add: addApplication,
    edit: editApplication,
    duplicate: duplicateApplication,
    delete: deleteApplication,
    filter: filterApplications,
    render: renderApplications,
    load: loadApplications,
    clear: clearForm
  };
  
  // Legacy global functions for backward compatibility
  window.addApplication = addApplication;
  window.renderApplications = renderApplications;
  window.filterApplications = filterApplications;
  window.deleteApplication = deleteApplication;
  window.editApplication = editApplication;
  window.duplicateApplication = duplicateApplication;
  window.clearForm = clearForm;
  window.loadApplications = loadApplications;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('📋 Applications module loaded successfully');
})();