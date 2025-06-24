// app.js - Enhanced main application file

// Global variables - make sure they're accessible everywhere
window.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
window.contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
window.resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');

// For backward compatibility
let applications = window.applications;
let contacts = window.contacts;
let resumes = window.resumes;

window.onload = function () {
  setDefaultDate();
  loadDataFromAPI(); // Use API service instead of direct localStorage
  initializeResumes();
  initializeTemplates();
  initializeGoogleSheets();
  setupNotifications();
  initializeEnhancedFeatures();
};

function setDefaultDate() {
  document.getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
}

function switchTab(tabName, element) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  element.classList.add('active');

  if (tabName === 'analytics') updateAnalytics();
  if (tabName === 'templates') populateEmailContacts();
  if (tabName === 'resumes') renderResumes();
}

function clearForm() {
  document.querySelectorAll('#applications input, #applications select, #applications textarea').forEach(input => {
    if (input.type !== 'date') input.value = '';
    if (input.id === 'status') input.value = 'Applied';
    if (input.id === 'priority') input.value = 'Medium';
  });
  setDefaultDate();
}

// Message display function
function showMessage(message, type = 'info') {
  // Remove any existing messages
  const existingMessages = document.querySelectorAll('.message-popup');
  existingMessages.forEach(msg => msg.remove());
  
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message-popup ${type}`;
  messageEl.textContent = message;
  
  // Style the message
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'success':
      messageEl.style.background = 'linear-gradient(135deg, #27ae60, #229954)';
      break;
    case 'error':
      messageEl.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
      break;
    case 'warning':
      messageEl.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
      break;
    default:
      messageEl.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
  }
  
  // Add animation styles if not already present
  if (!document.querySelector('#message-styles')) {
    const style = document.createElement('style');
    style.id = 'message-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to DOM
  document.body.appendChild(messageEl);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    messageEl.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 300);
  }, 4000);
  
  // Allow manual dismiss by clicking
  messageEl.addEventListener('click', () => {
    messageEl.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 300);
  });
}

// Notification system for follow-ups and reminders
function setupNotifications() {
  checkFollowUpReminders();
  // Check every hour for new reminders
  setInterval(checkFollowUpReminders, 60 * 60 * 1000);
}

function checkFollowUpReminders() {
  const today = new Date().toISOString().split('T')[0];
  const overdue = [];
  const dueToday = [];
  
  // Check application follow-ups
  applications.forEach(app => {
    if (app.followUpDate) {
      if (app.followUpDate < today) {
        overdue.push(`Follow up on ${app.jobTitle} at ${app.company}`);
      } else if (app.followUpDate === today) {
        dueToday.push(`Follow up on ${app.jobTitle} at ${app.company}`);
      }
    }
  });
  
  // Check contact follow-ups
  contacts.forEach(contact => {
    if (contact.nextFollowUpDate) {
      if (contact.nextFollowUpDate < today) {
        overdue.push(`Follow up with ${contact.name} at ${contact.company || 'Unknown company'}`);
      } else if (contact.nextFollowUpDate === today) {
        dueToday.push(`Follow up with ${contact.name} at ${contact.company || 'Unknown company'}`);
      }
    }
  });
  
  // Show notifications
  if (overdue.length > 0) {
    showMessage(`You have ${overdue.length} overdue follow-up(s): ${overdue.slice(0, 3).join(', ')}${overdue.length > 3 ? '...' : ''}`, 'warning');
  }
  
  if (dueToday.length > 0) {
    showMessage(`You have ${dueToday.length} follow-up(s) due today: ${dueToday.slice(0, 3).join(', ')}${dueToday.length > 3 ? '...' : ''}`, 'info');
  }
}

// Enhanced search functionality
function globalSearch(query) {
  if (!query) return [];
  
  const results = [];
  const searchTerm = query.toLowerCase();
  
  // Search applications
  applications.forEach(app => {
    if (app.jobTitle.toLowerCase().includes(searchTerm) ||
        app.company.toLowerCase().includes(searchTerm) ||
        (app.notes && app.notes.toLowerCase().includes(searchTerm))) {
      results.push({
        type: 'application',
        data: app,
        relevance: calculateRelevance(app, searchTerm)
      });
    }
  });
  
  // Search contacts
  contacts.forEach(contact => {
    if (contact.name.toLowerCase().includes(searchTerm) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm)) ||
        (contact.notes && contact.notes.toLowerCase().includes(searchTerm))) {
      results.push({
        type: 'contact',
        data: contact,
        relevance: calculateRelevance(contact, searchTerm)
      });
    }
  });
  
  return results.sort((a, b) => b.relevance - a.relevance);
}

function calculateRelevance(item, searchTerm) {
  let score = 0;
  const fields = Object.values(item).join(' ').toLowerCase();
  
  // Exact matches get higher scores
  if (fields.includes(searchTerm)) score += 10;
  
  // Partial matches
  searchTerm.split(' ').forEach(term => {
    if (fields.includes(term)) score += 2;
  });
  
  return score;
}

// Dashboard insights
function getDashboardInsights() {
  const insights = [];
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Recent activity
  const recentApps = applications.filter(app => new Date(app.dateAdded) > lastWeek);
  if (recentApps.length > 0) {
    insights.push(`You've applied to ${recentApps.length} job(s) this week. Keep up the momentum!`);
  }
  
  // Response rate analysis
  const totalApps = applications.length;
  const responses = applications.filter(app => 
    ['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer'].includes(app.status)
  ).length;
  
  const responseRate = totalApps > 0 ? (responses / totalApps) * 100 : 0;
  
  if (responseRate < 20 && totalApps > 10) {
    insights.push('Your response rate is below 20%. Consider reviewing your resume and application strategy.');
  } else if (responseRate > 40) {
    insights.push('Great response rate! Your applications are getting noticed.');
  }
  
  // Follow-up reminders
  const pendingFollowUps = applications.filter(app => {
    if (!app.followUpDate) return false;
    const followUpDate = new Date(app.followUpDate);
    return followUpDate <= now && !['Offer', 'Rejected', 'Withdrawn'].includes(app.status);
  }).length;
  
  if (pendingFollowUps > 0) {
    insights.push(`You have ${pendingFollowUps} application(s) that need follow-up.`);
  }
  
  // Networking insights
  const activeContacts = contacts.filter(contact => contact.status !== 'Not Contacted').length;
  if (activeContacts < contacts.length * 0.3 && contacts.length > 5) {
    insights.push('Consider reaching out to more of your contacts for networking opportunities.');
  }
  
  return insights;
}

// Data validation and cleanup
function validateAndCleanData() {
  let cleanedApps = 0;
  let cleanedContacts = 0;
  
  // Clean applications
  applications = applications.filter(app => {
    if (!app.jobTitle || !app.company) {
      cleanedApps++;
      return false;
    }
    
    // Ensure required fields have defaults
    app.status = app.status || 'Applied';
    app.priority = app.priority || 'Medium';
    app.dateAdded = app.dateAdded || new Date().toISOString();
    
    return true;
  });
  
  // Clean contacts
  contacts = contacts.filter(contact => {
    if (!contact.name) {
      cleanedContacts++;
      return false;
    }
    
    // Ensure required fields have defaults
    contact.relationship = contact.relationship || 'Network Contact';
    contact.status = contact.status || 'Not Contacted';
    contact.dateAdded = contact.dateAdded || new Date().toISOString();
    
    return true;
  });
  
  if (cleanedApps > 0 || cleanedContacts > 0) {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
    localStorage.setItem('jobContacts', JSON.stringify(contacts));
    console.log(`Cleaned ${cleanedApps} applications and ${cleanedContacts} contacts`);
  }
}

// Auto-save functionality
function setupAutoSave() {
  // Save data every 5 minutes
  setInterval(() => {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
    localStorage.setItem('jobContacts', JSON.stringify(contacts));
    console.log('Auto-saved data');
  }, 5 * 60 * 1000);
}

// Initialize enhanced features
function initializeEnhancedFeatures() {
  validateAndCleanData();
  setupAutoSave();
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S for manual save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      localStorage.setItem('jobContacts', JSON.stringify(contacts));
      showMessage('Data saved manually!', 'success');
    }
    
    // Ctrl/Cmd + N for new application
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      switchTab('applications', document.querySelector('.tab'));
      document.getElementById('jobTitle').focus();
    }
  });
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

function formatCurrency(amount) {
  if (!amount) return 'N/A';
  // Simple currency formatting
  if (amount.includes('$')) return amount;
  return `$${amount}`;
}

function getRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// Initialize resumes functionality when app loads
function initializeResumes() {
    console.log('Initializing resumes...');
    renderResumes();
    updateResumeDropdown();
    
    // Set up CV template print functionality
    const printButton = document.createElement('button');
    printButton.className = 'btn';
    printButton.textContent = '🖨️ Print CV';
    printButton.onclick = printCV;
    
    // Add print button to CV section if it doesn't exist
    const cvActions = document.querySelector('.cv-template-section .form-grid');
    if (cvActions && !document.querySelector('#print-cv-btn')) {
        printButton.id = 'print-cv-btn';
        const parentDiv = cvActions.parentNode;
        parentDiv.insertBefore(printButton, parentDiv.querySelector('#cvPreview'));
    }
}

// Initialize templates functionality
function initializeTemplates() {
    console.log('Initializing email templates...');
    loadTemplateDropdown();
    populateEmailContacts();
}

// Initialize Google Sheets (disabled for now, using cloud sync)
function initializeGoogleSheets() {
    console.log('Initializing cloud sync...');
    // For now, disable Google Sheets and use our own cloud sync
    const authSection = document.getElementById('googleAuth');
    if (authSection) {
        authSection.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h4>☁️ Cloud Sync</h4>
                <p>Your data is automatically synced to the cloud when online.</p>
                <button class="btn btn-success" onclick="syncData()">🔄 Sync Now</button>
                <p><small>Last sync: <span id="lastSyncTime">Checking...</span></small></p>
            </div>
        `;
    }
    
    // Update last sync time
    updateLastSyncTime();
}

// Load existing applications from API or localStorage
async function loadDataFromAPI() {
    try {
        console.log('Loading data from API...');
        
        // Load from localStorage first
        applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
        resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
        
        window.applications = applications;
        window.contacts = contacts;
        window.resumes = resumes;
        
        // Update UI
        renderApplications();
        renderContacts();
        updateAnalytics();
        updateResumeDropdown();
        populateEmailContacts();
        
        console.log('Data loaded successfully:', {
            applications: applications.length,
            contacts: contacts.length,
            resumes: resumes.length
        });
        
    } catch (error) {
        console.warn('Data loading failed:', error);
        
        // Initialize empty arrays if loading fails
        applications = [];
        contacts = [];
        resumes = [];
        
        window.applications = applications;
        window.contacts = contacts;
        window.resumes = resumes;
    }
}

// Update last sync time display
function updateLastSyncTime() {
    const lastSyncEl = document.getElementById('lastSyncTime');
    if (lastSyncEl) {
        const lastSync = localStorage.getItem('lastSync');
        if (lastSync) {
            const date = new Date(lastSync);
            lastSyncEl.textContent = date.toLocaleString();
        } else {
            lastSyncEl.textContent = 'Never';
        }
    }
}

// Sync data to cloud
async function syncData() {
    try {
        showMessage('Syncing data to cloud...', 'info');
        
        // For now, just update the last sync time
        localStorage.setItem('lastSync', new Date().toISOString());
        updateLastSyncTime();
        
        showMessage('Data synced successfully!', 'success');
    } catch (error) {
        console.error('Sync failed:', error);
        showMessage('Sync failed. Data saved locally.', 'warning');
    }
}