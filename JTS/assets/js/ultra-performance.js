// Ultra Performance Mode - Disable all heavy animations
(function() {
  'use strict';
  
  console.log('⚡ Loading ultra performance mode...');
  
  // Add performance styles immediately
  const style = document.createElement('style');
  style.id = 'ultra-performance';
  style.textContent = `
    /* Disable all heavy animations immediately */
    .particle { display: none !important; }
    body::after { display: none !important; }
    .stat-card { animation: none !important; }
    .form-section { animation: none !important; }
    .header { animation: none !important; }
    
    /* Simple hover effects only */
    .form-section:hover,
    .stat-card:hover,
    .contact-card:hover {
      transform: translateY(-2px) !important;
      transition: transform 0.2s ease !important;
    }
    
    /* Disable gradient animations */
    .header h1 { 
      background: var(--primary) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      animation: none !important;
    }
    
    /* Disable shimmer effects */
    .header::before,
    .stat-card::before,
    .form-section::before { display: none !important; }
  `;
  
  // Insert styles immediately
  if (document.head) {
    document.head.appendChild(style);
  } else {
    // If head doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(style);
    });
  }
  
  // Override animation config immediately
  window.CONFIG = {
    particleCount: 0,
    notificationDuration: 2000,
    scrollThreshold: 0.3,
    magneticSensitivity: 0
  };
  
  console.log('✅ Ultra performance mode loaded');
})();
