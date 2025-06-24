// popup.js - Extension popup functionality

class JobTrackerPopup {
  constructor() {
    this.apiUrl = 'job-tracker-5q3lneriz-mario263s-projects.vercel.app';
    this.init();
  }

  async init() {
    await this.loadStats();
    await this.checkCurrentPage();
    await this.loadRecentActivity();
    await this.checkConnection();
    this.setupEventListeners();
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
        new Date(app.dateAdded) > weekAgo
      ).length;

      // Update UI
      document.getElementById('total-apps').textContent = totalApps;
      document.getElementById('this-week').textContent = thisWeek;

    } catch (error) {
      console.error('Failed to load stats:', error);
      document.getElementById('total-apps').textContent = '?';
      document.getElementById('this-week').textContent = '?';
    }
  }

  async checkCurrentPage() {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        document.getElementById('page-status').textContent = 'Unable to analyze this page';
        document.getElementById('track-current').disabled = true;
        return;
      }

      const hostname = new URL(tab.url).hostname.toLowerCase();
      const jobSites = ['linkedin', 'indeed', 'glassdoor', 'angel', 'wellfound', 'ziprecruiter'];
      
      if (jobSites.some(site => hostname.includes(site))) {
        document.getElementById('page-status').textContent = `Job site detected: ${this.formatSiteName(hostname)}`;
        document.getElementById('track-current').disabled = false;
      } else {
        document.getElementById('page-status').textContent = 'Not a recognized job site';
        document.getElementById('track-current').disabled = false; // Still allow manual tracking
      }

    } catch (error) {
      console.error('Failed to check current page:', error);
      document.getElementById('page-status').textContent = 'Unable to analyze page';
    }
  }

  formatSiteName(hostname) {
    if (hostname.includes('linkedin')) return 'LinkedIn';
    if (hostname.includes('indeed')) return 'Indeed';
    if (hostname.includes('glassdoor')) return 'Glassdoor';
    if (hostname.includes('angel') || hostname.includes('wellfound')) return 'AngelList/Wellfound';
    if (hostname.includes('ziprecruiter')) return 'ZipRecruiter';
    return 'Job Site';
  }

  async loadRecentActivity() {
    try {
      const result = await chrome.storage.local.get(['jobApplications']);
      const applications = result.jobApplications || [];
      
      // Get last 3 applications
      const recent = applications
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 3);

      const recentList = document.getElementById('recent-list');
      
      if (recent.length === 0) {
        recentList.innerHTML = '<div class="activity-item">No applications tracked yet</div>';
        return;
      }

      recentList.innerHTML = recent.map(app => `
        <div class="activity-item">
          <strong>${app.jobTitle}</strong> at ${app.company}
          <br>
          <span style="color: #999;">${this.formatDate(app.dateAdded)} • ${app.status}</span>
        </div>
      `).join('');

    } catch (error) {
      console.error('Failed to load recent activity:', error);
      document.getElementById('recent-list').innerHTML = 
        '<div class="activity-item">Failed to load recent activity</div>';
    }
  }

  async checkConnection() {
    const statusEl = document.getElementById('connection-status');
    
    try {
      // Try to reach the API
      const response = await fetch(`${this.apiUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        statusEl.className = 'status-indicator status-connected';
        statusEl.innerHTML = '<div class="status-dot"></div><span>Connected to cloud</span>';
      } else {
        throw new Error('API not responding');
      }
    } catch (error) {
      statusEl.className = 'status-indicator status-offline';
      statusEl.innerHTML = '<div class="status-dot"></div><span>Offline mode (local storage)</span>';
    }
  }

  setupEventListeners() {
    // Track current job button
    document.getElementById('track-current').addEventListener('click', async () => {
      try {
        // Send message to content script to show job tracker
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'showJobTracker' 
        });
        
        // Close popup
        window.close();
        
      } catch (error) {
        console.error('Failed to track current job:', error);
        // If content script not available, inject it
        await this.injectContentScript();
      }
    });

    // Open tracker button
    document.getElementById('open-tracker').addEventListener('click', () => {
      chrome.tabs.create({ 
        url: 'https://job-tracker-mario263.vercel.app' 
      });
      window.close();
    });

    // View applications button
    document.getElementById('view-applications').addEventListener('click', () => {
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('applications.html') 
      });
      window.close();
    });

    // Settings link
    document.getElementById('settings-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('options.html') 
      });
      window.close();
    });

    // Help link
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ 
        url: 'https://job-tracker-mario263.vercel.app/help' 
      });
      window.close();
    });
  }

  async injectContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
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

      // Wait a moment then send message
      setTimeout(async () => {
        try {
          await chrome.tabs.sendMessage(tab.id, { 
            action: 'showJobTracker' 
          });
          window.close();
        } catch (error) {
          console.error('Failed to show job tracker after injection:', error);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to inject content script:', error);
      alert('Unable to track job on this page. Please visit a job posting page.');
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new JobTrackerPopup();
});
