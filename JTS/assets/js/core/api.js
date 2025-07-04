// Core API Service - Cloud-Only MongoDB Service
// Handles all API communication with MongoDB cloud database

class APIService {
  constructor() {
    // Use API Gateway as single entry point
    this.baseURL = this.determineBaseURL();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    
    console.log('🚀 API Service initialized with API Gateway URL:', this.baseURL);
    
    // Test connection on initialization
    this.testConnection();
  }
  
  determineBaseURL() {
    // Determine if we're in development or production
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Development - use API Gateway
      return 'http://localhost:3000';
    } else {
      // Production - use deployed API Gateway
      return 'https://your-api-gateway-url.com';
    }
  }


  async testConnection() {
    try {
      await this.checkHealth();
      console.log('✅ Cloud database connection verified');
    } catch (error) {
      console.error('❌ Cloud database connection failed:', error.message);
      this.showConnectionError();
    }
  }

  showConnectionError() {
    if (window.showErrorMessage) {
      window.showErrorMessage('Unable to connect to cloud database. Please check your internet connection.');
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

    // Add timeout to prevent hanging requests (increased to 30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
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
        clearTimeout(timeoutId);
        
        // Check if error is due to timeout
        if (error.name === 'AbortError') {
          console.warn(`⏱️ Request timed out for ${endpoint}`);
          throw new Error(`Request timed out. Please check your connection and try again.`);
        }
        
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
      return health;
    } catch (error) {
      console.warn('🔴 Health check failed:', error.message);
      throw error;
    }
  }

  // Applications API - Cloud-only
  async getApplications() {
    try {
      const response = await this.request('/applications');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch applications:', error.message);
      throw error;
    }
  }

  async saveApplication(applicationData) {
    // Create a copy and ensure clean data for API
    const cleanData = { ...applicationData };
    delete cleanData.id; // Remove local ID to prevent ObjectId issues
    delete cleanData._id; // Remove any MongoDB ID
    
    try {
      const result = await this.request('/applications', {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      
      console.log('☁️ Application saved to cloud');
      return result;
    } catch (error) {
      console.error('❌ Failed to save application to cloud:', error.message);
      
      // Fallback: Save locally and queue for sync
      console.log('💾 Saving application locally as fallback...');
      return this.saveApplicationLocally(cleanData, error);
    }
  }

  saveApplicationLocally(applicationData, originalError) {
    try {
      // Generate a temporary ID
      const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Add local metadata
      const localApplication = {
        ...applicationData,
        _id: tempId,
        id: tempId,
        _isLocalOnly: true,
        _needsSync: true,
        _localSaveTime: new Date().toISOString(),
        _originalError: originalError.message
      };
      
      // Get existing applications from localStorage
      const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      
      // Add new application
      existingApps.push(localApplication);
      
      // Save back to localStorage
      localStorage.setItem('jobApplications', JSON.stringify(existingApps));
      
      // Queue for sync when API is available
      this.queueForSync('application', localApplication);
      
      console.log('💾 Application saved locally with ID:', tempId);
      
      // Return the local application data
      return localApplication;
      
    } catch (localError) {
      console.error('❌ Failed to save application locally:', localError);
      throw new Error(`Cloud save failed: ${originalError.message}. Local save also failed: ${localError.message}`);
    }
  }

  queueForSync(type, data) {
    try {
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      
      pendingSync.push({
        type: type,
        data: data,
        timestamp: new Date().toISOString(),
        attempts: 0
      });
      
      localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
      
      // Try to sync immediately (non-blocking)
      setTimeout(() => this.syncPendingData(), 1000);
      
    } catch (error) {
      console.error('❌ Failed to queue data for sync:', error);
    }
  }

  async syncPendingData() {
    try {
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      
      if (pendingSync.length === 0) {
        return;
      }
      
      console.log(`🔄 Attempting to sync ${pendingSync.length} pending items...`);
      
      const remainingItems = [];
      let syncedCount = 0;
      
      for (const item of pendingSync) {
        try {
          if (item.type === 'application') {
            // Remove local metadata before syncing
            const cleanData = { ...item.data };
            delete cleanData._id;
            delete cleanData.id;
            delete cleanData._isLocalOnly;
            delete cleanData._needsSync;
            delete cleanData._localSaveTime;
            delete cleanData._originalError;
            
            // Try to sync to cloud
            const result = await this.request('/applications', {
              method: 'POST',
              body: JSON.stringify(cleanData)
            });
            
            // Update local storage with cloud ID
            this.updateLocalApplicationWithCloudId(item.data._id, result._id || result.id);
            
            syncedCount++;
            console.log('✅ Synced application:', result._id || result.id);
            
          }
        } catch (syncError) {
          // Keep item for retry if attempts < 3
          item.attempts = (item.attempts || 0) + 1;
          if (item.attempts < 3) {
            remainingItems.push(item);
          } else {
            console.warn('⚠️ Gave up syncing item after 3 attempts:', item);
          }
        }
      }
      
      // Update pending sync queue
      localStorage.setItem('pendingSync', JSON.stringify(remainingItems));
      
      if (syncedCount > 0) {
        console.log(`✅ Successfully synced ${syncedCount} items. ${remainingItems.length} items remaining.`);
      }
      
    } catch (error) {
      console.error('❌ Failed to sync pending data:', error);
    }
  }

  updateLocalApplicationWithCloudId(tempId, cloudId) {
    try {
      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      
      const index = applications.findIndex(app => app._id === tempId || app.id === tempId);
      
      if (index !== -1) {
        applications[index]._id = cloudId;
        applications[index].id = cloudId;
        delete applications[index]._isLocalOnly;
        delete applications[index]._needsSync;
        delete applications[index]._localSaveTime;
        delete applications[index]._originalError;
        
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        console.log('✅ Updated local application with cloud ID:', cloudId);
      }
      
    } catch (error) {
      console.error('❌ Failed to update local application with cloud ID:', error);
    }
  }

  async updateApplication(id, applicationData) {
    try {
      const result = await this.request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(applicationData)
      });
      
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
      
      return result;
    } catch (error) {
      console.error('❌ Failed to delete application:', error);
      throw error;
    }
  }

  // Contacts API - Cloud-only
  async getContacts() {
    try {
      const response = await this.request('/contacts');
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch contacts:', error.message);
      throw error;
    }
  }

  async saveContact(contactData) {
    try {
      const result = await this.request('/contacts', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
      
      console.log('☁️ Contact saved to cloud');
      return result;
    } catch (error) {
      console.error('❌ Failed to save contact:', error.message);
      throw error;
    }
  }

  async updateContact(id, contactData) {
    try {
      const result = await this.request(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contactData)
      });
      
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
      
      return result;
    } catch (error) {
      console.error('❌ Failed to delete contact:', error);
      throw error;
    }
  }

  // Analytics API
  async getAnalyticsOverview() {
    try {
      return await this.request('/analytics/overview');
    } catch (error) {
      console.error('❌ Failed to fetch analytics overview:', error.message);
      throw error;
    }
  }

  async getStatusDistribution() {
    try {
      return await this.request('/analytics/status-distribution');
    } catch (error) {
      console.error('❌ Failed to fetch status distribution:', error.message);
      throw error;
    }
  }

  async getTimeline() {
    try {
      return await this.request('/analytics/timeline');
    } catch (error) {
      console.error('❌ Failed to fetch timeline:', error.message);
      throw error;
    }
  }

  async getPortalAnalysis() {
    try {
      return await this.request('/analytics/portals');
    } catch (error) {
      console.error('❌ Failed to fetch portal analysis:', error.message);
      throw error;
    }
  }

  // Resumes API
  async getResumes() {
    try {
      return await this.request('/resumes');
    } catch (error) {
      console.error('❌ Failed to fetch resumes:', error.message);
      throw error;
    }
  }

  async uploadResume(formData) {
    try {
      const result = await fetch(`${this.baseURL}/api/resumes`, {
        method: 'POST',
        body: formData // Don't set Content-Type, let browser set it with boundary
      });
      
      if (!result.ok) {
        const errorData = await result.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error);
      }
      
      return await result.json();
    } catch (error) {
      console.error('❌ Failed to upload resume:', error.message);
      throw error;
    }
  }

  async setDefaultResume(id) {
    try {
      return await this.request(`/resumes/${id}/default`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('❌ Failed to set default resume:', error.message);
      throw error;
    }
  }

  async deleteResume(id) {
    try {
      return await this.request(`/resumes/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('❌ Failed to delete resume:', error.message);
      throw error;
    }
  }

  getResumeDownloadUrl(id) {
    return `${this.baseURL}/api/resumes/${id}/download`;
  }

  // Export API
  async exportApplicationsCSV() {
    try {
      const response = await fetch(`${this.baseURL}/api/export/applications/csv`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job_applications.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to export applications CSV:', error.message);
      throw error;
    }
  }

  async exportContactsCSV() {
    try {
      const response = await fetch(`${this.baseURL}/api/export/contacts/csv`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to export contacts CSV:', error.message);
      throw error;
    }
  }

  async exportApplicationsJSON() {
    try {
      const response = await fetch(`${this.baseURL}/api/export/applications/json`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job_applications.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Failed to export applications JSON:', error.message);
      throw error;
    }
  }

  // Templates API
  async getTemplates(category = null) {
    try {
      const query = category ? `?category=${encodeURIComponent(category)}` : '';
      return await this.request(`/templates${query}`);
    } catch (error) {
      console.error('❌ Failed to fetch templates:', error.message);
      throw error;
    }
  }

  async getTemplate(id) {
    try {
      return await this.request(`/templates/${id}`);
    } catch (error) {
      console.error('❌ Failed to fetch template:', error.message);
      throw error;
    }
  }

  async saveTemplate(templateData) {
    try {
      return await this.request('/templates', {
        method: 'POST',
        body: JSON.stringify(templateData)
      });
    } catch (error) {
      console.error('❌ Failed to save template:', error.message);
      throw error;
    }
  }

  async updateTemplate(id, templateData) {
    try {
      return await this.request(`/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(templateData)
      });
    } catch (error) {
      console.error('❌ Failed to update template:', error.message);
      throw error;
    }
  }

  async deleteTemplate(id) {
    try {
      return await this.request(`/templates/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('❌ Failed to delete template:', error.message);
      throw error;
    }
  }

  async getTemplateCategories() {
    try {
      return await this.request('/templates/categories');
    } catch (error) {
      console.error('❌ Failed to fetch template categories:', error.message);
      throw error;
    }
  }

  // Payments API
  async getSubscriptionPlans() {
    try {
      return await this.request('/payments/plans');
    } catch (error) {
      console.error('❌ Failed to fetch subscription plans:', error.message);
      throw error;
    }
  }

  async getUserSubscription(userId) {
    try {
      return await this.request(`/payments/subscription/${userId}`);
    } catch (error) {
      console.error('❌ Failed to fetch user subscription:', error.message);
      throw error;
    }
  }

  async createCheckoutSession(planId, userId, userEmail) {
    try {
      return await this.request('/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          userId,
          userEmail,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });
    } catch (error) {
      console.error('❌ Failed to create checkout session:', error.message);
      throw error;
    }
  }

  async createPaymentIntent(amount, userId, description) {
    try {
      return await this.request('/payments/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          userId,
          description
        })
      });
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error.message);
      throw error;
    }
  }

  async manageSubscription(userId, action, newPlanId = null) {
    try {
      return await this.request('/payments/manage-subscription', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          action,
          newPlanId
        })
      });
    } catch (error) {
      console.error('❌ Failed to manage subscription:', error.message);
      throw error;
    }
  }

  async getPaymentHistory(userId) {
    try {
      return await this.request(`/payments/history/${userId}`);
    } catch (error) {
      console.error('❌ Failed to fetch payment history:', error.message);
      throw error;
    }
  }

  async getUsageAnalytics(userId) {
    try {
      return await this.request(`/payments/usage/${userId}`);
    } catch (error) {
      console.error('❌ Failed to fetch usage analytics:', error.message);
      throw error;
    }
  }

  // Bulk sync for Chrome extension data
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

  // Chrome extension compatibility - Cloud sync only
  async getChromeStorageData() {
    try {
      const [applications, contacts] = await Promise.all([
        this.getApplications(),
        this.getContacts()
      ]);
      
      return { applications, contacts };
    } catch (error) {
      console.error('❌ Failed to fetch data for Chrome extension:', error.message);
      throw error;
    }
  }
}

// Create global instance
window.apiService = new APIService();

console.log('🚀 Cloud-only API service loaded successfully');