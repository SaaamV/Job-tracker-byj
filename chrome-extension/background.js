// background.js - Extension background service worker

class JobTrackerBackground {
  constructor() {
    this.apiUrl = 'https://job-tracker-git-main-mario263s-projects.vercel.app/api';
   
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPeriodicSync();
    console.log('Job Tracker Extension Background Service Worker initialized');
  }

  setupEventListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.onFirstInstall();
      } else if (details.reason === 'update') {
        this.onUpdate();
      }
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle tab updates to inject content script
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.checkAndInjectContentScript(tabId, tab.url);
      }
    });

    // Handle storage changes for sync
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.jobApplications) {
        this.syncDataToCloud();
      }
    });
  }

  async onFirstInstall() {
    console.log('Job Tracker Extension installed for the first time');
    
    // Set default settings
    await chrome.storage.local.set({
      settings: {
        autoSync: true,
        notifications: true,
        autoDetectApply: true,
        quickSaveEnabled: true
      },
      jobApplications: [],
      lastSync: null
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'https://job-tracker-chi-eight.vercel.app/'
    });
  }

  async onUpdate() {
    console.log('Job Tracker Extension updated');
    
    // Migrate data if needed
    await this.migrateData();
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'notifyApplicationAdded':
          await this.handleApplicationNotification(message.application, message.frontendUrl);
          sendResponse({ success: true });
          break;

        case 'saveApplication':
          const result = await this.saveApplication(message.data);
          sendResponse({ success: true, data: result });
          break;

        case 'getApplications':
          const apps = await this.getApplications();
          sendResponse({ success: true, data: apps });
          break;

        case 'syncData':
          await this.syncDataToCloud();
          sendResponse({ success: true });
          break;

        case 'showJobTracker':
          // Forward message to content script
          if (sender.tab) {
            chrome.tabs.sendMessage(sender.tab.id, message);
          }
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async checkAndInjectContentScript(tabId, url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      const jobSites = [
        'linkedin.com', 'indeed.com', 'glassdoor.com', 
        'angel.co', 'wellfound.com', 'ziprecruiter.com',
        'jobvite.com', 'workday.com', 'lever.co', 'greenhouse.io'
      ];

      if (jobSites.some(site => hostname.includes(site))) {
        // Check if content script is already injected
        try {
          await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (error) {
          // Content script not present, inject it
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });

          await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['content.css']
          });

          console.log('Content script injected into:', hostname);
        }
      }
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }

  async saveApplication(applicationData) {
    try {
      // Save to local storage first
      const result = await chrome.storage.local.get(['jobApplications']);
      const applications = result.jobApplications || [];
      
      applications.push({
        ...applicationData,
        id: Date.now() + Math.random(),
        dateAdded: new Date().toISOString()
      });

      await chrome.storage.local.set({ jobApplications: applications });

      // Try to sync to cloud
      await this.syncDataToCloud();

      return applicationData;
    } catch (error) {
      console.error('Failed to save application:', error);
      throw error;
    }
  }

  async getApplications() {
    try {
      const result = await chrome.storage.local.get(['jobApplications']);
      return result.jobApplications || [];
    } catch (error) {
      console.error('Failed to get applications:', error);
      return [];
    }
  }

  async syncDataToCloud() {
    try {
      const settings = await this.getSettings();
      if (!settings.autoSync) return;

      const applications = await this.getApplications();
      
      // Send to API
      const response = await fetch(`${this.apiUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applications })
      });

      if (response.ok) {
        await chrome.storage.local.set({ 
          lastSync: new Date().toISOString() 
        });
        console.log('Data synced to cloud successfully');
      }
    } catch (error) {
      console.warn('Cloud sync failed, data saved locally:', error);
    }
  }

  async handleApplicationNotification(applicationData, frontendUrl) {
    try {
      // Find open job tracker tabs and notify them
      const tabs = await chrome.tabs.query({ url: `${frontendUrl}/*` });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'applicationAdded',
            application: applicationData
          });
          console.log('✅ Notified tab about new application:', tab.id);
        } catch (tabError) {
          console.log('Could not notify tab:', tab.id, tabError.message);
        }
      }
      
      console.log('✅ Application notification completed');
    } catch (error) {
      console.warn('Failed to handle application notification:', error);
    }
  }

  async getSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      return result.settings || {
        autoSync: true,
        notifications: true,
        autoDetectApply: true,
        quickSaveEnabled: true
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  setupPeriodicSync() {
    // Sync data every 30 minutes
    setInterval(() => {
      this.syncDataToCloud();
    }, 30 * 60 * 1000);
  }

  async migrateData() {
    try {
      // Check if migration is needed
      const result = await chrome.storage.local.get(['version']);
      const currentVersion = chrome.runtime.getManifest().version;
      
      if (result.version !== currentVersion) {
        console.log('Migrating data to version:', currentVersion);
        
        // Perform any necessary data migrations here
        // For example, updating data structure for new features
        
        await chrome.storage.local.set({ version: currentVersion });
        console.log('Data migration completed');
      }
    } catch (error) {
      console.error('Data migration failed:', error);
    }
  }

  // Notification system
  async showNotification(title, message, type = 'basic') {
    try {
      const settings = await this.getSettings();
      if (!settings.notifications) return;

      await chrome.notifications.create({
        type: type,
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Context menu setup
  async setupContextMenus() {
    try {
      chrome.contextMenus.removeAll();
      
      chrome.contextMenus.create({
        id: 'trackJob',
        title: 'Track this job with Job Tracker',
        contexts: ['page', 'selection'],
        documentUrlPatterns: [
          '*://*.linkedin.com/*',
          '*://*.indeed.com/*',
          '*://*.glassdoor.com/*',
          '*://*.angel.co/*',
          '*://*.wellfound.com/*',
          '*://*.ziprecruiter.com/*'
        ]
      });

      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'trackJob') {
          chrome.tabs.sendMessage(tab.id, { action: 'showJobTracker' });
        }
      });
    } catch (error) {
      console.error('Failed to setup context menus:', error);
    }
  }
}

// Initialize background service
new JobTrackerBackground();
