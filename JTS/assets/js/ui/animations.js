// Apple-Inspired Static UI Enhancements (No Movement)
(function() {
  'use strict';
  
  console.log('🎨 Loading static Apple-inspired enhancements...');
  
  // ===== USER INPUT TRACKING =====
  // Track user input state (kept for potential future use)
  let isUserTyping = false;
  let typingTimeout = null;
  
  function setupTypingDetection() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // User starts typing
      input.addEventListener('input', function() {
        if (!isUserTyping) {
          isUserTyping = true;
          document.body.classList.add('user-typing');
          console.log('🔒 User started typing - maintaining static state');
        }
        
        // Reset timeout on every keystroke
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          isUserTyping = false;
          document.body.classList.remove('user-typing');
          console.log('🔓 User stopped typing - maintaining static state');
        }, 2000);
      });
      
      input.addEventListener('focus', function() {
        isUserTyping = true;
        document.body.classList.add('user-typing');
        clearTimeout(typingTimeout);
      });
      
      input.addEventListener('blur', function() {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          isUserTyping = false;
          document.body.classList.remove('user-typing');
        }, 500);
      });
    });
  }
  
  // REMOVED: Particle System - No moving elements
  function createParticleSystem() {
    // Disabled - no moving particles
    console.log('🚫 Particle system disabled for static UI');
  }
  
  // Enhanced Tab Switching with Static Indicator
  function enhanceTabSwitching() {
    const tabs = document.querySelectorAll('.tab');
    const tabsContainer = document.querySelector('.tabs');
    
    if (!tabsContainer || tabs.length === 0) return;
    
    // Create tab indicator if it doesn't exist
    let indicator = document.querySelector('.tab-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'tab-indicator';
      tabsContainer.insertBefore(indicator, tabsContainer.firstChild);
    }
    
    function updateIndicator(activeTab) {
      const left = activeTab.offsetLeft;
      const width = activeTab.offsetWidth;
      
      // Static positioning without animation
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${width}px`;
    }
    
    // Update indicator on tab click
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        updateIndicator(tab);
      });
    });
    
    // Initialize indicator position
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      updateIndicator(activeTab);
    }
    
    // Update on window resize
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.tab.active');
      if (currentActive) {
        updateIndicator(currentActive);
      }
    });
  }
  
  // STATIC Button Effects - No Movement
  function addStaticButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      // Only add click feedback, no hover movement
      button.addEventListener('mousedown', function() {
        this.style.opacity = '0.9';
      });
      
      button.addEventListener('mouseup', function() {
        this.style.opacity = '1';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.opacity = '1';
      });
    });
  }
  
  // Ripple Effect for Buttons (Static - only visual feedback)
  function addRippleEffects() {
    document.addEventListener('click', function(e) {
      if (e.target.matches('.btn')) {
        const button = e.target;
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
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      }
    });
  }
  
  // STATIC Card Effects - No Movement or Rotation
  function enhanceStaticCardEffects() {
    const cards = document.querySelectorAll('.form-section, .stat-card, .chart-container');
    
    cards.forEach(card => {
      // Only add subtle visual feedback without movement
      card.addEventListener('mouseenter', function() {
        this.style.opacity = '0.95';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.opacity = '1';
      });
    });
  }
  
  // Scroll Reveal Animation (Keep but make subtle)
  function setupScrollReveal() {
    const elements = document.querySelectorAll('.form-section, .stat-card, .chart-container');
    
    elements.forEach(el => {
      el.classList.add('scroll-reveal');
    });
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
      observer.observe(el);
    });
  }
  
  // Counter Animation for Stats (Keep this as it's not mouse-dependent)
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-card h3');
    
    const animateCounter = (element, target, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        if (target % 1 === 0) {
          element.textContent = Math.floor(current);
        } else {
          element.textContent = current.toFixed(1);
        }
      }, 16);
    };
    
    counters.forEach(counter => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const text = counter.textContent;
            const number = parseFloat(text.replace(/[^0-9.]/g, ''));
            
            if (!isNaN(number)) {
              counter.textContent = '0';
              animateCounter(counter, number);
            }
            
            observer.unobserve(counter);
          }
        });
      });
      
      observer.observe(counter);
    });
  }
  
  // STATIC Input Focus Effects - No Movement
  function enhanceStaticInputFocus() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        // No transform/movement, just visual state
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
      });
    });
  }
  
  // Notification System (Keep but static)
  function createNotificationSystem() {
    window.showNotification = function(message, type = 'info', duration = 4000) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      // Simple fade in instead of slide animation
      notification.style.opacity = '0';
      
      document.body.appendChild(notification);
      
      // Simple fade in
      setTimeout(() => {
        notification.style.opacity = '1';
      }, 10);
      
      // Auto-remove notification
      setTimeout(() => {
        notification.style.opacity = '0';
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }, duration);
    };
  }
  
  // Performance Monitoring (Simplified for static UI)
  function setupPerformanceOptimizations() {
    // Detect if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
    
    // Always add static class to disable movement
    document.body.classList.add('static-ui');
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.body.classList.add('reduced-animations');
      } else {
        setTimeout(() => {
          document.body.classList.remove('reduced-animations');
        }, 500);
      }
    });
  }
  
  // STATIC Floating Action Button - No Movement
  function createStaticFloatingActionButton() {
    const fab = document.createElement('button');
    fab.className = 'fab static-fab';
    fab.innerHTML = '+';
    fab.title = 'Quick Add Application';
    
    fab.addEventListener('click', () => {
      // Focus on the first input in the applications tab
      const jobTitleInput = document.getElementById('jobTitle');
      if (jobTitleInput) {
        // Switch to applications tab if not active
        const applicationsTab = document.querySelector('[onclick*=\"applications\"]');
        if (applicationsTab && !applicationsTab.classList.contains('active')) {
          applicationsTab.click();
        }
        
        // Focus and scroll to input
        setTimeout(() => {
          jobTitleInput.focus();
          jobTitleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
    
    // Simple visual feedback without movement
    fab.addEventListener('mousedown', () => {
      fab.style.opacity = '0.8';
    });
    
    fab.addEventListener('mouseup', () => {
      fab.style.opacity = '1';
    });
    
    fab.addEventListener('mouseleave', () => {
      fab.style.opacity = '1';
    });
    
    document.body.appendChild(fab);
  }
  
  // Initialize everything with static behavior
  function initialize() {
    console.log('🚀 Initializing static Apple-inspired enhancements...');
    
    // Setup performance optimizations first
    setupPerformanceOptimizations();
    
    // Setup typing detection
    setupTypingDetection();
    
    // Core enhancements (all static versions)
    enhanceTabSwitching();
    addStaticButtonEffects();
    addRippleEffects();
    enhanceStaticCardEffects();
    enhanceStaticInputFocus();
    animateCounters(); // Keep this as it's not mouse-dependent
    createNotificationSystem();
    createStaticFloatingActionButton();
    setupScrollReveal(); // Keep but make it subtle
    
    console.log('✨ Static Apple-inspired enhancements loaded!');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Re-enhance elements after dynamic content changes (static versions)
  window.enhanceNewElements = function() {
    setupTypingDetection();
    addStaticButtonEffects();
    enhanceStaticInputFocus();
    animateCounters();
  };
  
  console.log('🎨 Static Apple-inspired animations module loaded!');
})();