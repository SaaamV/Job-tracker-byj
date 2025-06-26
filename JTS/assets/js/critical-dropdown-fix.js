// CRITICAL: Dropdown Text Visibility Fix - Enhanced JavaScript
(function() {
  'use strict';
  
  console.log('🔧 Loading Critical Dropdown Fix...');
  
  // Force input text visibility
  function forceInputVisibility() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Force immediate style application
      input.style.setProperty('color', '#1D1D1F', 'important');
      input.style.setProperty('background', '#FFFFFF', 'important');
      input.style.setProperty('background-color', '#FFFFFF', 'important');
      input.style.setProperty('-webkit-text-fill-color', '#1D1D1F', 'important');
      input.style.setProperty('-webkit-appearance', 'menulist', 'important');
      
      // Add comprehensive event listeners
      const events = ['focus', 'blur', 'input', 'change', 'click', 'mousedown', 'mouseup', 'keydown', 'keyup'];
      
      events.forEach(eventType => {
        input.addEventListener(eventType, function() {
          // Re-apply styles on every interaction
          this.style.setProperty('color', '#1D1D1F', 'important');
          this.style.setProperty('background', '#FFFFFF', 'important');
          this.style.setProperty('background-color', '#FFFFFF', 'important');
          this.style.setProperty('-webkit-text-fill-color', '#1D1D1F', 'important');
        });
      });
    });
  }
  
  // Fix select dropdowns specifically
  function fixSelectDropdowns() {
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
      // Force select appearance and colors
      select.style.setProperty('color', '#1D1D1F', 'important');
      select.style.setProperty('background', '#FFFFFF', 'important');
      select.style.setProperty('-webkit-appearance', 'menulist', 'important');
      select.style.setProperty('-moz-appearance', 'menulist', 'important');
      select.style.setProperty('appearance', 'menulist', 'important');
      
      // Fix options when select is changed
      select.addEventListener('change', function() {
        this.style.setProperty('color', '#1D1D1F', 'important');
        this.style.setProperty('background', '#FFFFFF', 'important');
        
        // Force recompute
        this.offsetHeight;
      });
      
      // Fix options when dropdown opens
      select.addEventListener('mousedown', function() {
        setTimeout(() => {
          const options = this.querySelectorAll('option');
          options.forEach(option => {
            option.style.setProperty('color', '#1D1D1F', 'important');
            option.style.setProperty('background', '#FFFFFF', 'important');
          });
        }, 10);
      });
    });
  }
  
  // Enhanced mutation observer for dynamic content
  function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
              // Fix newly added inputs
              const newInputs = node.querySelectorAll ? node.querySelectorAll('input, select, textarea') : [];
              newInputs.forEach(input => {
                input.style.setProperty('color', '#1D1D1F', 'important');
                input.style.setProperty('background', '#FFFFFF', 'important');
                input.style.setProperty('-webkit-text-fill-color', '#1D1D1F', 'important');
              });
              
              // If the node itself is an input
              if (node.matches && node.matches('input, select, textarea')) {
                node.style.setProperty('color', '#1D1D1F', 'important');
                node.style.setProperty('background', '#FFFFFF', 'important');
                node.style.setProperty('-webkit-text-fill-color', '#1D1D1F', 'important');
              }
            }
          });
        }
        
        // Also check for attribute changes that might reset styles
        if (mutation.type === 'attributes' && mutation.target.matches('input, select, textarea')) {
          const target = mutation.target;
          target.style.setProperty('color', '#1D1D1F', 'important');
          target.style.setProperty('background', '#FFFFFF', 'important');
          target.style.setProperty('-webkit-text-fill-color', '#1D1D1F', 'important');
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    return observer;
  }
  
  // Periodic fix to ensure styles remain applied
  function setupPeriodicFix() {
    setInterval(() => {
      forceInputVisibility();
      fixSelectDropdowns();
    }, 1000); // Check every second
  }
  
  // Tab switch handler
  function handleTabSwitches() {
    // Override any existing switchTab function
    const originalSwitchTab = window.switchTab;
    
    window.switchTab = function(tabName, element, index) {
      // Call original function if it exists
      if (originalSwitchTab) {
        originalSwitchTab.call(this, tabName, element, index);
      } else {
        // Basic tab switching
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        document.querySelectorAll('.tab').forEach(tab => {
          tab.classList.remove('active');
        });
        
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
          targetContent.classList.add('active');
        }
        if (element) {
          element.classList.add('active');
        }
      }
      
      // Fix inputs after tab switch
      setTimeout(() => {
        forceInputVisibility();
        fixSelectDropdowns();
      }, 100);
    };
  }
  
  // Initialize everything
  function initialize() {
    console.log('🎯 Applying dropdown fixes...');
    
    // Apply fixes immediately
    forceInputVisibility();
    fixSelectDropdowns();
    
    // Setup observers and handlers
    setupMutationObserver();
    setupPeriodicFix();
    handleTabSwitches();
    
    // Force browser recompute
    document.body.offsetHeight;
    
    console.log('✅ Dropdown fixes applied successfully!');
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run on window load as backup
  window.addEventListener('load', () => {
    setTimeout(() => {
      forceInputVisibility();
      fixSelectDropdowns();
    }, 500);
  });
  
  // Make functions globally available for debugging
  window.forceInputVisibility = forceInputVisibility;
  window.fixSelectDropdowns = fixSelectDropdowns;
  
  console.log('🔧 Critical Dropdown Fix Loaded!');
})();