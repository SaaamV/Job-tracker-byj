// API Connection Test and Fix
(function() {
  'use strict';

  // Test API connection and provide fallback
  async function testAPIConnection() {
    const backendUrl = 'http://localhost:3001';
    
    try {
      console.log('🔍 Testing API connection...');
      
      // Test health endpoint
      const healthResponse = await fetch(`${backendUrl}/api/health`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ API Health Check:', healthData);
        
        // Update API service base URL if needed
        if (window.apiService) {
          window.apiService.baseURL = backendUrl;
          console.log('✅ API Service updated to use:', backendUrl);
        }
        
        // Show success notification
        if (window.jobTrackerUtils) {
          window.jobTrackerUtils.showSuccess('Connected to MongoDB database!');
        }
        
        return true;
      }
    } catch (error) {
      console.warn('⚠️ API connection failed:', error.message);
      
      // Show offline notification
      if (window.jobTrackerUtils) {
        window.jobTrackerUtils.showInfo('Running in offline mode - data saved locally');
      }
      
      return false;
    }
  }

  // Enhanced API routing fix
  function fixAPIRouting() {
    // Override fetch for API calls to redirect to correct backend
    const originalFetch = window.fetch;
    
    window.fetch = function(url, options = {}) {
      // If it's an API call to the frontend port, redirect to backend
      if (typeof url === 'string') {
        if (url.includes(':8080/api/')) {
          url = url.replace(':8080/api/', ':3001/api/');
          console.log('🔄 Redirected API call to:', url);
        } else if (url.startsWith('/api/')) {
          url = 'http://localhost:3001' + url;
          console.log('🔄 Redirected relative API call to:', url);
        }
      }
      
      return originalFetch.call(this, url, options);
    };
    
    // Also override any direct health check calls
    const originalXHR = window.XMLHttpRequest;
    const originalOpen = originalXHR.prototype.open;
    
    originalXHR.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string' && url.includes('/api/')) {
        if (url.startsWith('/api/')) {
          url = 'http://localhost:3001' + url;
        } else if (url.includes(':8080/api/')) {
          url = url.replace(':8080/api/', ':3001/api/');
        }
      }
      return originalOpen.call(this, method, url, ...args);
    };
  }

  // Initialize API connection test
  document.addEventListener('DOMContentLoaded', async () => {
    // Fix API routing first
    fixAPIRouting();
    
    // Wait a bit for other scripts to load
    setTimeout(async () => {
      await testAPIConnection();
    }, 1000);
  });

  console.log('🔧 API Connection Fix loaded');
})();
