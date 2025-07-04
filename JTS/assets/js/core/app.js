// app.js - Enhanced Job Tracker with Modern UI and API Integration

// Global state management
window.jobTracker = {
  applications: [],
  contacts: [],
  resumes: [],
  currentTab: 'applications'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Initializing Job Tracker with Apple-inspired design...');
  
  try {
    // Initialize all components
    await initializeApp();
    console.log('✅ Job Tracker initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Job Tracker:', error);
    showErrorMessage('Failed to initialize application. Please refresh the page.');
  }
});

// Main initialization function
async function initializeApp() {
  // Check API health and load data
  await loadAllData();
  
  // Initialize UI components
  initializeUI();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set default values
  setDefaultValues();
  
  // Update analytics
  updateAnalytics();
}

// Load all data from cloud API
async function loadAllData() {
  try {
    console.log('Loading data from cloud...');
    
    if (!window.apiService) {
      throw new Error('API service not available');
    }
    
    // Load applications from cloud
    try {
      window.jobTracker.applications = await window.apiService.getApplications();
      console.log(`✅ Loaded ${window.jobTracker.applications.length} applications from cloud`);
    } catch (error) {
      console.error('Failed to load applications:', error.message);
      window.jobTracker.applications = [];
      showErrorMessage('Failed to load applications. Please check your connection.');
    }
    
    // Load contacts from cloud
    try {
      window.jobTracker.contacts = await window.apiService.getContacts();
      console.log(`✅ Loaded ${window.jobTracker.contacts.length} contacts from cloud`);
    } catch (error) {
      console.error('Failed to load contacts:', error.message);
      window.jobTracker.contacts = [];
      showErrorMessage('Failed to load contacts. Please check your connection.');
    }
    
    // Initialize empty resumes array (file-based, not stored in cloud)
    window.jobTracker.resumes = [];
    
    // Update global references for backward compatibility
    window.applications = window.jobTracker.applications;
    window.contacts = window.jobTracker.contacts;
    window.resumes = window.jobTracker.resumes;
    
  } catch (error) {
    console.error('Error loading data:', error);
    showErrorMessage('Failed to connect to cloud database. Please check your internet connection.');
    
    // Initialize empty arrays if cloud connection fails
    window.jobTracker.applications = [];
    window.jobTracker.contacts = [];
    window.jobTracker.resumes = [];
  }
}

// Initialize UI components
function initializeUI() {
  // Render initial data using module methods
  if (window.ApplicationsModule && window.ApplicationsModule.renderApplications) {
    window.ApplicationsModule.renderApplications();
  }
  if (window.ContactsModule && window.ContactsModule.renderContacts) {
    window.ContactsModule.renderContacts();
  }
  if (window.ResumesModule && window.ResumesModule.renderResumes) {
    window.ResumesModule.renderResumes();
  }
  if (window.ResumesModule && window.ResumesModule.updateResumeDropdown) {
    window.ResumesModule.updateResumeDropdown();
  }
}

// Enhanced tab switching with animations
function switchTab(tabName, tabElement) {
  console.log(`Switching to ${tabName} tab`);
  
  // Remove active class from all tabs and content
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Add active class to clicked tab
  tabElement.classList.add('active');
  
  // Show corresponding content with animation
  const targetContent = document.getElementById(tabName);
  if (targetContent) {
    setTimeout(() => {
      targetContent.classList.add('active');
      
      // Load tab-specific data if needed
      if (tabName === 'analytics') {
        updateAnalytics();
      } else if (tabName === 'contacts') {
        renderContacts();
      } else if (tabName === 'resumes') {
        renderResumes();
      }
    }, 100);
  }
  
  // Update global state
  window.jobTracker.currentTab = tabName;
}

// Setup event listeners
function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Online/offline status
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
  
  // Applications form submission
  const addAppButton = document.getElementById('addApplicationBtn');
  if (addAppButton) {
    addAppButton.addEventListener('click', addApplicationFromForm);
  }
  
  // Applications form clear
  const clearAppButton = document.getElementById('clearFormBtn');
  if (clearAppButton) {
    clearAppButton.addEventListener('click', clearApplicationForm);
  }
  
  // Contacts form submission
  const addContactButton = document.getElementById('addContactBtn');
  if (addContactButton) {
    addContactButton.addEventListener('click', addContactFromForm);
  }
  
  // Contacts form clear
  const clearContactButton = document.getElementById('clearContactFormBtn');
  if (clearContactButton) {
    clearContactButton.addEventListener('click', clearContactForm);
  }
  
  // Filter inputs
  const filterInputs = document.querySelectorAll('.filter-input');
  filterInputs.forEach(input => {
    input.addEventListener('input', function() {
      const tabName = this.closest('.tab-content').id;
      if (tabName === 'applications') {
        filterApplications();
      } else if (tabName === 'contacts') {
        filterContacts();
      }
    });
  });
  
  // Export buttons
  const exportButtons = document.querySelectorAll('[onclick*="export"]');
  exportButtons.forEach(button => {
    const onclickAttr = button.getAttribute('onclick');
    if (onclickAttr) {
      button.removeAttribute('onclick');
      if (onclickAttr.includes('exportToExcel')) {
        button.addEventListener('click', exportToExcel);
      } else if (onclickAttr.includes('exportToPDF')) {
        button.addEventListener('click', exportToPDF);
      } else if (onclickAttr.includes('exportReport')) {
        button.addEventListener('click', exportReport);
      }
    }
  });
  
  // Resume upload
  const resumeUpload = document.getElementById('resumeUpload');
  if (resumeUpload) {
    resumeUpload.addEventListener('change', handleResumeUpload);
  }
  
  // Template buttons
  const templateButtons = document.querySelectorAll('[onclick*="Template"], [onclick*="Email"]');
  templateButtons.forEach(button => {
    const onclickAttr = button.getAttribute('onclick');
    if (onclickAttr) {
      button.removeAttribute('onclick');
      if (onclickAttr.includes('loadTemplate')) {
        button.addEventListener('click', () => loadTemplate(button.dataset.template));
      } else if (onclickAttr.includes('copyEmail')) {
        button.addEventListener('click', copyEmail);
      } else if (onclickAttr.includes('openEmailClient')) {
        button.addEventListener('click', openEmailClient);
      } else if (onclickAttr.includes('saveTemplate')) {
        button.addEventListener('click', saveTemplate);
      }
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 's':
          e.preventDefault();
          if (window.jobTracker.currentTab === 'applications') {
            addApplicationFromForm();
          } else if (window.jobTracker.currentTab === 'contacts') {
            addContactFromForm();
          }
          break;
        case 'e':
          e.preventDefault();
          exportToExcel();
          break;
      }
    }
  });
  
  console.log('Event listeners setup complete');
}

// Legacy function - now handled by ApplicationsModule
function renderApplications() {
  if (window.ApplicationsModule && window.ApplicationsModule.renderApplications) {
    return window.ApplicationsModule.renderApplications();
  } else if (window.renderApplications) {
    return window.renderApplications();
  }
}

// Legacy function - now handled by ContactsModule
function renderContacts() {
  if (window.ContactsModule && window.ContactsModule.renderContacts) {
    return window.ContactsModule.renderContacts();
  } else if (window.renderContacts) {
    return window.renderContacts();
  }
}

// Set default values for forms
function setDefaultValues() {
  // Set default application date to today
  const applicationDateInput = document.getElementById('applicationDate');
  if (applicationDateInput && !applicationDateInput.value) {
    applicationDateInput.value = new Date().toISOString().split('T')[0];
  }
  
  // Set default status
  const statusSelect = document.getElementById('status');
  if (statusSelect && !statusSelect.value) {
    statusSelect.value = 'Applied';
  }
  
  // Set default priority
  const prioritySelect = document.getElementById('priority');
  if (prioritySelect && !prioritySelect.value) {
    prioritySelect.value = 'Medium';
  }
}

// Legacy function - now handled by ApplicationsModule
// Kept for backward compatibility but delegates to module
async function addApplicationLegacy() {
  if (window.ApplicationsModule) {
    // Try different methods on the module
    if (typeof window.ApplicationsModule.addApplicationFromForm === 'function') {
      return await window.ApplicationsModule.addApplicationFromForm();
    } else if (typeof window.ApplicationsModule.addApplication === 'function') {
      // Get form data
      const applicationData = {
        jobTitle: document.getElementById('jobTitle').value.trim(),
        company: document.getElementById('company').value.trim(),
        jobPortal: document.getElementById('jobPortal').value,
        jobUrl: document.getElementById('jobUrl').value.trim(),
        applicationDate: document.getElementById('applicationDate').value || new Date().toISOString().split('T')[0],
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
      return await window.ApplicationsModule.addApplication(applicationData);
    }
  }
  showErrorMessage('Applications module not available');
}

// Enhanced analytics with modern charts
function updateAnalytics() {
  const applications = window.jobTracker.applications;
  
  if (applications.length === 0) {
    // Show empty state
    updateStatsCards({
      totalApps: 0,
      interviewRate: 0,
      responseRate: 0,
      offerRate: 0,
      avgResponseTime: 0,
      pendingFollowUps: 0
    });
    return;
  }
  
  // Calculate statistics
  const stats = calculateStats(applications);
  updateStatsCards(stats);
  
  // Update charts with animations
  updateCharts(applications);
}

// Calculate application statistics
function calculateStats(applications) {
  const total = applications.length;
  
  if (total === 0) {
    return {
      totalApps: 0,
      interviewRate: 0,
      responseRate: 0,
      offerRate: 0,
      avgResponseTime: 0,
      pendingFollowUps: 0
    };
  }
  
  // Count different statuses
  const statusCounts = {};
  applications.forEach(app => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });
  
  // Calculate rates
  const interviewStatuses = ['Phone Screen', 'Technical Assessment', 'Interview Scheduled', 'Final Interview'];
  const responseStatuses = ['Under Review', 'Phone Screen', 'Technical Assessment', 'Interview Scheduled', 'Final Interview', 'Offer', 'Rejected'];
  
  const interviewCount = interviewStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  const responseCount = responseStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
  const offerCount = statusCounts['Offer'] || 0;
  
  // Calculate pending follow-ups
  const today = new Date();
  const pendingFollowUps = applications.filter(app => {
    if (!app.followUpDate) return false;
    const followUpDate = new Date(app.followUpDate);
    return followUpDate <= today && !['Offer', 'Rejected', 'Withdrawn'].includes(app.status);
  }).length;
  
  return {
    totalApps: total,
    interviewRate: Math.round((interviewCount / total) * 100),
    responseRate: Math.round((responseCount / total) * 100),
    offerRate: Math.round((offerCount / total) * 100),
    avgResponseTime: calculateAverageResponseTime(applications),
    pendingFollowUps: pendingFollowUps
  };
}

// Update stats cards with animation
function updateStatsCards(stats) {
  const statsElements = {
    totalApps: document.getElementById('totalApps'),
    interviewRate: document.getElementById('interviewRate'),
    responseRate: document.getElementById('responseRate'),
    offerRate: document.getElementById('offerRate'),
    avgResponseTime: document.getElementById('avgResponseTime'),
    pendingFollowUps: document.getElementById('pendingFollowUps')
  };
  
  Object.entries(stats).forEach(([key, value]) => {
    const element = statsElements[key];
    if (element) {
      // Animate number change
      animateNumber(element, value, key.includes('Rate') ? '%' : (key === 'avgResponseTime' ? ' days' : ''));
    }
  });
}

// Update charts with Chart.js
function updateCharts(applications) {
  updateStatusChart(applications);
  updateTimeChart(applications);
  updatePortalChart(applications);
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showSuccessMessage(message) {
  showMessage(message, 'success');
}

function showErrorMessage(message) {
  showMessage(message, 'error');
}

function showInfoMessage(message) {
  showMessage(message, 'info');
}

function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `${type}-message`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 300px;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(messageEl);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 5000);
}

function animateNumber(element, targetValue, suffix = '') {
  const startValue = parseInt(element.textContent) || 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function updateNumber(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
    
    element.textContent = currentValue + suffix;
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

function calculateAverageResponseTime(applications) {
  const responseTimes = applications
    .filter(app => app.status !== 'Applied' && app.applicationDate)
    .map(app => {
      const appDate = new Date(app.applicationDate);
      const today = new Date();
      return Math.floor((today - appDate) / (1000 * 60 * 60 * 24));
    });
  
  if (responseTimes.length === 0) return 0;
  
  const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  return Math.round(average);
}

function handleOnlineStatus() {
  window.jobTracker.isOnline = true;
  updateConnectionStatus(true);
  showInfoMessage('🌐 Back online! Syncing data...');
  
  // Try to sync pending data
  if (window.apiService && window.apiService.syncPendingData) {
    window.apiService.syncPendingData();
  }
}

function handleOfflineStatus() {
  window.jobTracker.isOnline = false;
  updateConnectionStatus(false);
  showInfoMessage('📡 Working offline. Data will sync when connection is restored.');
}

function updateConnectionStatus(isOnline) {
  // Update connection indicator if it exists
  const statusIndicator = document.querySelector('.connection-status');
  if (statusIndicator) {
    statusIndicator.className = isOnline ? 'connection-status online' : 'connection-status offline';
    statusIndicator.textContent = isOnline ? '🟢 Connected' : '🔴 Offline';
  }
  
  // Update page title to show offline status
  const originalTitle = document.title.replace(' (Offline)', '');
  document.title = isOnline ? originalTitle : originalTitle + ' (Offline)';
}

// Add API health monitoring
async function checkAPIHealth() {
  if (!window.apiService) return false;
  
  try {
    await window.apiService.checkHealth();
    return true;
  } catch (error) {
    console.warn('⚠️ API health check failed:', error.message);
    return false;
  }
}

// Periodic API health check
setInterval(async () => {
  if (navigator.onLine) {
    const apiHealthy = await checkAPIHealth();
    if (!apiHealthy && window.jobTracker.isOnline) {
      window.jobTracker.isOnline = false;
      updateConnectionStatus(false);
      showInfoMessage('⚠️ API connection lost. Working in offline mode.');
    } else if (apiHealthy && !window.jobTracker.isOnline) {
      window.jobTracker.isOnline = true;
      updateConnectionStatus(true);
      showInfoMessage('✅ API connection restored. Syncing data...');
      
      if (window.apiService && window.apiService.syncPendingData) {
        window.apiService.syncPendingData();
      }
    }
  }
}, 30000); // Check every 30 seconds

// Legacy function - now handled by ApplicationsModule
function clearForm() {
  if (window.ApplicationsModule && window.ApplicationsModule.clearForm) {
    return window.ApplicationsModule.clearForm();
  } else if (window.clearForm) {
    return window.clearForm();
  }
}

// Make functions globally available
window.switchTab = switchTab;
window.updateAnalytics = updateAnalytics;

// Global wrapper functions for HTML onclick handlers
window.addApplication = function() {
  return addApplicationFromForm();
};

window.clearForm = function() {
  return clearApplicationForm();
};

window.filterApplications = function() {
  if (window.ApplicationsModule && window.ApplicationsModule.filterApplications) {
    return window.ApplicationsModule.filterApplications();
  }
};

window.addContact = function() {
  return addContactFromForm();
};

window.clearContactForm = function() {
  if (window.ContactsModule && window.ContactsModule.clearForm) {
    return window.ContactsModule.clearForm();
  }
};

window.filterContacts = function() {
  if (window.ContactsModule && window.ContactsModule.filterContacts) {
    return window.ContactsModule.filterContacts();
  }
};

window.exportToExcel = function() {
  if (window.ExportModule && window.ExportModule.exportToExcel) {
    return window.ExportModule.exportToExcel();
  }
  showErrorMessage('Export functionality not available');
};

window.exportToPDF = function() {
  if (window.ExportModule && window.ExportModule.exportToPDF) {
    return window.ExportModule.exportToPDF();
  }
  showErrorMessage('PDF export functionality not available');
};

window.exportReport = function() {
  if (window.ExportModule && window.ExportModule.exportReport) {
    return window.ExportModule.exportReport();
  }
  showErrorMessage('Report export functionality not available');
};

window.importData = function() {
  if (window.ExportModule && window.ExportModule.importData) {
    return window.ExportModule.importData();
  }
  showErrorMessage('Import functionality not available');
};

window.createBackup = function() {
  if (window.ExportModule && window.ExportModule.createBackup) {
    return window.ExportModule.createBackup();
  }
  showErrorMessage('Backup functionality not available');
};

window.restoreBackup = function() {
  if (window.ExportModule && window.ExportModule.restoreBackup) {
    return window.ExportModule.restoreBackup();
  }
  showErrorMessage('Restore functionality not available');
};

window.loadTemplate = function(templateName) {
  if (window.TemplatesModule && window.TemplatesModule.loadTemplate) {
    return window.TemplatesModule.loadTemplate(templateName);
  }
  showErrorMessage('Template functionality not available');
};

window.copyEmail = function() {
  if (window.TemplatesModule && window.TemplatesModule.copyEmail) {
    return window.TemplatesModule.copyEmail();
  }
  showErrorMessage('Email copy functionality not available');
};

window.openEmailClient = function() {
  if (window.TemplatesModule && window.TemplatesModule.openEmailClient) {
    return window.TemplatesModule.openEmailClient();
  }
  showErrorMessage('Email client functionality not available');
};

window.saveTemplate = function() {
  if (window.TemplatesModule && window.TemplatesModule.saveTemplate) {
    return window.TemplatesModule.saveTemplate();
  }
  showErrorMessage('Template save functionality not available');
};

// Global wrapper functions for module methods
window.addApplicationFromForm = function() {
  if (window.ApplicationsModule && window.ApplicationsModule.addApplicationFromForm) {
    return window.ApplicationsModule.addApplicationFromForm();
  }
  return addApplicationLegacy();
};

window.clearApplicationForm = function() {
  if (window.ApplicationsModule && window.ApplicationsModule.clearForm) {
    return window.ApplicationsModule.clearForm();
  }
  // Fallback to manual form clearing
  const formInputs = document.querySelectorAll('#applications input, #applications select, #applications textarea');
  formInputs.forEach(input => {
    if (input.type === 'checkbox' || input.type === 'radio') {
      input.checked = false;
    } else {
      input.value = '';
    }
  });
  setDefaultValues();
};

window.addContactFromForm = function() {
  if (window.ContactsModule && window.ContactsModule.addContactFromForm) {
    return window.ContactsModule.addContactFromForm();
  }
  showErrorMessage('Contact functionality not available');
};

window.handleResumeUpload = function(event) {
  if (window.ResumesModule && window.ResumesModule.handleResumeUpload) {
    return window.ResumesModule.handleResumeUpload(event);
  }
  showErrorMessage('Resume upload functionality not available');
};

console.log('Enhanced Job Tracker app.js loaded successfully');
