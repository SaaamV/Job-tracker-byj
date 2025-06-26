// Immediate API Fix - Load before everything else
(function() {
  'use strict';
  
  console.log('🔧 Loading immediate API fix...');
  
  // Override fetch IMMEDIATELY before any other scripts run
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    if (typeof url === 'string') {
      // Redirect any API calls to correct backend port
      if (url.startsWith('/api/')) {
        url = 'http://localhost:3001' + url;
        console.log('🔄 API redirect:', url);
      } else if (url.includes(':8080/api/')) {
        url = url.replace(':8080/api/', ':3001/api/');
        console.log('🔄 API redirect:', url);
      }
    }
    return originalFetch.call(this, url, options);
  };
  
  // Override XMLHttpRequest as well
  const OriginalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
      if (typeof url === 'string') {
        if (url.startsWith('/api/')) {
          url = 'http://localhost:3001' + url;
          console.log('🔄 XHR redirect:', url);
        } else if (url.includes(':8080/api/')) {
          url = url.replace(':8080/api/', ':3001/api/');
          console.log('🔄 XHR redirect:', url);
        }
      }
      return originalOpen.call(this, method, url, ...args);
    };
    
    return xhr;
  };
  
  console.log('✅ Immediate API fix loaded');
})();
