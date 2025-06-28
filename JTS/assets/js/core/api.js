// Core API Service - Consolidated and Enhanced
// Combines all API functionality with retry logic, offline support, and cloud sync

class APIService {
  constructor() {
    // Environment detection and URL configuration
    this.baseURL = this.determineBaseURL();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.isOnline = navigator.onLine;
    this.connectionChecked = false;
    
    console.log('🚀 API Service initialized with base URL:', this.baseURL);
    
    // Setup network monitoring
    this.setupNetworkMonitoring();
    
    // Auto-sync pending data on load
    this.initializeSync();
  }

  determineBaseURL() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost') {
      // Development environment
      return port === '8080' ? 'http://localhost:3001' : 'http://localhost:3001';
    } else {
      // Production environment (Vercel)
      return window.location.origin;
    }
  }

  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online! Syncing pending data...');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Gone offline. Using local storage.');
    });
  }

  async initializeSync() {
    try {
      await this.checkHealth();
      if (this.isOnline) {
        await this.syncPendingData();
      }
    } catch (error) {
      console.log('🔄 Initial sync failed, operating in offline mode');
    }
  }

  // Generic request handler with comprehensive error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    config.signal = controller.signal;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔗 API Request (attempt ${attempt}): ${config.method || 'GET'} ${url}`);
        
        const response = await fetch(url, config);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ API Response: ${endpoint}`, data);
        return data;
        
      } catch (error) {
        console.warn(`⚠️ API attempt ${attempt} failed for ${endpoint}:`, error.message);
        
        if (attempt === this.retryAttempts) {
          console.error(`❌ All ${this.retryAttempts} attempts failed for ${endpoint}`);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Health check with connection validation
  async checkHealth() {
    try {
      const health = await this.request('/health');
      this.isOnline = health.status === 'OK';
      this.connectionChecked = true;
      return health;
    } catch (error) {
      this.isOnline = false;
      this.connectionChecked = true;
      console.warn('🔴 Health check failed:', error.message);
      return { status: 'offline', error: error.message };
    }
  }

  // Applications API with hybrid storage
  async getApplications() {
    try {
      if (this.isOnline) {
        const response = await this.request('/applications');
        const applications = response.data || response;
        
        // Save to localStorage as backup
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        localStorage.setItem('lastApiSync', new Date().toISOString());
        
        return applications;
      }
    } catch (error) {
      console.warn('📱 API unavailable for applications, using local storage');
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('jobApplications') || '[]');
  }

  async saveApplication(applicationData) {
    // Create a copy and ensure clean data for API
    const cleanData = { ...applicationData };
    delete cleanData.id; // Remove local ID to prevent ObjectId issues
    delete cleanData._id; // Remove any MongoDB ID
    
    // Always save to localStorage first for immediate UI response
    const localApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    
    try {
      if (this.isOnline) {
        const result = await this.request('/applications', {
          method: 'POST',
          body: JSON.stringify(cleanData)
        });
        
        // Add the saved application (with proper MongoDB _id) to local storage
        localApplications.push(result);
        localStorage.setItem('jobApplications', JSON.stringify(localApplications));
        
        console.log('☁️ Application synced to cloud');
        return result;
      } else {
        throw new Error('Offline - saved locally');
      }
    } catch (error) {
      console.log('💾 Application saved locally, will sync when online');
      
      // For local storage, we can keep the local ID
      localApplications.push(applicationData);
      localStorage.setItem('jobApplications', JSON.stringify(localApplications));
      
      // Add to pending sync queue (with clean data for later API sync)
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      pendingSync.push({ 
        type: 'application', 
        data: cleanData, // Use clean data for sync
        timestamp: Date.now(),
        localId: applicationData.id || Date.now() // Keep local ID for reference
      });
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
      
      throw new Error('Saved locally - will sync when connection is restored');
    }
  }

  async updateApplication(id, applicationData) {
    try {
      const result = await this.request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(applicationData)
      });
      
      // Update localStorage
      const localApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const index = localApplications.findIndex(app => app.id === id);
      if (index !== -1) {
        localApplications[index] = { ...localApplications[index], ...applicationData };
        localStorage.setItem('jobApplications', JSON.stringify(localApplications));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to update application:', error);
      throw error;
    }
  }

  async deleteApplication(id) {
    try {
      const result = await this.request(`/applications/${id}`, {
        method: 'DELETE'
      });
      
      // Remove from localStorage
      const localApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const filtered = localApplications.filter(app => app.id !== id);
      localStorage.setItem('jobApplications', JSON.stringify(filtered));
      
      return result;
    } catch (error) {
      console.error('❌ Failed to delete application:', error);
      throw error;
    }
  }

  // Contacts API with hybrid storage
  async getContacts() {
    try {
      if (this.isOnline) {
        const response = await this.request('/contacts');
        const contacts = response.data || response;
        
        localStorage.setItem('jobContacts', JSON.stringify(contacts));
        return contacts;
      }
    } catch (error) {
      console.warn('📱 API unavailable for contacts, using local storage');
    }
    
    return JSON.parse(localStorage.getItem('jobContacts') || '[]');
  }

  async saveContact(contactData) {
    // Save to localStorage first
    const localContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    localContacts.push(contactData);
    localStorage.setItem('jobContacts', JSON.stringify(localContacts));

    try {
      if (this.isOnline) {
        const result = await this.request('/contacts', {
          method: 'POST',
          body: JSON.stringify(contactData)
        });
        
        console.log('☁️ Contact synced to cloud');
        return result;
      } else {
        throw new Error('Offline - saved locally');
      }
    } catch (error) {
      console.log('💾 Contact saved locally, will sync when online');
      
      // Add to pending sync queue
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      pendingSync.push({ 
        type: 'contact', 
        data: contactData, 
        timestamp: Date.now(),
        id: contactData.id || Date.now()
      });
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
      
      throw new Error('Saved locally - will sync when connection is restored');
    }
  }

  async updateContact(id, contactData) {
    try {
      const result = await this.request(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
      });
      
      // Update localStorage
      const localContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
      const index = localContacts.findIndex(contact => contact.id === id);
      if (index !== -1) {
        localContacts[index] = { ...localContacts[index], ...contactData };
        localStorage.setItem('jobContacts', JSON.stringify(localContacts));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to update contact:', error);
      throw error;
    }
  }

  async deleteContact(id) {
    try {
      const result = await this.request(`/contacts/${id}`, {
        method: 'DELETE'
      });
      
      // Remove from localStorage
      const localContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
      const filtered = localContacts.filter(contact => contact.id !== id);
      localStorage.setItem('jobContacts', JSON.stringify(filtered));
      
      return result;
    } catch (error) {
      console.error('❌ Failed to delete contact:', error);
      throw error;
    }
  }

  // Analytics and stats
  async getApplicationStats() {
    try {
      return await this.request('/applications/stats');
    } catch (error) {
      console.warn('📊 Stats API unavailable, calculating locally');
      
      // Calculate stats from local data
      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      return this.calculateLocalStats(applications);
    }
  }

  calculateLocalStats(applications) {
    const total = applications.length;
    const statusBreakdown = {};
    
    applications.forEach(app => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
    });
    
    return { total, statusBreakdown };
  }

  // Bulk sync for Chrome extension and offline data
  async syncData(data) {
    try {
      return await this.request('/sync', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('❌ Failed to bulk sync data:', error);
      throw error;
    }
  }

  // Sync pending data when connection is restored
  async syncPendingData() {
    const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    
    if (pendingSync.length === 0) {
      console.log('✅ No pending data to sync');
      return { successful: 0, failed: 0 };
    }

    console.log(`🔄 Syncing ${pendingSync.length} pending items...`);

    const successful = [];
    const failed = [];

    for (const item of pendingSync) {
      try {
        if (item.type === 'application') {
          await this.saveApplicationDirect(item.data);
          successful.push(item);
        } else if (item.type === 'contact') {
          await this.saveContactDirect(item.data);
          successful.push(item);
        }
      } catch (error) {
        console.error(`❌ Failed to sync ${item.type}:`, error.message);
        failed.push(item);
      }
    }

    // Update pending sync list (remove successful items)
    localStorage.setItem('pendingSync', JSON.stringify(failed));

    console.log(`✅ Sync completed: ${successful.length} successful, ${failed.length} failed`);
    
    if (successful.length > 0) {
      // Trigger a refresh of data after successful sync
      this.dispatchSyncEvent();
    }

    return { successful: successful.length, failed: failed.length };
  }

  // Direct API calls (bypass localStorage) - FIXED for ObjectId issues
  async saveApplicationDirect(applicationData) {
    const cleanData = { ...applicationData };
    delete cleanData.id; // Remove local ID to prevent ObjectId issues
    delete cleanData._id; // Remove any MongoDB ID
    delete cleanData.localId; // Remove local reference ID
    
    return await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(cleanData)
    });
  }

  async saveContactDirect(contactData) {
    return await this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  // Event dispatch for sync notifications
  dispatchSyncEvent() {
    window.dispatchEvent(new CustomEvent('apiSyncComplete', {
      detail: { message: 'Data synchronized successfully' }
    }));
  }

  // Chrome extension compatibility
  getChromeStorageData() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['jobApplications', 'jobContacts'], (result) => {
          resolve({
            applications: result.jobApplications || [],
            contacts: result.jobContacts || []
          });
        });
      });
    }
    
    return {
      applications: JSON.parse(localStorage.getItem('jobApplications') || '[]'),
      contacts: JSON.parse(localStorage.getItem('jobContacts') || '[]')
    };
  }

  async saveToChromeStorage(data) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve);
      });
    }
    
    // Fallback to localStorage
    if (data.jobApplications) {
      localStorage.setItem('jobApplications', JSON.stringify(data.jobApplications));
    }
    if (data.jobContacts) {
      localStorage.setItem('jobContacts', JSON.stringify(data.jobContacts));
    }
  }
}

// Create global instance
window.apiService = new APIService();

// Global event listeners for API sync events
window.addEventListener('apiSyncComplete', (event) => {
  console.log('🎉 Sync event received:', event.detail.message);
  
  // Show success notification
  if (window.showSuccessMessage) {
    window.showSuccessMessage('Data synchronized successfully!');
  }
});

// Periodic sync every 5 minutes if online
setInterval(async () => {
  if (window.apiService.isOnline) {
    try {
      await window.apiService.syncPendingData();
    } catch (error) {
      // Silently fail, will try again later
      console.log('🔄 Periodic sync attempt failed');
    }
  }
}, 5 * 60 * 1000);

console.log('🚀 Enhanced API service loaded with offline support and auto-sync');