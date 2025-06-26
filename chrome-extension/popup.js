// popup.js - FIXED Extension popup functionality

class JobTrackerPopup {
  constructor() {
    this.apiUrl = 'https://job-tracker-chi-eight.vercel.app'; // Production Vercel URL
    this.init();
  }

  async init() {
    try {
      await this.loadStats();
      await this.checkCurrentPage();
      await this.loadRecentActivity();
      await this.checkConnection();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      this.showError('Failed to initialize. Please refresh and try again.');
    }
  }

  async loadStats() {
    try {
      // Load from chrome storage
      const result = await chrome.storage.local.get(['jobApplications']);
      const applications = result.jobApplications || [];
      
      // Calculate stats
      const totalApps = applications.length;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const thisWeek = applications.filter(app => 
        new Date(app.dateAdded || app.applicationDate) > weekAgo
      ).length;

      // Update UI with proper error handling
      const totalEl = document.getElementById('total-apps');
      const weekEl = document.getElementById('this-week');
      
      if (totalEl) totalEl.textContent = totalApps;
      if (weekEl) weekEl.textContent = thisWeek;

      console.log('Stats loaded:', { totalApps, thisWeek });

    } catch (error) {
      console.error('Failed to load stats:', error);
      const totalEl = document.getElementById('total-apps');
      const weekEl = document.getElementById('this-week');
      
      if (totalEl) totalEl.textContent = '?';
      if (weekEl) weekEl.textContent = '?';
    }
  }

  async checkCurrentPage() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const statusEl = document.getElementById('page-status');
      const trackBtn = document.getElementById('track-current');
      
      if (!tab || !tab.url) {
        if (statusEl) statusEl.textContent = 'Unable to analyze this page';
        if (trackBtn) trackBtn.disabled = true;
        return;
      }

      const hostname = new URL(tab.url).hostname.toLowerCase();
      const jobSites = [
        { domain: 'linkedin', name: 'LinkedIn' },
        { domain: 'indeed', name: 'Indeed' },
        { domain: 'glassdoor', name: 'Glassdoor' },
        { domain: 'angel', name: 'AngelList' },
        { domain: 'wellfound', name: 'Wellfound' },
        { domain: 'ziprecruiter', name: 'ZipRecruiter' },
        { domain: 'monster', name: 'Monster' },
        { domain: 'careerbuilder', name: 'CareerBuilder' },
        { domain: 'dice', name: 'Dice' }
      ];
      
      const detectedSite = jobSites.find(site => hostname.includes(site.domain));
      
      if (detectedSite) {
        if (statusEl) {
          statusEl.textContent = `✅ Job site detected: ${detectedSite.name}`;
          statusEl.style.color = '#28a745';
        }
        if (trackBtn) {
          trackBtn.disabled = false;
          trackBtn.textContent = `Track Job on ${detectedSite.name}`;
        }
      } else {
        if (statusEl) {
          statusEl.textContent = '⚠️ Not a recognized job site';
          statusEl.style.color = '#ffc107';
        }
        if (trackBtn) {
          trackBtn.disabled = false;
          trackBtn.textContent = 'Track This Page';
        }
      }

      console.log('Page checked:', { hostname, detectedSite });

    } catch (error) {
      console.error('Failed to check current page:', error);
      const statusEl = document.getElementById('page-status');
      if (statusEl) statusEl.textContent = 'Unable to analyze page';
    }
  }

  async loadRecentActivity() {
    try {
      const result = await chrome.storage.local.get(['jobApplications']);
      const applications = result.jobApplications || [];
      
      // Get last 3 applications
      const recent = applications
        .sort((a, b) => new Date(b.dateAdded || b.applicationDate) - new Date(a.dateAdded || a.applicationDate))
        .slice(0, 3);

      const recentList = document.getElementById('recent-list');
      
      if (!recentList) return;
      
      if (recent.length === 0) {
        recentList.innerHTML = '<div class="activity-item">No applications tracked yet</div>';
        return;
      }

      recentList.innerHTML = recent.map(app => `
        <div class="activity-item">
          <strong>${this.escapeHtml(app.jobTitle || 'Unknown Job')}</strong> at ${this.escapeHtml(app.company || 'Unknown Company')}
          <br>
          <span style="color: #999; font-size: 0.8em;">
            ${this.formatDate(app.dateAdded || app.applicationDate)} • ${this.escapeHtml(app.status || 'Applied')}
          </span>
        </div>
      `).join('');

      console.log('Recent activity loaded:', recent.length, 'applications');

    } catch (error) {
      console.error('Failed to load recent activity:', error);
      const recentList = document.getElementById('recent-list');
      if (recentList) {
        recentList.innerHTML = '<div class="activity-item">Failed to load recent activity</div>';
      }
    }
  }

  async checkConnection() {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;
    
    try {
      // Test connection to the API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.apiUrl}/api/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        statusEl.className = 'status-indicator status-connected';
        statusEl.innerHTML = '<div class="status-dot"></div><span>✅ Connected to cloud</span>';
      } else {
        throw new Error('API not responding');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Connection check timed out');
      } else {
        console.log('Connection check failed:', error.message);
      }
      
      statusEl.className = 'status-indicator status-offline';
      statusEl.innerHTML = '<div class="status-dot"></div><span>📱 Offline mode (local storage)</span>';
    }
  }

  setupEventListeners() {
    // Track current job button
    const trackBtn = document.getElementById('track-current');
    if (trackBtn) {
      trackBtn.addEventListener('click', async () => {
        try {
          trackBtn.disabled = true;
          trackBtn.textContent = 'Opening tracker...';
          
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          
          // Try to send message to content script
          try {
            await chrome.tabs.sendMessage(tab.id, { 
              action: 'showJobTracker' 
            });
            console.log('Message sent to content script');
          } catch (messageError) {
            console.log('Content script not available, injecting...');
            await this.injectContentScript();
          }
          
          window.close();
          
        } catch (error) {
          console.error('Failed to track current job:', error);
          trackBtn.disabled = false;
          trackBtn.textContent = 'Track This Job';
          this.showError('Failed to open job tracker. Please try refreshing the page.');
        }
      });
    }

    // Open tracker button
    const openBtn = document.getElementById('open-tracker');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        chrome.tabs.create({ 
          url: this.apiUrl 
        });
        window.close();
      });
    }

    // View applications button
    const viewBtn = document.getElementById('view-applications');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        chrome.tabs.create({ 
          url: `${this.apiUrl}/#applications` 
        });
        window.close();
      });
    }

    // Settings link
    const settingsLink = document.getElementById('settings-link');
    if (settingsLink) {
      settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ 
          url: `${this.apiUrl}/#export` 
        });
        window.close();
      });
    }

    // Help link
    const helpLink = document.getElementById('help-link');
    if (helpLink) {
      helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ 
          url: `${this.apiUrl}/#help` 
        });
        window.close();
      });
    }
  }

  async injectContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Check if we can access the tab
      if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('Cannot access this page type');
      }
      
      console.log('Injecting content script into tab:', tab.id);
      
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Inject CSS
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });

      console.log('Content script and CSS injected successfully');

      // Wait a moment then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'showJobTracker' 
          });
          console.log('Message sent after injection');
          window.close();
        } catch (error) {
          console.error('Failed to send message after injection:', error);
          this.showError('Content script injected but failed to communicate. Please try again.');
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to inject content script:', error);
      
      let errorMessage = 'Unable to track job on this page.';
      
      if (error.message.includes('Cannot access')) {
        errorMessage = 'Cannot track jobs on browser pages. Please visit a job posting page.';
      } else if (error.message.includes('activeTab')) {
        errorMessage = 'Extension needs permission to access this page. Please refresh and try again.';
      }
      
      this.showError(errorMessage);
    }
  }

  showError(message) {
    // Create or update error message
    let errorEl = document.getElementById('error-message');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'error-message';
      errorEl.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 6px;
        margin: 10px 0;
        font-size: 0.9em;
        border: 1px solid #f5c6cb;
      `;
      
      const content = document.querySelector('.content');
      if (content) {
        content.appendChild(errorEl);
      }
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }, 5000);
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Method to sync local data to cloud
  async syncToCloud() {
    try {
      const result = await chrome.storage.local.get(['jobApplications', 'jobContacts', 'jobResumes']);
      
      if (!result.jobApplications || result.jobApplications.length === 0) {
        console.log('No data to sync');
        return;
      }

      const response = await fetch(`${this.apiUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applications: result.jobApplications || [],
          contacts: result.jobContacts || [],
          resumes: result.jobResumes || []
        })
      });

      if (response.ok) {
        console.log('Data synced to cloud successfully');
        await chrome.storage.local.set({ lastSync: new Date().toISOString() });
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM loaded, initializing...');
  try {
    new JobTrackerPopup();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    
    // Show basic error message
    const content = document.querySelector('.content');
    if (content) {
      content.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #721c24;">
          <h3>⚠️ Extension Error</h3>
          <p>Failed to initialize Job Tracker extension.</p>
          <button onclick="window.close()" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
      `;
    }
  }
});

// Handle chrome extension errors
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Popup received message:', message);
  sendResponse({ received: true });
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobTrackerPopup;
}