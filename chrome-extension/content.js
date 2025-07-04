// content.js - FIXED Job data extraction and auto-fill functionality

// Prevent multiple class declarations
if (typeof window.JobTrackerExtension === 'undefined') {
  // Job Tracker Auto-Fill Extension
  class JobTrackerExtension {
  constructor() {
    this.jobData = {};
    this.currentSite = this.detectJobSite();
    this.isTracking = false;
    
    // Use localhost for development  
    this.primaryApiUrl = 'http://localhost:3001'; // Local backend API
    this.fallbackApiUrl = 'http://localhost:3001'; // Local fallback
    
    console.log('🔗 Content script API URL configured as:', this.primaryApiUrl);
    this.frontendUrl = 'http://localhost:8080'; // Local frontend server
    
    this.init();
  }

  init() {
    console.log('Job Tracker Extension initializing...');
    this.addFloatingButton();
    this.detectJobData();
    this.setupAutoDetection();
    console.log('Job Tracker Extension initialized on:', this.currentSite);
  }

  detectJobSite() {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('indeed')) return 'indeed';
    if (hostname.includes('glassdoor')) return 'glassdoor';
    if (hostname.includes('angel') || hostname.includes('wellfound')) return 'angellist';
    if (hostname.includes('ziprecruiter')) return 'ziprecruiter';
    if (hostname.includes('jobvite')) return 'jobvite';
    if (hostname.includes('workday')) return 'workday';
    if (hostname.includes('lever')) return 'lever';
    if (hostname.includes('greenhouse')) return 'greenhouse';
    
    return 'generic';
  }

  addFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('job-tracker-floating-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const button = document.createElement('div');
    button.id = 'job-tracker-floating-btn';
    button.className = 'job-tracker-floating-btn';
    button.innerHTML = `
      <div class="job-tracker-btn-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        <span>Track Job</span>
      </div>
    `;
    
    button.addEventListener('click', () => {
      console.log('Floating button clicked');
      this.showJobTracker();
    });
    
    // Add a small test indicator
    button.title = 'Job Tracker Extension - Click to track this job';
    
    document.body.appendChild(button);
    console.log('Floating button added to page');
  }

  detectJobData() {
    const extractors = {
      linkedin: this.extractLinkedInData.bind(this),
      indeed: this.extractIndeedData.bind(this),
      glassdoor: this.extractGlassdoorData.bind(this),
      angellist: this.extractAngelListData.bind(this),
      ziprecruiter: this.extractZipRecruiterData.bind(this),
      generic: this.extractGenericData.bind(this)
    };

    const extractor = extractors[this.currentSite] || extractors.generic;
    this.jobData = extractor();
    
    console.log('Extracted job data:', this.jobData);
  }

  extractLinkedInData() {
    const data = {
      jobTitle: this.getTextContent([
        '.top-card-layout__title',
        '.jobs-unified-top-card__job-title h1',
        'h1.t-24.t-bold.inline',
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title a'
      ]),
      company: this.getTextContent([
        '.topcard__org-name-link',
        '.jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name a',
        '.topcard__flavor--metadata a',
        '.jobs-unified-top-card__company-name'
      ]),
      location: this.getTextContent([
        '.topcard__flavor--bullet',
        '.jobs-unified-top-card__bullet',
        '.job-details-jobs-unified-top-card__primary-description-text',
        '.jobs-unified-top-card__primary-description'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'LinkedIn',
      jobType: this.extractJobType(),
      description: this.getTextContent([
        '.jobs-description__content',
        '.jobs-box__html-content',
        '.description__text'
      ])
    };

    // Clean location data
    if (data.location) {
      data.location = data.location.replace(/[•·]/g, '').trim();
    }

    return data;
  }

  extractIndeedData() {
    return {
      jobTitle: this.getTextContent([
        '[data-testid="jobsearch-JobInfoHeader-title"]',
        '.jobsearch-JobInfoHeader-title',
        'h1.icl-u-xs-mb--xs.icl-u-xs-mt--none.jobsearch-JobInfoHeader-title',
        'h1[data-testid="jobsearch-JobInfoHeader-title"]'
      ]),
      company: this.getTextContent([
        '[data-testid="inlineHeader-companyName"]',
        '.icl-u-lg-mr--sm.icl-u-xs-mr--xs',
        'a[data-testid="inlineHeader-companyName"]',
        '[data-testid="inlineHeader-companyName"] span'
      ]),
      location: this.getTextContent([
        '[data-testid="job-location"]',
        '.icl-u-colorForeground--secondary.icl-u-xs-mt--xs',
        '[data-testid="job-location"] div'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Indeed',
      salaryRange: this.getTextContent([
        '.icl-u-xs-mr--xs.attribute_snippet',
        '[data-testid="job-salary"]'
      ]),
      description: this.getTextContent([
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText'
      ])
    };
  }

  extractGlassdoorData() {
    return {
      jobTitle: this.getTextContent([
        '[data-test="job-title"]',
        '.css-17x46n0.e1tk4kwz5',
        'h1[data-test="job-title"]'
      ]),
      company: this.getTextContent([
        '[data-test="employer-name"]',
        '.css-87uc0g.e1tk4kwz1',
        'span[data-test="employer-name"]'
      ]),
      location: this.getTextContent([
        '[data-test="job-location"]',
        '.css-56kyx5.e1tk4kwz0'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Glassdoor',
      salaryRange: this.getTextContent([
        '[data-test="detailSalary"]',
        '.css-1oxck3i.e2u4hf18'
      ]),
      description: this.getTextContent([
        '[data-test="jobDescriptionContent"]',
        '.desc'
      ])
    };
  }

  extractAngelListData() {
    return {
      jobTitle: this.getTextContent([
        '[data-test="JobTitle"]',
        '.styles_jobTitle__3vWnh',
        'h1[data-test="JobTitle"]'
      ]),
      company: this.getTextContent([
        '[data-test="StartupLink"]',
        '.styles_startupLink__3xOHh'
      ]),
      location: this.getTextContent([
        '[data-test="JobLocations"]',
        '.styles_locationLink__2omlv'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'AngelList',
      salaryRange: this.getTextContent([
        '[data-test="SalaryRange"]',
        '.styles_salaryRange__2zJpd'
      ]),
      description: this.getTextContent([
        '[data-test="JobDescription"]',
        '.styles_description__1y84D'
      ])
    };
  }

  extractZipRecruiterData() {
    return {
      jobTitle: this.getTextContent([
        'h1.job_title',
        '.job_header h1'
      ]),
      company: this.getTextContent([
        '.company_name a',
        '.hiring_company_text a'
      ]),
      location: this.getTextContent([
        '.location',
        '.job_location'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'ZipRecruiter',
      salaryRange: this.getTextContent([
        '.salary_range',
        '.compensation_text'
      ]),
      description: this.getTextContent([
        '.job_description',
        '.jobDescriptionSection'
      ])
    };
  }

  extractGenericData() {
    // Generic extraction for unknown sites
    const titleSelectors = [
      'h1', '[class*="title"]', '[class*="job-title"]', 
      '[class*="position"]', '[id*="title"]'
    ];
    
    const companySelectors = [
      '[class*="company"]', '[class*="employer"]', 
      '[class*="organization"]', '[class*="firm"]'
    ];

    const locationSelectors = [
      '[class*="location"]', '[class*="address"]', 
      '[class*="city"]', '[class*="geo"]'
    ];

    return {
      jobTitle: this.getTextContent(titleSelectors),
      company: this.getTextContent(companySelectors),
      location: this.getTextContent(locationSelectors),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Other',
      description: this.getTextContent(['[class*="description"]', '[class*="details"]'])
    };
  }

  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  extractJobType() {
    const jobTypeKeywords = {
      'Full-time': ['full time', 'full-time', 'fulltime', 'permanent'],
      'Part-time': ['part time', 'part-time', 'parttime'],
      'Contract': ['contract', 'contractor', 'freelance', 'temporary', 'temp'],
      'Internship': ['intern', 'internship', 'trainee'],
      'Remote': ['remote', 'work from home', 'wfh', 'distributed'],
      'Hybrid': ['hybrid', 'flexible']
    };

    const pageText = document.body.textContent.toLowerCase();
    
    for (const [type, keywords] of Object.entries(jobTypeKeywords)) {
      if (keywords.some(keyword => pageText.includes(keyword))) {
        return type;
      }
    }
    
    return '';
  }

  showJobTracker() {
    console.log('Showing job tracker modal...');
    this.detectJobData(); // Refresh data
    
    // Remove existing modal if any
    const existingModal = document.getElementById('job-tracker-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'job-tracker-modal';
    modal.className = 'job-tracker-modal';
    modal.innerHTML = this.createModalHTML();
    
    document.body.appendChild(modal);
    
    // Add event listeners
    this.setupModalEvents(modal);
    
    // Pre-fill form with detected data
    this.prefillForm();
  }

  createModalHTML() {
    return `
      <div class="job-tracker-overlay">
        <div class="job-tracker-content">
          <div class="job-tracker-header">
            <h3>📊 Job Tracker - Add Application</h3>
            <button class="job-tracker-close" id="job-tracker-close">×</button>
          </div>
          
          <div class="job-tracker-body">
            <div class="job-tracker-section">
              <h4>🔍 Auto-Detected Information</h4>
              <div class="job-tracker-detected">
                <div><strong>Job Title:</strong> <span id="detected-title">${this.jobData.jobTitle || 'Not detected'}</span></div>
                <div><strong>Company:</strong> <span id="detected-company">${this.jobData.company || 'Not detected'}</span></div>
                <div><strong>Location:</strong> <span id="detected-location">${this.jobData.location || 'Not detected'}</span></div>
                <div><strong>Portal:</strong> <span id="detected-portal">${this.jobData.jobPortal || 'Not detected'}</span></div>
              </div>
            </div>

            <form id="job-tracker-form" class="job-tracker-form">
              <div class="job-tracker-grid">
                <div class="job-tracker-field">
                  <label>Job Title *</label>
                  <input type="text" id="jt-jobTitle" required>
                </div>
                
                <div class="job-tracker-field">
                  <label>Company *</label>
                  <input type="text" id="jt-company" required>
                </div>
                
                <div class="job-tracker-field">
                  <label>Job Portal</label>
                  <select id="jt-jobPortal">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Glassdoor">Glassdoor</option>
                    <option value="AngelList">AngelList</option>
                    <option value="ZipRecruiter">ZipRecruiter</option>
                    <option value="Company Website">Company Website</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div class="job-tracker-field">
                  <label>Status</label>
                  <select id="jt-status">
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Phone Screen">Phone Screen</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                <div class="job-tracker-field">
                  <label>Location</label>
                  <input type="text" id="jt-location">
                </div>
                
                <div class="job-tracker-field">
                  <label>Priority</label>
                  <select id="jt-priority">
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div class="job-tracker-field">
                  <label>Job Type</label>
                  <select id="jt-jobType">
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                
                <div class="job-tracker-field">
                  <label>Salary Range</label>
                  <input type="text" id="jt-salaryRange" placeholder="e.g., $80k-$100k">
                </div>
              </div>
              
              <div class="job-tracker-field-full">
                <label>Notes</label>
                <textarea id="jt-notes" rows="3" placeholder="Additional notes about this application..."></textarea>
              </div>
              
              <div class="job-tracker-actions">
                <button type="button" id="jt-save" class="job-tracker-btn-primary">💾 Save Application</button>
                <button type="button" id="jt-save-open" class="job-tracker-btn-secondary">💾📱 Save & Open Tracker</button>
                <button type="button" id="jt-cancel" class="job-tracker-btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
          
          <div class="job-tracker-status" id="jt-status-message" style="display: none;"></div>
        </div>
      </div>
    `;
  }

  setupModalEvents(modal) {
    // Close modal
    modal.querySelector('#job-tracker-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('#jt-cancel').addEventListener('click', () => {
      modal.remove();
    });

    // Close on overlay click
    modal.querySelector('.job-tracker-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('job-tracker-overlay')) {
        modal.remove();
      }
    });

    // Save application
    modal.querySelector('#jt-save').addEventListener('click', () => {
      this.saveApplication(false);
    });

    // Save and open tracker
    modal.querySelector('#jt-save-open').addEventListener('click', () => {
      this.saveApplication(true);
    });

    // Prevent form submission
    modal.querySelector('#job-tracker-form').addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  prefillForm() {
    const formData = {
      'jt-jobTitle': this.jobData.jobTitle,
      'jt-company': this.jobData.company,
      'jt-jobPortal': this.jobData.jobPortal,
      'jt-location': this.jobData.location,
      'jt-jobType': this.jobData.jobType,
      'jt-salaryRange': this.jobData.salaryRange
    };

    Object.entries(formData).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element && value) {
        element.value = value;
        // Ensure the field is editable and not disabled
        element.disabled = false;
        element.readOnly = false;
        // Clear any previous restrictions
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'text';
      }
    });

    // Set job URL in hidden field
    const jobUrlInput = document.getElementById('jt-jobUrl');
    if (jobUrlInput) {
      jobUrlInput.value = this.jobData.jobUrl;
    } else {
      // Create hidden field for job URL
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.id = 'jt-jobUrl';
      hiddenInput.value = this.jobData.jobUrl;
      document.getElementById('job-tracker-form').appendChild(hiddenInput);
    }
    
    // Ensure all form fields are interactive
    const allFormFields = document.querySelectorAll('#job-tracker-form input, #job-tracker-form select, #job-tracker-form textarea');
    allFormFields.forEach(field => {
      field.disabled = false;
      field.readOnly = false;
      field.style.pointerEvents = 'auto';
      field.style.cursor = field.tagName === 'SELECT' ? 'pointer' : 'text';
    });
  }

  // FIXED: Enhanced save functionality with immediate website notification
  async saveApplication(openTracker = false) {
    console.log('saveApplication called with openTracker:', openTracker);
    const formData = this.collectFormData();
    console.log('Form data collected:', formData);
    
    if (!formData.jobTitle || !formData.company) {
      this.showStatus('Please fill in required fields (Job Title and Company)', 'error');
      return;
    }

    this.showStatus('Saving application...', 'loading');

    try {
      // Always save to local storage first for immediate response
      console.log('Saving to local storage...');
      await this.saveToLocalStorage(formData);
      console.log('Local storage save completed');
      
      // IMPORTANT: Notify website immediately about new application
      console.log('Notifying website about new application...');
      await this.notifyWebsiteOfNewApplication(formData);
      
      // Try to save to API (local first, then fallback)
      let apiSaveSuccess = false;
      let workingApiUrl = null;
      
      try {
        console.log('Attempting API save to:', this.primaryApiUrl);
        // Save to backend using background script
        const result = await this.saveViaBackgroundScript(formData);
        if (result.success) {
          apiSaveSuccess = true;
          workingApiUrl = this.primaryApiUrl;
          this.showStatus('✅ Application saved and synced to cloud!', 'success');
        } else {
          throw new Error(result.error || 'Background script save failed');
        }
      } catch (localError) {
        console.warn('API save failed:', localError);
        // Try direct API call as fallback
        try {
          await this.saveToAPI(this.primaryApiUrl, formData);
          apiSaveSuccess = true;
          this.showStatus('✅ Application saved and synced to cloud!', 'success');
        } catch (directError) {
          console.warn('Direct API save also failed:', directError);
          this.showStatus('✅ Application saved locally - will sync when online', 'success');
        }
      }

      // Close modal after delay
      setTimeout(() => {
        const modal = document.getElementById('job-tracker-modal');
        if (modal) {
          modal.remove();
        }
        
        if (openTracker) {
          console.log('Opening tracker at:', this.frontendUrl);
          // Open the tracker in the frontend and notify it about the new application
          this.openTrackerWithNewApplication(formData);
        }
      }, 2000);

    } catch (error) {
      console.error('Save failed:', error);
      this.showStatus('❌ Failed to save application', 'error');
    }
  }

  collectFormData() {
    return {
      jobTitle: document.getElementById('jt-jobTitle').value.trim(),
      company: document.getElementById('jt-company').value.trim(),
      jobPortal: document.getElementById('jt-jobPortal').value,
      status: document.getElementById('jt-status').value,
      location: document.getElementById('jt-location').value.trim(),
      priority: document.getElementById('jt-priority').value,
      jobType: document.getElementById('jt-jobType').value,
      salaryRange: document.getElementById('jt-salaryRange').value.trim(),
      notes: document.getElementById('jt-notes').value.trim(),
      jobUrl: this.jobData.jobUrl || window.location.href,
      applicationDate: new Date().toISOString().split('T')[0],
      dateAdded: new Date().toISOString(),
      id: Date.now() + Math.random(),
      resumeVersion: '',
      followUpDate: ''
    };
  }

  // Enhanced Chrome extension storage with better error handling
  async saveToLocalStorage(applicationData) {
    console.log('Attempting to save application data:', applicationData.jobTitle);
    
    return new Promise((resolve, reject) => {
      try {
        // Check if Chrome extension APIs are available
        if (typeof chrome === 'undefined' || !chrome.storage) {
          console.log('Chrome storage not available, using localStorage fallback');
          this.saveToLocalStorageFallback(applicationData);
          resolve();
          return;
        }
        
        chrome.storage.local.get(['jobApplications'], (result) => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage error:', chrome.runtime.lastError.message);
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
              console.warn('Chrome storage set error:', chrome.runtime.lastError.message);
              this.saveToLocalStorageFallback(applicationData);
              resolve();
              return;
            }
            console.log('✅ Application saved to Chrome storage:', applicationData.jobTitle);
            resolve();
          });
        });
      } catch (error) {
        console.warn('Chrome storage exception, using fallback:', error);
        this.saveToLocalStorageFallback(applicationData);
        resolve();
      }
    });
  }
  
  saveToLocalStorageFallback(applicationData) {
    try {
      const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      applications.push(applicationData);
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      localStorage.setItem('lastSync', new Date().toISOString());
      console.log('✅ Application saved to localStorage:', applicationData.jobTitle);
    } catch (localStorageError) {
      console.error('LocalStorage save failed:', localStorageError);
      throw localStorageError;
    }
  }

  // FIXED: Proper notification system for extension
  async notifyWebsiteOfNewApplication(applicationData) {
    try {
      // Send message to background script to handle tab notification
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'notifyApplicationAdded',
          application: applicationData,
          frontendUrl: this.frontendUrl
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Background script communication failed:', chrome.runtime.lastError.message);
          } else {
            console.log('✅ Notified background script about new application');
          }
        });
      }
      
      // Also trigger storage event for immediate sync
      const event = new CustomEvent('applicationAdded', {
        detail: applicationData
      });
      window.dispatchEvent(event);
      
      console.log('✅ Application notification sent');
    } catch (error) {
      console.warn('Failed to notify website:', error);
    }
  }

  // Save via background script (recommended approach for extensions)
  async saveViaBackgroundScript(applicationData) {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage({
        action: 'saveApplication',
        data: applicationData
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  // Enhanced API save with better error handling
  async saveToAPI(apiUrl, applicationData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(`${apiUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Application saved to API:', result);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be offline');
      }
      throw error;
    }
  }

  // Open tracker and highlight the new application
  async openTrackerWithNewApplication(applicationData) {
    try {
      // Open the tracker window
      const trackerWindow = window.open(this.frontendUrl, '_blank');
      
      // Wait a moment for the window to load, then send the application data
      setTimeout(() => {
        if (trackerWindow && !trackerWindow.closed) {
          // Try to communicate with the opened window
          try {
            trackerWindow.postMessage({
              type: 'NEW_APPLICATION_FROM_EXTENSION',
              application: applicationData
            }, '*');
            console.log('✅ Sent application data to tracker window');
          } catch (error) {
            console.warn('Could not send data to tracker window:', error);
          }
        }
      }, 3000); // Wait 3 seconds for the page to load
      
      // Also notify background script to refresh any open tracker tabs
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'notifyApplicationAdded',
          application: applicationData,
          frontendUrl: this.frontendUrl
        });
      }
      
    } catch (error) {
      console.error('Failed to open tracker:', error);
      // Fallback: just open the URL
      window.open(this.frontendUrl, '_blank');
    }
  }

  showStatus(message, type) {
    const statusEl = document.getElementById('jt-status-message');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `job-tracker-status ${type}`;
      statusEl.style.display = 'block';
    }
  }

  setupAutoDetection() {
    // Watch for URL changes (for SPAs)
    let currentUrl = window.location.href;
    
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => {
          this.detectJobData();
        }, 2000); // Wait for content to load
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Watch for form submissions (application submissions)
    this.watchForApplicationSubmission();
  }

  watchForApplicationSubmission() {
    // Common application form selectors
    const applicationSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '[class*="apply"]',
      '[class*="submit"]',
      '[id*="apply"]',
      '[id*="submit"]'
    ];

    applicationSelectors.forEach(selector => {
      document.addEventListener('click', (e) => {
        if (e.target.matches(selector)) {
          const buttonText = e.target.textContent.toLowerCase();
          if (buttonText.includes('apply') || buttonText.includes('submit')) {
            // Delay to allow form submission
            setTimeout(() => {
              this.showQuickSavePrompt();
            }, 1000);
          }
        }
      });
    });
  }

  showQuickSavePrompt() {
    // Don't show if already tracking or if modal is open
    if (this.isTracking || document.getElementById('job-tracker-modal')) {
      return;
    }

    // Quick notification to save the application
    const notification = document.createElement('div');
    notification.className = 'job-tracker-notification';
    notification.innerHTML = `
      <div class="job-tracker-notification-content">
        <div class="job-tracker-notification-text">
          <strong>Job application submitted!</strong>
          <p>Would you like to track this application?</p>
        </div>
        <div class="job-tracker-notification-actions">
          <button class="job-tracker-btn-small job-tracker-btn-primary" id="quick-track">
            📊 Track It
          </button>
          <button class="job-tracker-btn-small job-tracker-btn-cancel" id="quick-dismiss">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 8000);

    // Event listeners
    notification.querySelector('#quick-track').addEventListener('click', () => {
      notification.remove();
      this.showJobTracker();
    });

    notification.querySelector('#quick-dismiss').addEventListener('click', () => {
      notification.remove();
    });
  }
}

// Make class globally accessible
window.JobTrackerExtension = JobTrackerExtension;
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'showJobTracker') {
    // Initialize extension if not already done
    if (!window.jobTrackerExtension) {
      window.jobTrackerExtension = new JobTrackerExtension();
    } else {
      window.jobTrackerExtension.showJobTracker();
    }
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Initialize extension based on site
function initializeExtension() {
  const hostname = window.location.hostname.toLowerCase();
  
  console.log('🚀 Initializing Job Tracker Extension on:', hostname);
  
  // Create global instance
  window.jobTrackerExtension = new JobTrackerExtension();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}