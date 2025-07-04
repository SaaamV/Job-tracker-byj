// Simplified popup.js - Chrome extension popup interface

class ExtensionPopup {
  constructor() {
    this.currentTab = null;
    this.jobData = {};
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Extension Popup...');
    
    try {
      await this.getCurrentTab();
      await this.loadJobData();
      this.setupEventListeners();
      this.updateUI();
      
      console.log('✅ Extension Popup initialized');
    } catch (error) {
      console.error('❌ Failed to initialize popup:', error);
      this.showError('Failed to initialize extension');
    }
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tab;
  }

  async loadJobData() {
    if (!this.currentTab) return;
    
    try {
      // Try to get job data from content script
      const response = await chrome.tabs.sendMessage(this.currentTab.id, { 
        action: 'getJobData' 
      });
      this.jobData = response?.data || {};
    } catch (error) {
      console.log('Content script not available:', error);
      this.jobData = {};
    }
  }

  setupEventListeners() {
    // Track Job button
    document.getElementById('trackJobBtn').addEventListener('click', () => {
      this.trackCurrentJob();
    });

    // Open Tracker button  
    document.getElementById('openTrackerBtn').addEventListener('click', () => {
      this.openJobTracker();
    });

    // Connection Test button
    document.getElementById('testConnectionBtn').addEventListener('click', () => {
      this.testConnection();
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.openSettings();
    });
  }

  updateUI() {
    // Update site info
    const siteInfo = document.getElementById('siteInfo');
    const hostname = this.currentTab?.url ? new URL(this.currentTab.url).hostname : 'unknown';
    siteInfo.textContent = hostname;

    // Update job data display
    const jobInfo = document.getElementById('jobInfo');
    if (this.jobData.jobTitle || this.jobData.company) {
      jobInfo.innerHTML = `
        <div class="job-details">
          <div><strong>Title:</strong> ${this.jobData.jobTitle || 'Not detected'}</div>
          <div><strong>Company:</strong> ${this.jobData.company || 'Not detected'}</div>
        </div>
      `;
    } else {
      jobInfo.innerHTML = '<div class="no-job-data">No job data detected on this page</div>';
    }

    // Update track button state
    const trackBtn = document.getElementById('trackJobBtn');
    if (this.jobData.jobTitle || this.jobData.company) {
      trackBtn.disabled = false;
      trackBtn.textContent = '📊 Track This Job';
    } else {
      trackBtn.disabled = true;
      trackBtn.textContent = 'No Job Detected';
    }
  }

  async trackCurrentJob() {
    if (!this.currentTab) return;
    
    try {
      this.showLoading('Tracking job...');
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'showJobTracker'
      });
      
      if (response?.success) {
        this.showSuccess('Job tracker opened!');
        setTimeout(() => window.close(), 1000);
      } else {
        throw new Error('Failed to open job tracker');
      }
    } catch (error) {
      console.error('Failed to track job:', error);
      this.showError('Failed to open job tracker. Please try refreshing the page.');
    }
  }

  async openJobTracker() {
    try {
      await chrome.tabs.create({
        url: 'http://localhost:8080',
        active: true
      });
      window.close();
    } catch (error) {
      console.error('Failed to open tracker:', error);
      this.showError('Failed to open job tracker');
    }
  }

  async testConnection() {
    try {
      this.showLoading('Testing connection...');
      
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection'
      });
      
      if (response?.connected) {
        this.showSuccess('✅ Connected to cloud API');
      } else {
        this.showWarning('⚠️ Cloud API not available');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showError('❌ Connection test failed');
    }
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  showLoading(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status loading';
  }

  showSuccess(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status success';
    setTimeout(() => this.clearStatus(), 3000);
  }

  showError(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status error';
    setTimeout(() => this.clearStatus(), 5000);
  }

  showWarning(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status warning';
    setTimeout(() => this.clearStatus(), 4000);
  }

  clearStatus() {
    const status = document.getElementById('status');
    status.textContent = '';
    status.className = 'status';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ExtensionPopup();
});