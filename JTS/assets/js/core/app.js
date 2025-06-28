// app.js - Enhanced Job Tracker with Modern UI and API Integration

// Global state management
window.jobTracker = {
  applications: [],
  contacts: [],
  resumes: [],
  currentTab: 'applications',
  isOnline: navigator.onLine,
  syncStatus: 'idle'
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

// Load all data from API or localStorage
async function loadAllData() {
  try {
    console.log('Loading data...');
    
    // Check if apiService is available and working
    if (window.apiService) {
      try {
        // Test connection to backend on correct port
        const health = await window.apiService.checkHealth();
        if (health.status === 'OK') {
          console.log('✅ API connection successful');
          window.jobTracker.applications = await window.apiService.getApplicationsHybrid();
        } else {
          throw new Error('API health check failed');
        }
      } catch (apiError) {
        console.log('⚠️ API unavailable, using localStorage:', apiError.message);
        window.jobTracker.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      }
    } else {
      window.jobTracker.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    }
    
    console.log(`Loaded ${window.jobTracker.applications.length} applications`);
    
    // Load contacts
    window.jobTracker.contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    console.log(`Loaded ${window.jobTracker.contacts.length} contacts`);
    
    // Load resumes from localStorage (file data)
    window.jobTracker.resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
    console.log(`Loaded ${window.jobTracker.resumes.length} resumes`);
    
    // Update global references for backward compatibility
    window.applications = window.jobTracker.applications;
    window.contacts = window.jobTracker.contacts;
    window.resumes = window.jobTracker.resumes;
    
  } catch (error) {
    console.error('Error loading data:', error);
    
    // Fallback to localStorage
    window.jobTracker.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    window.jobTracker.contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    window.jobTracker.resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
  }
}

// Initialize UI components
function initializeUI() {
  // Render initial data
  renderApplications();
  renderContacts();
  renderResumes();
  updateResumeDropdown();
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
  // Online/offline status
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
}

// Enhanced application rendering with animations
function renderApplications() {
  const tbody = document.getElementById('applicationsBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (window.jobTracker.applications.length === 0) {
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
  
  window.jobTracker.applications.forEach((app, index) => {
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
      <td>${app.followUpDate ? formatDate(app.followUpDate) : 'N/A'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm" onclick="editApplication(${app.id || index})" title="Edit">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteApplication(${app.id || index})" title="Delete">
            🗑️
          </button>
          ${app.jobUrl ? `<a href="${app.jobUrl}" target="_blank" class="btn btn-sm" title="View Job">🔗</a>` : ''}
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Enhanced contact rendering
function renderContacts() {
  const contactsList = document.getElementById('contactsList');
  if (!contactsList) return;
  
  contactsList.innerHTML = '';
  
  if (window.jobTracker.contacts.length === 0) {
    contactsList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
        <h3>No contacts yet</h3>
        <p>Start building your professional network by adding contacts above.</p>
      </div>
    `;
    return;
  }
  
  window.jobTracker.contacts.forEach((contact, index) => {
    const contactCard = document.createElement('div');
    contactCard.className = 'contact-card';
    
    contactCard.innerHTML = `
      <h4>${escapeHtml(contact.name)}</h4>
      ${contact.company ? `<p><strong>Company:</strong> ${escapeHtml(contact.company)}</p>` : ''}
      ${contact.position ? `<p><strong>Position:</strong> ${escapeHtml(contact.position)}</p>` : ''}
      ${contact.email ? `<p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>` : ''}
      ${contact.phone ? `<p><strong>Phone:</strong> <a href="tel:${contact.phone}">${contact.phone}</a></p>` : ''}
      ${contact.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${contact.linkedinUrl}" target="_blank">View Profile</a></p>` : ''}
      <p><strong>Relationship:</strong> ${contact.relationship}</p>
      <p><strong>Status:</strong> <span class="status-badge">${contact.contactStatus}</span></p>
      ${contact.tags ? `<p><strong>Tags:</strong> ${escapeHtml(contact.tags)}</p>` : ''}
      ${contact.notes ? `<p><strong>Notes:</strong> ${escapeHtml(contact.notes)}</p>` : ''}
      
      <div class="contact-actions">
        <button class="btn btn-sm" onclick="editContact(${contact.id || index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id || index})">Delete</button>
        ${contact.email ? `<button class="btn btn-sm btn-primary" onclick="composeEmail('${contact.email}', '${contact.name}')">Email</button>` : ''}
      </div>
    `;
    
    contactsList.appendChild(contactCard);
  });
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

// Enhanced application adding with validation and API sync
async function addApplication() {
  console.log('Adding new application...');
  
  // Get form data
  const applicationData = {
    id: Date.now() + Math.random(),
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
  
  // Validate required fields
  if (!applicationData.jobTitle || !applicationData.company) {
    showErrorMessage('Please fill in Job Title and Company');
    return;
  }
  
  try {
    // Add to local state immediately for responsive UI
    window.jobTracker.applications.push(applicationData);
    
    // Update localStorage as backup
    localStorage.setItem('jobApplications', JSON.stringify(window.jobTracker.applications));
    
    // Try to save to API if available
    if (window.apiService) {
      try {
        await window.apiService.saveApplication(applicationData);
        showSuccessMessage('Application saved successfully!');
      } catch (error) {
        console.log('Saved locally, will sync when online');
        showInfoMessage('Application saved locally. Will sync when connection is restored.');
      }
    } else {
      showSuccessMessage('Application saved successfully!');
    }
    
    // Update UI
    renderApplications();
    updateAnalytics();
    clearForm();
    
  } catch (error) {
    console.error('Error adding application:', error);
    showErrorMessage('Failed to save application. Please try again.');
    
    // Remove from local state if it was added
    window.jobTracker.applications.pop();
  }
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
  showInfoMessage('Back online! Syncing data...');
  
  // Try to sync pending data
  if (window.apiService && window.apiService.syncPendingData) {
    window.apiService.syncPendingData();
  }
}

function handleOfflineStatus() {
  window.jobTracker.isOnline = false;
  showInfoMessage('Working offline. Data will sync when connection is restored.');
}

// Clear application form
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

// Make functions globally available
window.switchTab = switchTab;
window.addApplication = addApplication;
window.clearForm = clearForm;
window.updateAnalytics = updateAnalytics;

console.log('Enhanced Job Tracker app.js loaded successfully');
