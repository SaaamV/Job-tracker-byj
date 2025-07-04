// Main content script - Simplified and modular

// Prevent multiple class declarations
if (typeof window.JobTrackerExtension === 'undefined') {
  
  class JobTrackerExtension {
    constructor() {
      this.currentSite = SiteDetectors.detectJobSite();
      this.isTracking = false;
      console.log('🔗 Content script initialized for:', this.currentSite);
      this.init();
    }

    init() {
      console.log('Job Tracker Extension initializing...');
      UIManager.addFloatingButton();
      this.detectJobData();
      this.setupAutoDetection();
      console.log('Job Tracker Extension initialized on:', this.currentSite);
    }

    detectJobData() {
      const extractors = {
        linkedin: SiteDetectors.extractLinkedInData.bind(SiteDetectors),
        indeed: SiteDetectors.extractIndeedData.bind(SiteDetectors),
        glassdoor: SiteDetectors.extractGlassdoorData.bind(SiteDetectors),
        angellist: SiteDetectors.extractAngelListData.bind(SiteDetectors),
        ziprecruiter: SiteDetectors.extractZipRecruiterData.bind(SiteDetectors),
        generic: SiteDetectors.extractGenericData.bind(SiteDetectors)
      };

      const extractor = extractors[this.currentSite] || extractors.generic;
      window.currentJobData = extractor();
      
      // Clean location data
      if (window.currentJobData.location) {
        window.currentJobData.location = window.currentJobData.location.replace(/[•·]/g, '').trim();
      }
      
      console.log('Extracted job data:', window.currentJobData);
    }

    setupAutoDetection() {
      // Watch for URL changes (for SPAs)
      let currentUrl = window.location.href;
      
      const urlObserver = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          setTimeout(() => {
            this.detectJobData();
          }, 2000); // Wait for content to load
        }
      });

      urlObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Watch for application submissions
      this.watchForApplicationSubmission();
    }

    watchForApplicationSubmission() {
      const applicationSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        '[class*="apply"]',
        '[class*="submit"]',
        '[id*="apply"]',
        '[id*="submit"]'
      ];

      applicationSelectors.forEach(selector => {
        document.addEventListener('click', (e) => {
          if (e.target.matches(selector)) {
            const buttonText = e.target.textContent.toLowerCase();
            if (buttonText.includes('apply') || buttonText.includes('submit')) {
              setTimeout(() => {
                UIManager.showQuickSavePrompt();
              }, 1000);
            }
          }
        });
      });
    }
  }

  // Make class globally accessible
  window.JobTrackerExtension = JobTrackerExtension;
}

// Message listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'showJobTracker') {
    if (!window.jobTrackerExtension) {
      window.jobTrackerExtension = new JobTrackerExtension();
    } else {
      UIManager.showJobTracker();
    }
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Initialize extension
function initializeExtension() {
  const hostname = window.location.hostname.toLowerCase();
  console.log('🚀 Initializing Job Tracker Extension on:', hostname);
  window.jobTrackerExtension = new JobTrackerExtension();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}