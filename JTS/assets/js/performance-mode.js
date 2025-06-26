// Performance Mode Toggle for Job Tracker
(function() {
  'use strict';

  // Detect if we should use performance mode
  function shouldUsePerformanceMode() {
    const checks = {
      // Low memory devices
      lowMemory: navigator.deviceMemory && navigator.deviceMemory < 4,
      // Few CPU cores
      lowCores: navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4,
      // Mobile devices
      mobile: /Mobi|Android/i.test(navigator.userAgent),
      // Slow connection
      slowConnection: navigator.connection && navigator.connection.effectiveType && 
                     ['slow-2g', '2g'].includes(navigator.connection.effectiveType)
    };

    console.log('Device performance checks:', checks);
    
    // Use performance mode if any check indicates low performance
    return Object.values(checks).some(check => check);
  }

  // Apply performance mode
  function enablePerformanceMode() {
    console.log('🚀 Enabling performance mode for better experience');
    
    // Add performance class to body
    document.body.classList.add('performance-mode');
    
    // Remove particles immediately
    const particles = document.querySelectorAll('.particle');
    particles.forEach(p => p.remove());
    
    // Disable background animations
    const style = document.createElement('style');
    style.id = 'performance-mode-styles';
    style.textContent = `
      .performance-mode .particle { display: none !important; }
      .performance-mode body::after { animation: none !important; }
      .performance-mode .stat-card { animation: none !important; }
      .performance-mode .form-section:hover,
      .performance-mode .stat-card:hover,
      .performance-mode .contact-card:hover { 
        transform: translateY(-2px) !important; 
        transition: transform 0.2s ease !important;
      }
      .performance-mode .header::before { display: none !important; }
      .performance-mode .gradient-flow { animation: none !important; }
    `;
    document.head.appendChild(style);
    
    // Override CONFIG if it exists
    if (window.CONFIG) {
      window.CONFIG.particleCount = 0;
      window.CONFIG.magneticSensitivity = 0.01;
    }
    
    // Show notification
    setTimeout(() => {
      if (window.jobTrackerUtils) {
        window.jobTrackerUtils.showInfo('Performance mode enabled for better experience');
      }
    }, 500);
  }

  // Initialize performance mode check
  function initPerformanceMode() {
    // Check immediately
    if (shouldUsePerformanceMode()) {
      enablePerformanceMode();
    }

    // Also check after page loads
    window.addEventListener('load', () => {
      // Monitor FPS for first few seconds
      let frameCount = 0;
      let lastTime = performance.now();
      let lowFpsCounter = 0;

      function checkInitialPerformance() {
        frameCount++;
        const currentTime = performance.now();

        if (currentTime >= lastTime + 1000) {
          const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          
          if (fps < 25) {
            lowFpsCounter++;
            console.log(`Low FPS detected: ${fps}fps (check ${lowFpsCounter}/3)`);
            
            if (lowFpsCounter >= 3) {
              console.log('Consistently low FPS, enabling performance mode');
              enablePerformanceMode();
              return; // Stop monitoring
            }
          } else {
            lowFpsCounter = Math.max(0, lowFpsCounter - 1);
          }

          frameCount = 0;
          lastTime = currentTime;
        }

        // Monitor for 10 seconds
        if (currentTime - lastTime < 10000) {
          requestAnimationFrame(checkInitialPerformance);
        }
      }

      requestAnimationFrame(checkInitialPerformance);
    });
  }

  // Add manual toggle for performance mode
  function addPerformanceToggle() {
    const toggle = document.createElement('button');
    toggle.innerHTML = '⚡ Performance Mode';
    toggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      padding: 8px 12px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    `;
    
    toggle.addEventListener('click', () => {
      if (document.body.classList.contains('performance-mode')) {
        // Disable performance mode
        document.body.classList.remove('performance-mode');
        const style = document.getElementById('performance-mode-styles');
        if (style) style.remove();
        toggle.innerHTML = '⚡ Performance Mode';
        
        if (window.jobTrackerUtils) {
          window.jobTrackerUtils.showInfo('Performance mode disabled');
        }
      } else {
        // Enable performance mode
        enablePerformanceMode();
        toggle.innerHTML = '✨ Full Animations';
      }
    });

    toggle.addEventListener('mouseenter', () => {
      toggle.style.opacity = '1';
    });

    toggle.addEventListener('mouseleave', () => {
      toggle.style.opacity = '0.7';
    });

    document.body.appendChild(toggle);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceMode();
      addPerformanceToggle();
    });
  } else {
    initPerformanceMode();
    addPerformanceToggle();
  }

  console.log('🎛️ Performance mode controller loaded');
})();
