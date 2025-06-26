// Enhanced API Service for Job Tracker
class JobTrackerAPI {
  constructor() {
    this.baseURL = 'https://job-tracker-chi-eight.vercel.app';
    this.localURL = 'http://localhost:3001';
    this.fallbackURL = 'http://localhost:8080';
    this.isOnline = true;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.isOnline = true;
        console.log('✅ Connected to production API');
        return true;
      }
    } catch (error) {
      console.warn('Production API connection failed:', error.message);
    }
    
    try {
      const response = await fetch(`${this.localURL}/api/health`, {
        method: 'GET',
        timeout: 3000
      });
      
      if (response.ok) {
        this.baseURL = this.localURL;
        this.isOnline = true;
        console.log('✅ Connected to local API');
        return true;
      }
    } catch (error) {
      console.warn('Local API connection failed:', error.message);
    }
    
    this.isOnline = false;
    console.log('⚠️ Operating in offline mode');
    return false;
  }

  async addApplication(applicationData) {
    // Always save to localStorage first
    await this.saveToLocalStorage(applicationData);
    
    // If online, try to sync to API
    if (this.isOnline) {
      try {
        await this.syncToAPI(applicationData);
        console.log('✅ Application synced to API');
        return { success: true, message: 'Application saved and synced!', offline: false };
      } catch (error) {
        console.error('API sync failed:', error);
        return { success: true, message: 'Application saved locally - will sync later', offline: true };
      }
    }
    
    return { success: true, message: 'Application saved locally', offline: true };
  }

  async saveToLocalStorage(applicationData) {
    try {
      // Try Chrome storage first
      if (typeof chrome !== 'undefined' && chrome.storage) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(['jobApplications'], (result) => {
            if (chrome.runtime.lastError) {
              console.warn('Chrome storage error:', chrome.runtime.lastError);
              // Fallback to localStorage
              this.saveToLocalStorageFallback(applicationData);
              resolve();
              return;
            }
            
            const applications = result.jobApplications || [];
            applications.push(applicationData);
            
            chrome.storage.local.set({ 
              jobApplications: applications,
              lastSync: new Date().toISOString()
            }, () => {
              if (chrome.runtime.lastError) {
                console.warn('Chrome storage save error:', chrome.runtime.lastError);
                this.saveToLocalStorageFallback(applicationData);
              }
              console.log('✅ Saved to Chrome storage');
              resolve();
            });
          });
        });
      } else {
        // Use localStorage directly
        this.saveToLocalStorageFallback(applicationData);
      }
    } catch (error) {
      console.error('Storage error:', error);
      this.saveToLocalStorageFallback(applicationData);
    }
  }

  saveToLocalStorageFallback(applicationData) {
    try {
      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      applications.push(applicationData);
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      localStorage.setItem('lastSync', new Date().toISOString());
      console.log('✅ Saved to localStorage');
    } catch (error) {
      console.error('localStorage save failed:', error);
      throw new Error('Failed to save application');
    }
  }

  async syncToAPI(applicationData) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${this.baseURL}/api/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.warn(`API sync attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  async getApplications() {
    try {
      if (this.isOnline) {
        const response = await fetch(`${this.baseURL}/api/applications`);
        if (response.ok) {
          const data = await response.json();
          return data.data || data;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch from API:', error.message);
    }
    
    // Fallback to local storage
    return this.getLocalApplications();
  }

  getLocalApplications() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        return new Promise((resolve) => {
          chrome.storage.local.get(['jobApplications'], (result) => {
            resolve(result.jobApplications || []);
          });
        });
      } else {
        return JSON.parse(localStorage.getItem('jobApplications') || '[]');
      }
    } catch (error) {
      console.error('Failed to get local applications:', error);
      return [];
    }
  }

  async syncPendingApplications() {
    if (!this.isOnline) return;
    
    try {
      const localApps = await this.getLocalApplications();
      const unsynced = localApps.filter(app => !app.synced);
      
      if (unsynced.length === 0) return;
      
      console.log(`🔄 Syncing ${unsynced.length} pending applications...`);
      
      for (const app of unsynced) {
        try {
          await this.syncToAPI(app);
          app.synced = true;
        } catch (error) {
          console.warn('Failed to sync application:', app.jobTitle, error.message);
        }
      }
      
      // Update local storage with sync status
      await this.saveAllToLocalStorage(localApps);
      
    } catch (error) {
      console.error('Sync process failed:', error);
    }
  }

  async saveAllToLocalStorage(applications) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ 
            jobApplications: applications,
            lastSync: new Date().toISOString()
          }, resolve);
        });
      } else {
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        localStorage.setItem('lastSync', new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to save all applications:', error);
    }
  }
}

// Make API service globally available
if (typeof window !== 'undefined') {
  window.jobTrackerAPI = new JobTrackerAPI();
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobTrackerAPI;
}