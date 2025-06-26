// Enhanced Apple-Inspired Animations and Interactions
// This file adds dynamic effects to the existing Job Tracker without breaking functionality

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    particleCount: 15,         // Reduced from 30
    notificationDuration: 3000,
    scrollThreshold: 0.1,
    magneticSensitivity: 0.05  // Reduced sensitivity
  };

  // Utility Functions
  const utils = {
    // Debounce function for performance
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Check if user prefers reduced motion
    prefersReducedMotion: () => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    // Generate random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,

    // Check if element is in viewport
    isInViewport: (element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  };

  // Particle System
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.container = null;
      this.init();
    }

    init() {
      // Create particles container
      this.container = document.createElement('div');
      this.container.className = 'particles';
      this.container.id = 'particles';
      document.body.appendChild(this.container);

      // Create particles
      this.createParticles();
    }

    createParticles() {
      if (utils.prefersReducedMotion()) return;

      // Reduce particle count further on mobile
      const particleCount = window.innerWidth < 768 ? 5 : CONFIG.particleCount;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 20) + 's'; // Slower particles
        
        this.container.appendChild(particle);
        this.particles.push(particle);
      }
    }

    destroy() {
      if (this.container) {
        this.container.remove();
      }
    }
  }

  // Tab System Enhancement
  class EnhancedTabs {
    constructor() {
      this.tabsContainer = document.querySelector('.tabs');
      this.tabs = document.querySelectorAll('.tab');
      this.indicator = null;
      this.init();
    }

    init() {
      if (!this.tabsContainer) return;

      // Create tab indicator
      this.createIndicator();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize indicator position
      this.updateIndicator();
    }

    createIndicator() {
      this.indicator = document.createElement('div');
      this.indicator.className = 'tab-indicator';
      this.indicator.id = 'tabIndicator';
      this.tabsContainer.appendChild(this.indicator);
    }

    setupEventListeners() {
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          this.handleTabClick(e.target);
        });
      });

      // Update indicator on window resize
      window.addEventListener('resize', utils.debounce(() => {
        this.updateIndicator();
      }, 100));
    }

    handleTabClick(clickedTab) {
      // Remove active class from all tabs
      this.tabs.forEach(tab => tab.classList.remove('active'));
      
      // Add active class to clicked tab
      clickedTab.classList.add('active');
      
      // Update indicator
      this.updateIndicator(clickedTab);
      
      // Add haptic feedback
      this.addHapticFeedback();
    }

    updateIndicator(activeTab = null) {
      if (!this.indicator) return;

      const active = activeTab || document.querySelector('.tab.active');
      if (!active) return;

      const tabRect = active.getBoundingClientRect();
      const containerRect = this.tabsContainer.getBoundingClientRect();
      
      const left = tabRect.left - containerRect.left - 4;
      const width = tabRect.width;
      
      this.indicator.style.left = left + 'px';
      this.indicator.style.width = width + 'px';
    }

    addHapticFeedback() {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }

  // Magnetic Mouse Effect
  class MagneticEffect {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      // Select elements for magnetic effect
      this.elements = document.querySelectorAll('.stat-card, .form-section, .contact-card, .chart-container');
      
      if (utils.prefersReducedMotion()) return;

      this.setupEventListeners();
    }

    setupEventListeners() {
      this.elements.forEach(element => {
        element.classList.add('magnetic-card');
        
        element.addEventListener('mousemove', (e) => {
          this.handleMouseMove(e, element);
        });
        
        element.addEventListener('mouseleave', () => {
          this.handleMouseLeave(element);
        });
      });
    }

    handleMouseMove(e, element) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const tiltX = (y / rect.height) * 10 * CONFIG.magneticSensitivity;
      const tiltY = (x / rect.width) * -10 * CONFIG.magneticSensitivity;
      
      element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    }

    handleMouseLeave(element) {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }
  }

  // Counter Animation
  class CounterAnimation {
    constructor() {
      this.counters = document.querySelectorAll('.stat-card h3');
      this.init();
    }

    init() {
      if (utils.prefersReducedMotion()) return;
      
      // Use Intersection Observer to trigger animation when visible
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            this.animateCounter(entry.target);
            entry.target.dataset.animated = 'true';
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => {
        observer.observe(counter);
      });
    }

    animateCounter(counter) {
      const text = counter.textContent;
      const number = parseInt(text.replace(/[^\d]/g, ''));
      const suffix = text.replace(/[\d]/g, '');
      
      if (isNaN(number)) return;

      const duration = 2000;
      const step = number / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }
        
        counter.textContent = Math.floor(current) + suffix;
      }, 16);
    }
  }

  // Scroll Animations
  class ScrollAnimations {
    constructor() {
      this.elements = [];
      this.init();
    }

    init() {
      // Add scroll-reveal class to elements
      this.elements = document.querySelectorAll('.form-section, .stat-card, .contact-card, .chart-container');
      
      this.elements.forEach(el => {
        el.classList.add('scroll-reveal');
      });

      // Set up Intersection Observer
      this.setupObserver();
    }

    setupObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, {
        threshold: CONFIG.scrollThreshold,
        rootMargin: '0px 0px -50px 0px'
      });
      
      this.elements.forEach(el => observer.observe(el));
    }
  }

  // Button Ripple Effect
  class RippleEffect {
    constructor() {
      this.buttons = document.querySelectorAll('.btn');
      this.init();
    }

    init() {
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          this.createRipple(e, button);
        });
      });
    }

    createRipple(e, button) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }

  // Notification System
  class NotificationSystem {
    constructor() {
      this.notifications = [];
    }

    show(message, type = 'info', duration = CONFIG.notificationDuration) {
      const notification = this.createNotification(message, type);
      document.body.appendChild(notification);
      
      // Auto remove after duration
      setTimeout(() => {
        this.remove(notification);
      }, duration);
      
      return notification;
    }

    createNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
          <div style="font-weight: 600;">${message}</div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; opacity: 0.7; hover: opacity: 1;">×</button>
        </div>
      `;
      
      this.notifications.push(notification);
      return notification;
    }

    remove(notification) {
      if (notification && notification.parentElement) {
        notification.style.animation = 'notificationSlide 0.5s reverse';
        setTimeout(() => {
          notification.remove();
          this.notifications = this.notifications.filter(n => n !== notification);
        }, 500);
      }
    }
  }

  // Input Enhancement
  class InputEnhancement {
    constructor() {
      this.inputs = document.querySelectorAll('input, select, textarea');
      this.init();
    }

    init() {
      this.setupEventListeners();
    }

    setupEventListeners() {
      this.inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (input.parentElement) {
            input.parentElement.classList.add('focused');
          }
        });
        
        input.addEventListener('blur', () => {
          if (input.parentElement) {
            input.parentElement.classList.remove('focused');
          }
        });
      });
    }
  }

  // Mouse Movement Background Effect
  class MouseBackgroundEffect {
    constructor() {
      this.background = null;
      this.init();
    }

    init() {
      if (utils.prefersReducedMotion()) return;

      this.background = document.querySelector('body::after') || document.body;
      this.setupEventListeners();
    }

    setupEventListeners() {
      document.addEventListener('mousemove', utils.debounce((e) => {
        this.handleMouseMove(e);
      }, 50));
    }

    handleMouseMove(e) {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      // Update CSS custom properties for background position
      document.documentElement.style.setProperty('--mouse-x', x + '%');
      document.documentElement.style.setProperty('--mouse-y', y + '%');
    }
  }

  // Main Application Class
  class EnhancedJobTracker {
    constructor() {
      this.components = {};
      this.notifications = new NotificationSystem();
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.initializeComponents();
        });
      } else {
        this.initializeComponents();
      }
    }

    initializeComponents() {
      try {
        // Check device performance before enabling animations
        const isLowEndDevice = this.detectLowEndDevice();
        
        if (isLowEndDevice) {
          console.log('⚠️ Low-end device detected, reducing animations');
          document.body.classList.add('reduced-animations');
          CONFIG.particleCount = 5;
          CONFIG.magneticSensitivity = 0.02;
        }
        
        // Initialize all components
        this.components.particles = new ParticleSystem();
        this.components.tabs = new EnhancedTabs();
        this.components.magnetic = new MagneticEffect();
        this.components.counters = new CounterAnimation();
        this.components.scrollAnimations = new ScrollAnimations();
        this.components.rippleEffect = new RippleEffect();
        this.components.inputEnhancement = new InputEnhancement();
        this.components.mouseBackground = new MouseBackgroundEffect();

        // Show welcome notification
        setTimeout(() => {
          this.notifications.show('🚀 Enhanced animations loaded successfully!', 'success');
        }, 1000);

        console.log('🎉 Enhanced Job Tracker initialized with Apple-inspired animations!');
        
        // Make notification system globally available
        window.jobTrackerNotifications = this.notifications;
        
        // Expose enhanced tab switching function
        window.enhancedSwitchTab = (tabName, element) => {
          this.switchTab(tabName, element);
        };

      } catch (error) {
        console.error('Error initializing enhanced components:', error);
      }
    }
    
    detectLowEndDevice() {
      // Check various indicators of device performance
      const checks = {
        memory: navigator.deviceMemory && navigator.deviceMemory < 4,
        cores: navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4,
        mobile: /Mobi|Android/i.test(navigator.userAgent),
        oldBrowser: !window.IntersectionObserver
      };
      
      // If any check indicates low-end, reduce animations
      return Object.values(checks).some(check => check);
    }

    switchTab(tabName, element) {
      // Hide all tab contents
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected tab content
      const selectedContent = document.getElementById(tabName);
      if (selectedContent) {
        selectedContent.classList.add('active');
      }
      
      // Update tabs (handled by EnhancedTabs component)
      if (this.components.tabs) {
        this.components.tabs.handleTabClick(element);
      }
    }

    // Public API for other scripts
    getNotificationSystem() {
      return this.notifications;
    }

    showNotification(message, type = 'info') {
      return this.notifications.show(message, type);
    }

    // Cleanup method
    destroy() {
      Object.values(this.components).forEach(component => {
        if (component.destroy) {
          component.destroy();
        }
      });
    }
  }

  // Initialize the enhanced job tracker
  const enhancedJobTracker = new EnhancedJobTracker();

  // Make it globally available
  window.enhancedJobTracker = enhancedJobTracker;

  // Compatibility with existing switchTab function
  const originalSwitchTab = window.switchTab;
  window.switchTab = function(tabName, element) {
    // Call original function if it exists
    if (originalSwitchTab) {
      originalSwitchTab(tabName, element);
    }
    
    // Call enhanced tab switching
    if (enhancedJobTracker.components.tabs) {
      enhancedJobTracker.components.tabs.handleTabClick(element);
    }
  };

  // Enhanced form submission handlers
  function enhanceFormSubmissions() {
    // Find all forms and buttons
    const forms = document.querySelectorAll('form');
    const submitButtons = document.querySelectorAll('.btn-success, button[onclick*="add"], button[onclick*="upload"]');
    
    submitButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Show loading state
        const originalText = button.textContent;
        button.innerHTML = '<span class="loading-spinner" style="width: 20px; height: 20px; margin-right: 8px;"></span>' + originalText;
        button.disabled = true;
        
        // Restore button after 2 seconds (adjust based on your actual form submission time)
        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
        }, 2000);
      });
    });
  }

  // Enhanced error handling
  function setupEnhancedErrorHandling() {
    // Override console.error to show notifications
    const originalError = console.error;
    console.error = function(...args) {
      originalError.apply(console, args);
      
      // Show error notification for user-facing errors
      const errorMessage = args.join(' ');
      if (errorMessage.toLowerCase().includes('failed') || 
          errorMessage.toLowerCase().includes('error')) {
        enhancedJobTracker.showNotification('An error occurred. Please try again.', 'error');
      }
    };
    
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });
  }

  // Performance monitoring
  function setupPerformanceMonitoring() {
    // Monitor animation performance
    let frameCount = 0;
    let lastTime = performance.now();
    let lowFpsCount = 0;
    
    function monitorFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // If FPS is too low, reduce animation complexity
        if (fps < 30 && !utils.prefersReducedMotion()) {
          lowFpsCount++;
          
          // Only warn occasionally to avoid spam
          if (lowFpsCount % 5 === 1) {
            console.warn('Low FPS detected, reducing animation complexity');
          }
          
          // Progressively reduce animations
          if (lowFpsCount > 3) {
            document.body.classList.add('reduced-animations');
            
            // Remove particles if performance is really bad
            if (lowFpsCount > 6) {
              const particles = document.querySelectorAll('.particle');
              particles.forEach(p => p.remove());
            }
          }
        } else if (fps >= 50) {
          // Reset low FPS count if performance improves
          lowFpsCount = Math.max(0, lowFpsCount - 1);
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // Only continue monitoring if we haven't disabled animations
      if (!document.body.classList.contains('reduced-animations')) {
        requestAnimationFrame(monitorFPS);
      }
    }
    
    requestAnimationFrame(monitorFPS);
  }

  // Initialize additional enhancements
  document.addEventListener('DOMContentLoaded', () => {
    enhanceFormSubmissions();
    setupEnhancedErrorHandling();
    setupPerformanceMonitoring();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
      // Tab navigation with arrow keys
      if (e.target.classList.contains('tab')) {
        const tabs = Array.from(document.querySelectorAll('.tab'));
        const currentIndex = tabs.indexOf(e.target);
        
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
          e.preventDefault();
          tabs[currentIndex - 1].click();
          tabs[currentIndex - 1].focus();
        } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
          e.preventDefault();
          tabs[currentIndex + 1].click();
          tabs[currentIndex + 1].focus();
        }
      }
      
      // Escape key to close notifications
      if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
      }
    });
  });

  // Utility functions for other scripts to use
  window.jobTrackerUtils = {
    showSuccess: (message) => enhancedJobTracker.showNotification(message, 'success'),
    showError: (message) => enhancedJobTracker.showNotification(message, 'error'),
    showInfo: (message) => enhancedJobTracker.showNotification(message, 'info'),
    
    // Add loading state to any element
    addLoadingState: (element, text = 'Loading...') => {
      element.dataset.originalContent = element.innerHTML;
      element.innerHTML = `<span class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px;"></span>${text}`;
      element.disabled = true;
    },
    
    // Remove loading state
    removeLoadingState: (element) => {
      if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        element.disabled = false;
        delete element.dataset.originalContent;
      }
    },
    
    // Animate counter
    animateCounter: (element, target, suffix = '') => {
      const duration = 1000;
      const step = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
      }, 16);
    }
  };

})();
