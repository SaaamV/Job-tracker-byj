// Simple Error Handler and Recovery
(function() {
  'use strict';
  
  console.log('🛡️ Loading error handler...');
  
  // Global error handler
  window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    // Don't show error to user for common issues
    const commonErrors = [
      'Script error',
      'ResizeObserver',
      'Non-Error promise rejection',
      'Loading chunk'
    ];
    
    const isCommonError = commonErrors.some(err => 
      e.message && e.message.includes(err)
    );
    
    if (!isCommonError) {
      console.log('Showing error notification for:', e.message);
    }
    
    e.preventDefault();
    return true;
  });
  
  // Handle promise rejections
  window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection:', e.reason);
    e.preventDefault();
    return true;
  });
  
  // Simple notification function
  window.showSimpleNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      background: ${type === 'error' ? '#ff3b30' : type === 'success' ? '#34c759' : '#007AFF'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };
  
  // Add simple animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Error handler loaded');
})();
