// api.js - API service for backend communication

class APIService {
  constructor() {
    this.baseURL = this.getAPIBaseURL();
    this.userId = localStorage.getItem('userId') || this.generateGuestId();
    this.isOnline = navigator.onLine;
    this.pendingSync = [];
    
    // Setup online/offline handlers
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Auto-sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncData();
      }
    }, 5 * 60 * 1000);
  }
  
  getAPIBaseURL() {
    // Automatically detect environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // Use the same domain but with /api prefix for Vercel deployment
    return window.location.origin;
  }
  
  generateGuestId() {
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', guestId);
    return guestId;
  }
  
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': this.userId,
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      
      // If offline, store request for later
      if (!this.isOnline) {
        this.queueOfflineRequest(endpoint, options);
      }
      
      throw error;
    }
  }
  
  queueOfflineRequest(endpoint, options) {
    this.pendingSync.push({ endpoint, options, timestamp: Date.now() });
    localStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
  }
  
  async handleOnline() {
    this.isOnline = true;
    showMessage('Back online! Syncing data...', 'info');
    
    // Process pending requests
    const pending = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    for (const request of pending) {
      try {
        await this.makeRequest(request.endpoint, request.options);
      } catch (error) {
        console.error('Failed to sync pending request:', error);
      }
    }
    
    // Clear pending requests
    localStorage.removeItem('pendingSync');
    this.pendingSync = [];
    
    // Full sync
    await this.syncData();
    showMessage('Data synced successfully!', 'success');
  }
  
  handleOffline() {
    this.isOnline = false;
    showMessage('You are offline. Changes will be synced when you reconnect.', 'warning');
  }
  
  // Applications API
  async getApplications() {
    if (!this.isOnline) {
      return JSON.parse(localStorage.getItem('jobApplications') || '[]');
    }
    
    try {
      const data = await this.makeRequest('/applications');
      localStorage.setItem('jobApplications', JSON.stringify(data));
      return data;
    } catch (error) {
      // Fallback to local storage
      return JSON.parse(localStorage.getItem('jobApplications') || '[]');
    }
  }
  
  async saveApplication(application) {
    // Save locally first
    const localApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    
    if (application._id || application.id) {
      // Update existing
      const index = localApps.findIndex(app => (app._id || app.id) === (application._id || application.id));
      if (index !== -1) {
        localApps[index] = application;
      }
    } else {
      // Add new
      application.id = Date.now();
      localApps.push(application);
    }
    
    localStorage.setItem('jobApplications', JSON.stringify(localApps));
    
    // Sync to server if online
    if (this.isOnline) {
      try {
        if (application._id) {
          return await this.makeRequest(`/applications/${application._id}`, {
            method: 'PUT',
            body: JSON.stringify(application)
          });
        } else {
          return await this.makeRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(application)
          });
        }
      } catch (error) {
        console.error('Failed to sync application:', error);
      }
    }
    
    return application;
  }
  
  async deleteApplication(id) {
    // Remove locally
    const localApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    const filteredApps = localApps.filter(app => (app._id || app.id) !== id);
    localStorage.setItem('jobApplications', JSON.stringify(filteredApps));
    
    // Sync to server if online
    if (this.isOnline) {
      try {
        await this.makeRequest(`/applications/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete application on server:', error);
      }
    }
  }
  
  // Contacts API
  async getContacts() {
    if (!this.isOnline) {
      return JSON.parse(localStorage.getItem('jobContacts') || '[]');
    }
    
    try {
      const data = await this.makeRequest('/contacts');
      localStorage.setItem('jobContacts', JSON.stringify(data));
      return data;
    } catch (error) {
      return JSON.parse(localStorage.getItem('jobContacts') || '[]');
    }
  }
  
  async saveContact(contact) {
    // Save locally first
    const localContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    
    if (contact._id || contact.id) {
      const index = localContacts.findIndex(c => (c._id || c.id) === (contact._id || contact.id));
      if (index !== -1) {
        localContacts[index] = contact;
      }
    } else {
      contact.id = Date.now();
      localContacts.push(contact);
    }
    
    localStorage.setItem('jobContacts', JSON.stringify(localContacts));
    
    // Sync to server if online
    if (this.isOnline) {
      try {
        if (contact._id) {
          return await this.makeRequest(`/contacts/${contact._id}`, {
            method: 'PUT',
            body: JSON.stringify(contact)
          });
        } else {
          return await this.makeRequest('/contacts', {
            method: 'POST',
            body: JSON.stringify(contact)
          });
        }
      } catch (error) {
        console.error('Failed to sync contact:', error);
      }
    }
    
    return contact;
  }
  
  async deleteContact(id) {
    const localContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    const filteredContacts = localContacts.filter(contact => (contact._id || contact.id) !== id);
    localStorage.setItem('jobContacts', JSON.stringify(filteredContacts));
    
    if (this.isOnline) {
      try {
        await this.makeRequest(`/contacts/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete contact on server:', error);
      }
    }
  }
  
  // Resumes API
  async getResumes() {
    if (!this.isOnline) {
      return JSON.parse(localStorage.getItem('jobResumes') || '[]');
    }
    
    try {
      const data = await this.makeRequest('/resumes');
      localStorage.setItem('jobResumes', JSON.stringify(data));
      return data;
    } catch (error) {
      return JSON.parse(localStorage.getItem('jobResumes') || '[]');
    }
  }
  
  async saveResume(resume) {
    const localResumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
    
    if (resume._id || resume.id) {
      const index = localResumes.findIndex(r => (r._id || r.id) === (resume._id || resume.id));
      if (index !== -1) {
        localResumes[index] = resume;
      }
    } else {
      resume.id = Date.now();
      localResumes.push(resume);
    }
    
    localStorage.setItem('jobResumes', JSON.stringify(localResumes));
    
    if (this.isOnline) {
      try {
        return await this.makeRequest('/resumes', {
          method: 'POST',
          body: JSON.stringify(resume)
        });
      } catch (error) {
        console.error('Failed to sync resume:', error);
      }
    }
    
    return resume;
  }
  
  async deleteResume(id) {
    const localResumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
    const filteredResumes = localResumes.filter(resume => (resume._id || resume.id) !== id);
    localStorage.setItem('jobResumes', JSON.stringify(filteredResumes));
    
    if (this.isOnline) {
      try {
        await this.makeRequest(`/resumes/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to delete resume on server:', error);
      }
    }
  }
  
  // Full data sync
  async syncData() {
    if (!this.isOnline) return;
    
    try {
      const localData = {
        applications: JSON.parse(localStorage.getItem('jobApplications') || '[]'),
        contacts: JSON.parse(localStorage.getItem('jobContacts') || '[]'),
        resumes: JSON.parse(localStorage.getItem('jobResumes') || '[]')
      };
      
      // Send local data to server
      await this.makeRequest('/sync', {
        method: 'POST',
        body: JSON.stringify(localData)
      });
      
      // Get latest data from server
      const serverData = await this.makeRequest('/sync');
      
      // Update local storage with server data
      localStorage.setItem('jobApplications', JSON.stringify(serverData.applications || []));
      localStorage.setItem('jobContacts', JSON.stringify(serverData.contacts || []));
      localStorage.setItem('jobResumes', JSON.stringify(serverData.resumes || []));
      localStorage.setItem('lastSync', serverData.lastSync);
      
      return serverData;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
  
  // User management
  async register(email, password, name) {
    try {
      const response = await this.makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      
      this.userId = response.userId;
      localStorage.setItem('userId', this.userId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  async login(email, password) {
    try {
      const response = await this.makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      this.userId = response.userId;
      localStorage.setItem('userId', this.userId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', response.name);
      
      // Sync data after login
      await this.syncData();
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.userId = this.generateGuestId();
  }
  
  isLoggedIn() {
    const userId = localStorage.getItem('userId');
    return userId && !userId.startsWith('guest_');
  }
  
  getCurrentUser() {
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      name: localStorage.getItem('userName'),
      isGuest: !this.isLoggedIn()
    };
  }
}

// Initialize API service
const apiService = new APIService();

// Enhanced functions that use API service
async function addApplicationAPI(applicationData) {
  try {
    const savedApp = await apiService.saveApplication(applicationData);
    applications = await apiService.getApplications();
    renderApplications();
    updateAnalytics();
    return savedApp;
  } catch (error) {
    console.error('Failed to save application:', error);
    showMessage('Failed to save application. Please try again.', 'error');
  }
}

async function addContactAPI(contactData) {
  try {
    const savedContact = await apiService.saveContact(contactData);
    contacts = await apiService.getContacts();
    renderContacts();
    populateEmailContacts();
    return savedContact;
  } catch (error) {
    console.error('Failed to save contact:', error);
    showMessage('Failed to save contact. Please try again.', 'error');
  }
}

async function deleteApplicationAPI(id) {
  try {
    await apiService.deleteApplication(id);
    applications = await apiService.getApplications();
    renderApplications();
    updateAnalytics();
    showMessage('Application deleted successfully!', 'success');
  } catch (error) {
    console.error('Failed to delete application:', error);
    showMessage('Failed to delete application. Please try again.', 'error');
  }
}

async function deleteContactAPI(id) {
  try {
    await apiService.deleteContact(id);
    contacts = await apiService.getContacts();
    renderContacts();
    populateEmailContacts();
    showMessage('Contact deleted successfully!', 'success');
  } catch (error) {
    console.error('Failed to delete contact:', error);
    showMessage('Failed to delete contact. Please try again.', 'error');
  }
}

// Load data on app initialization
async function loadDataFromAPI() {
  try {
    applications = await apiService.getApplications();
    contacts = await apiService.getContacts();
    resumes = await apiService.getResumes();
    
    renderApplications();
    renderContacts();
    renderResumes();
    updateResumeDropdown();
    updateAnalytics();
    populateEmailContacts();
    
  } catch (error) {
    console.error('Failed to load data:', error);
    // Fallback to local storage
    applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
    resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
  }
}

// Export for use in other files
window.apiService = apiService;
window.loadDataFromAPI = loadDataFromAPI;