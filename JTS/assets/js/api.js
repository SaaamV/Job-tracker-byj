// api.js - Enhanced API service with MongoDB backend integration

class APIService {
  constructor() {
    // Use environment-specific base URL
    this.baseURL = window.location.origin;
    
    // For development, you might want to use a different URL
    if (window.location.hostname === 'localhost') {
      this.baseURL = 'http://localhost:5000';
    }
    
    console.log('API Service initialized with base URL:', this.baseURL);
  }

  // Generic request handler with better error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response: ${url}`, data);
      return data;
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.warn('Health check failed:', error);
      return { status: 'offline', error: error.message };
    }
  }

  // Applications API
  async getApplications() {
    try {
      return await this.request('/applications');
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      return [];
    }
  }

  async saveApplication(applicationData) {
    try {
      return await this.request('/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData)
      });
    } catch (error) {
      console.error('Failed to save application:', error);
      throw error;
    }
  }

  async updateApplication(id, applicationData) {
    try {
      return await this.request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(applicationData)
      });
    } catch (error) {
      console.error('Failed to update application:', error);
      throw error;
    }
  }

  async deleteApplication(id) {
    try {
      return await this.request(`/applications/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete application:', error);
      throw error;
    }
  }

  async getApplicationStats() {
    try {
      return await this.request('/applications/stats');
    } catch (error) {
      console.error('Failed to fetch application stats:', error);
      return { total: 0, statusBreakdown: {} };
    }
  }

  // Contacts API
  async getContacts() {
    try {
      return await this.request('/contacts');
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return [];
    }
  }

  async saveContact(contactData) {
    try {
      return await this.request('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
    } catch (error) {
      console.error('Failed to save contact:', error);
      throw error;
    }
  }

  async updateContact(id, contactData) {
    try {
      return await this.request(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
      });
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  async deleteContact(id) {
    try {
      return await this.request(`/contacts/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  }

  // Bulk sync for chrome extension and offline data
  async syncData(data) {
    try {
      return await this.request('/sync', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to sync data:', error);
      throw error;
    }
  }

  // Hybrid approach: Try API first, fallback to localStorage
  async getApplicationsHybrid() {
    try {
      // Try to get from API first
      const apiData = await this.getApplications();
      if (apiData && apiData.length > 0) {
        // Save to localStorage as backup
        localStorage.setItem('jobApplications', JSON.stringify(apiData));
        return apiData;
      }
    } catch (error) {
      console.log('API unavailable, using localStorage');
    }
    
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('jobApplications') || '[]');
  }

  async saveApplicationHybrid(applicationData) {
    // Always save to localStorage first for immediate response
    const localData = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    localData.push(applicationData);
    localStorage.setItem('jobApplications', JSON.stringify(localData));

    try {
      // Then try to save to API
      const result = await this.saveApplication(applicationData);
      console.log('Application synced to cloud');
      return result;
    } catch (error) {
      console.log('Saved locally, will sync later');
      // Mark for later sync
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      pendingSync.push({ type: 'application', data: applicationData, timestamp: Date.now() });
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
      throw error;
    }
  }

  // Sync pending data
  async syncPendingData() {
    const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    if (pendingSync.length === 0) return;

    const successful = [];
    const failed = [];

    for (const item of pendingSync) {
      try {
        if (item.type === 'application') {
          await this.saveApplication(item.data);
          successful.push(item);
        } else if (item.type === 'contact') {
          await this.saveContact(item.data);
          successful.push(item);
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
        failed.push(item);
      }
    }

    // Update pending sync list (remove successful items)
    localStorage.setItem('pendingSync', JSON.stringify(failed));

    console.log(`Sync completed: ${successful.length} successful, ${failed.length} failed`);
    return { successful: successful.length, failed: failed.length };
  }
}

// Create global instance
window.apiService = new APIService();

// Auto-sync on page load if online
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const health = await window.apiService.checkHealth();
    if (health.status === 'OK') {
      console.log('API is healthy, syncing pending data...');
      await window.apiService.syncPendingData();
    }
  } catch (error) {
    console.log('API not available, using offline mode');
  }
});

// Periodic sync every 5 minutes if online
setInterval(async () => {
  try {
    await window.apiService.syncPendingData();
  } catch (error) {
    // Silently fail, will try again later
  }
}, 5 * 60 * 1000);

console.log('Enhanced API service loaded with MongoDB integration');