// Configuration Module - Central Configuration Management
// Handles all application settings, constants, and environment configuration

(function() {
  'use strict';
  
  console.log('⚙️ Loading Configuration Module...');
  
  // Application Configuration
  const CONFIG = {
    // Application Info
    app: {
      name: 'Job Tracker System',
      version: '2.0.0',
      description: 'Comprehensive job application tracking with Apple-inspired design'
    },
    
    // API Configuration
    api: {
      baseURL: determineAPIBaseURL(),
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      endpoints: {
        health: '/health',
        applications: '/applications',
        contacts: '/contacts',
        sync: '/sync',
        stats: '/applications/stats'
      }
    },
    
    // Storage Configuration
    storage: {
      keys: {
        applications: 'jobApplications',
        contacts: 'jobContacts',
        resumes: 'jobResumes',
        pendingSync: 'pendingSync',
        lastSync: 'lastApiSync',
        settings: 'appSettings'
      },
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    },
    
    // UI Configuration
    ui: {
      animations: {
        enabled: true,
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      notifications: {
        duration: 4000,
        position: 'top-right'
      },
      themes: {
        default: 'light',
        available: ['light', 'dark', 'auto']
      },
      performance: {
        particleCount: 50,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
    },
    
    // Form Defaults
    defaults: {
      application: {
        status: 'Applied',
        priority: 'Medium',
        date: () => new Date().toISOString().split('T')[0]
      },
      resume: {
        type: 'General'
      },
      contact: {
        relationship: 'Potential Referral',
        status: 'Not Contacted'
      }
    },
    
    // Validation Rules
    validation: {
      application: {
        required: ['jobTitle', 'company'],
        maxLength: {
          jobTitle: 100,
          company: 100,
          notes: 1000
        }
      },
      resume: {
        required: ['name'],
        maxLength: {
          name: 100,
          description: 500
        }
      },
      contact: {
        required: ['name'],
        maxLength: {
          name: 100,
          notes: 1000
        }
      }
    },
    
    // Integration Settings
    integrations: {
      chrome: {
        enabled: typeof chrome !== 'undefined' && chrome.storage,
        syncInterval: 30000 // 30 seconds
      },
      googleSheets: {
        enabled: false,
        clientId: null,
        apiKey: null
      }
    },
    
    // Features Flags
    features: {
      offlineMode: true,
      autoSync: true,
      analytics: true,
      export: true,
      chromeExtension: true,
      darkMode: true,
      animations: !CONFIG?.ui?.performance?.reducedMotion
    },
    
    // Debug Configuration
    debug: {
      enabled: window.location.hostname === 'localhost',
      logLevel: 'info', // 'error', 'warn', 'info', 'debug'
      apiLogging: true,
      performanceLogging: false
    }
  };
  
  // Determine API Base URL based on environment
  function determineAPIBaseURL() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost') {
      // Development environment - API Gateway runs on port 3000
      return 'http://localhost:3000';
    } else {
      // Production environment (Vercel)
      return window.location.origin;
    }
  }
  
  // Environment Detection
  const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname !== 'localhost',
    isExtension: typeof chrome !== 'undefined' && chrome.runtime,
    isOnline: navigator.onLine,
    userAgent: navigator.userAgent,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isAppleDevice: /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsLocalStorage: typeof Storage !== 'undefined'
  };
  
  // Application Status Definitions
  const APPLICATION_STATUSES = [
    'Applied',
    'Under Review',
    'Phone Screen',
    'Technical Assessment',
    'Interview Scheduled',
    'Final Interview',
    'Offer',
    'Rejected',
    'Withdrawn',
    'On Hold'
  ];
  
  const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];
  
  const JOB_PORTALS = [
    'LinkedIn',
    'Indeed',
    'Glassdoor',
    'Company Website',
    'AngelList',
    'Monster',
    'ZipRecruiter',
    'Dice',
    'CareerBuilder',
    'Other'
  ];
  
  const JOB_TYPES = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote',
    'Hybrid',
    'On-site'
  ];
  
  const CONTACT_RELATIONSHIPS = [
    'Potential Referral',
    'Recruiter',
    'Hiring Manager',
    'Employee',
    'Network Contact',
    'Alumni',
    'Industry Contact'
  ];
  
  const CONTACT_STATUSES = [
    'Not Contacted',
    'Reached Out',
    'Responded',
    'Meeting Scheduled',
    'Referred',
    'Cold Contact'
  ];
  
  const RESUME_TYPES = [
    'General',
    'Technical',
    'Senior Level',
    'Entry Level',
    'Industry Specific',
    'Custom'
  ];
  
  // Utility Functions
  const Utils = {
    // Get configuration value safely
    get: (path, defaultValue = null) => {
      const keys = path.split('.');
      let value = CONFIG;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return defaultValue;
        }
      }
      
      return value;
    },
    
    // Set configuration value
    set: (path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      let target = CONFIG;
      
      for (const key of keys) {
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      
      target[lastKey] = value;
    },
    
    // Check if feature is enabled
    isFeatureEnabled: (feature) => {
      return CONFIG.features[feature] === true;
    },
    
    // Get storage key
    getStorageKey: (key) => {
      return CONFIG.storage.keys[key] || key;
    },
    
    // Validate file
    isValidFile: (file, type = 'resume') => {
      if (!file) return { valid: false, error: 'No file provided' };
      
      if (file.size > CONFIG.storage.maxFileSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
      }
      
      if (!CONFIG.storage.allowedFileTypes.includes(file.type)) {
        return { valid: false, error: 'File type not allowed. Please use PDF or Word documents.' };
      }
      
      return { valid: true };
    },
    
    // Log with level checking
    log: (level, message, ...args) => {
      if (!CONFIG.debug.enabled) return;
      
      const levels = ['error', 'warn', 'info', 'debug'];
      const configLevel = levels.indexOf(CONFIG.debug.logLevel);
      const messageLevel = levels.indexOf(level);
      
      if (messageLevel <= configLevel) {
        console[level](`[${level.toUpperCase()}]`, message, ...args);
      }
    }
  };
  
  // Performance Monitoring
  const Performance = {
    marks: new Map(),
    
    mark: (name) => {
      if (CONFIG.debug.performanceLogging) {
        Performance.marks.set(name, performance.now());
      }
    },
    
    measure: (name, startMark) => {
      if (CONFIG.debug.performanceLogging && Performance.marks.has(startMark)) {
        const duration = performance.now() - Performance.marks.get(startMark);
        console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    }
  };
  
  // Export to global scope
  window.CONFIG = CONFIG;
  window.ENVIRONMENT = ENVIRONMENT;
  window.APPLICATION_STATUSES = APPLICATION_STATUSES;
  window.PRIORITY_LEVELS = PRIORITY_LEVELS;
  window.JOB_PORTALS = JOB_PORTALS;
  window.JOB_TYPES = JOB_TYPES;
  window.CONTACT_RELATIONSHIPS = CONTACT_RELATIONSHIPS;
  window.CONTACT_STATUSES = CONTACT_STATUSES;
  window.RESUME_TYPES = RESUME_TYPES;
  window.ConfigUtils = Utils;
  window.Performance = Performance;
  
  // Initialize theme based on user preference
  if (ENVIRONMENT.isAppleDevice) {
    document.body.classList.add('apple-device');
  }
  
  if (CONFIG.ui.performance.reducedMotion) {
    document.body.classList.add('reduced-motion');
  }
  
  console.log('⚙️ Configuration module loaded successfully');
  console.log('🌍 Environment:', ENVIRONMENT.isDevelopment ? 'Development' : 'Production');
  console.log('📱 Device:', ENVIRONMENT.isMobile ? 'Mobile' : 'Desktop');
  
})();