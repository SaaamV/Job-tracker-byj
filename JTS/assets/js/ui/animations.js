// Apple-Inspired Dynamic Animations and Interactions
(function() {
  'use strict';
  
  console.log('🎨 Loading Apple-inspired animations...');
  
  // ===== USER INPUT TRACKING =====
  // Track user input state to disable animations during typing
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
          console.log('🔒 User started typing - animations paused');
        }
        
        // Reset timeout on every keystroke
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          isUserTyping = false;
          document.body.classList.remove('user-typing');
          console.log('🔓 User stopped typing - animations resumed');
        }, 2000); // 2 seconds after last keystroke
      });
      
      // User focuses on input
      input.addEventListener('focus', function() {
        isUserTyping = true;
        document.body.classList.add('user-typing');
        clearTimeout(typingTimeout);
      });
      
      // User leaves input
      input.addEventListener('blur', function() {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          isUserTyping = false;
          document.body.classList.remove('user-typing');
        }, 500); // Short delay after blur
      });
    });
  }
  
  // Particle System
  function createParticleSystem() {
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);
    
    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random positioning and timing
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      
      // Random size variation
      const size = 2 + Math.random() * 3;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      container.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 25000);
    }
    
    // Create particles periodically
    setInterval(createParticle, 2000);
    
    // Create initial batch
    for (let i = 0; i < 10; i++) {
      setTimeout(createParticle, i * 200);
    }
  }
  
  // Enhanced Tab Switching with Dynamic Indicator
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
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = tabsContainer.getBoundingClientRect();
      
      const left = activeTab.offsetLeft;
      const width = activeTab.offsetWidth;
      
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
  
  // Magnetic Button Effects - WITH USER TYPING CHECK
  function addMagneticEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', function() {
        // Don't animate if user is typing
        if (isUserTyping) return;
        this.style.transform = 'translateY(-3px) scale(1.02)';
      });
      
      button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
      
      button.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(-1px) scale(0.98)';
      });
      
      button.addEventListener('mouseup', function() {
        // Don't animate if user is typing
        if (isUserTyping) return;
        this.style.transform = 'translateY(-3px) scale(1.02)';
      });
    });
  }
  
  // Ripple Effect for Buttons
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
  
  // Enhanced Hover Effects for Cards - WITH USER TYPING CHECK
  function enhanceCardHoverEffects() {
    const cards = document.querySelectorAll('.form-section, .stat-card, .chart-container');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', function(e) {
        // Don't animate if user is typing
        if (isUserTyping) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        this.style.transform = `translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
      });
      
      card.addEventListener('mousemove', function(e) {
        // Don't animate if user is typing
        if (isUserTyping) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });
  }
  
  // Scroll Reveal Animation
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
  
  // Counter Animation for Stats
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
  
  // Enhanced Input Focus Effects - MODIFIED FOR STATIC BEHAVIOR DURING TYPING
  function enhanceInputFocus() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
        
        // Only add transform animation if user is not typing
        if (!isUserTyping) {
          this.style.transform = 'translateY(-2px) scale(1.01)';
        }
      });
      
      input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
        this.style.transform = 'translateY(0) scale(1)';
      });
      
      // Remove transforms when user starts typing
      input.addEventListener('input', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  }
  
  // Notification System
  function createNotificationSystem() {
    window.showNotification = function(message, type = 'info', duration = 4000) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      
      // Add entrance animation
      notification.style.transform = 'translateX(400px)';
      notification.style.opacity = '0';
      
      document.body.appendChild(notification);
      
      // Trigger entrance animation
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
      }, 10);
      
      // Auto-remove notification
      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }, duration);
    };
  }
  
  // Performance Monitoring
  function setupPerformanceOptimizations() {
    // Detect if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
      return; // Skip heavy animations
    }
    
    // Detect device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency < 4 || navigator.deviceMemory < 4;
    
    if (isLowEndDevice) {
      document.body.classList.add('reduced-animations');
    }
    
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
  
  // Floating Action Button
  function createFloatingActionButton() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '+';
    fab.title = 'Quick Add Application';
    
    fab.addEventListener('click', () => {
      // Focus on the first input in the applications tab
      const jobTitleInput = document.getElementById('jobTitle');
      if (jobTitleInput) {
        // Switch to applications tab if not active
        const applicationsTab = document.querySelector('[onclick*="applications"]');
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
    
    document.body.appendChild(fab);
  }
  
  // Initialize everything
  function initialize() {
    console.log('🚀 Initializing Apple-inspired enhancements...');
    
    // Setup performance optimizations first
    setupPerformanceOptimizations();
    
    // Setup typing detection - CRITICAL FOR FIXING MOVEMENT ISSUE
    setupTypingDetection();
    
    // Check if reduced motion is enabled
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      createParticleSystem();
      setupScrollReveal();
      enhanceCardHoverEffects();
    }
    
    // Core enhancements (always enabled)
    enhanceTabSwitching();
    addMagneticEffects();
    addRippleEffects();
    enhanceInputFocus();
    animateCounters();
    createNotificationSystem();
    createFloatingActionButton();
    
    console.log('✨ Apple-inspired enhancements loaded!');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Re-enhance elements after dynamic content changes
  window.enhanceNewElements = function() {
    setupTypingDetection(); // Re-setup typing detection for new elements
    addMagneticEffects();
    enhanceInputFocus();
    animateCounters();
  };
  
  console.log('🎨 Apple-inspired animations module loaded!');
})();