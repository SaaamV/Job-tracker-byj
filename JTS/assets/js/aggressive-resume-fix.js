// Aggressive Resume Background Fix
(function() {
    'use strict';
    
    console.log('🎯 Loading Aggressive Resume Background Fix...');
    
    function forceResumeGrayBackground() {
        const resumesList = document.getElementById('resumesList');
        if (!resumesList) return;
        
        // Force the container itself to be transparent
        resumesList.style.background = 'transparent';
        
        // Find all resume cards and force gray background
        const resumeCards = resumesList.querySelectorAll('div');
        let fixedCount = 0;
        
        resumeCards.forEach((card, index) => {
            if (card.textContent.trim() && !card.textContent.includes('No resumes')) {
                
                // Check if it has white or unwanted background
                const computedStyle = window.getComputedStyle(card);
                const currentBg = computedStyle.backgroundColor;
                
                if (currentBg === 'rgb(255, 255, 255)' || currentBg === 'white' || currentBg === 'rgba(255, 255, 255, 0.25)') {
                    console.log(`🔧 FIXING WHITE BACKGROUND on resume card ${index + 1}`);
                }
                
                // Force gray background with maximum specificity
                card.style.setProperty('background', '#f5f5f7', 'important');
                card.style.setProperty('border', '1px solid #e5e5e7', 'important');
                card.style.setProperty('border-radius', '8px', 'important');
                card.style.setProperty('color', '#333', 'important');
                card.style.setProperty('padding', '16px', 'important');
                card.style.setProperty('margin', '10px 0', 'important');
                
                // Remove any glassmorphism or backdrop filters
                card.style.setProperty('backdrop-filter', 'none', 'important');
                card.style.setProperty('box-shadow', 'none', 'important');
                
                // Fix all text elements inside
                const textElements = card.querySelectorAll('*:not(button)');
                textElements.forEach(el => {
                    if (!el.querySelector('button')) {
                        el.style.setProperty('background', 'transparent', 'important');
                        el.style.setProperty('color', '#333', 'important');
                    }
                });
                
                // Fix buttons
                const buttons = card.querySelectorAll('button');
                buttons.forEach(btn => {
                    if (btn.textContent.includes('Delete')) {
                        btn.style.setProperty('background', '#dc3545', 'important');
                        btn.style.setProperty('color', 'white', 'important');
                    } else {
                        btn.style.setProperty('background', '#007bff', 'important');
                        btn.style.setProperty('color', 'white', 'important');
                    }
                    btn.style.setProperty('border', 'none', 'important');
                });
                
                fixedCount++;
            }
        });
        
        if (fixedCount > 0) {
            console.log(`✅ Applied aggressive background fix to ${fixedCount} resume cards`);
        }
    }
    
    // Monitor for upload button clicks
    function setupUploadMonitoring() {
        const uploadButton = document.querySelector('button[onclick="uploadResume()"], .btn[onclick="uploadResume()"]');
        if (uploadButton) {
            uploadButton.addEventListener('click', () => {
                console.log('📎 Upload button clicked - will monitor for new resume cards');
                
                // Monitor for new cards every 200ms for 5 seconds after upload
                let checks = 0;
                const uploadMonitor = setInterval(() => {
                    forceResumeGrayBackground();
                    checks++;
                    
                    if (checks >= 25) { // 5 seconds worth of checks
                        clearInterval(uploadMonitor);
                    }
                }, 200);
            });
            
            console.log('📎 Upload monitoring setup complete');
        }
    }
    
    // Run immediately and repeatedly
    function startAggressiveFix() {
        forceResumeGrayBackground();
        setupUploadMonitoring();
        
        // Run every 1 second for the first 10 seconds to catch any dynamic changes
        let attempts = 0;
        const interval = setInterval(() => {
            forceResumeGrayBackground();
            attempts++;
            
            if (attempts >= 10) {
                clearInterval(interval);
                console.log('✅ Initial aggressive resume fix completed');
                
                // Continue with less frequent checks
                setInterval(forceResumeGrayBackground, 5000); // Every 5 seconds ongoing
            }
        }, 1000);
        
        // Also run on tab switch
        const resumeTab = document.querySelector('.tab[onclick*="resumes"]');
        if (resumeTab) {
            resumeTab.addEventListener('click', () => {
                setTimeout(forceResumeGrayBackground, 200);
                setTimeout(forceResumeGrayBackground, 500);
                setTimeout(forceResumeGrayBackground, 1000);
            });
        }
        
        // Enhanced render function monitoring
        if (window.renderResumes) {
            const originalRender = window.renderResumes;
            window.renderResumes = function(...args) {
                console.log('🔄 renderResumes called - applying fixes');
                const result = originalRender.apply(this, args);
                
                // Apply fixes multiple times to catch any timing issues
                setTimeout(forceResumeGrayBackground, 50);
                setTimeout(forceResumeGrayBackground, 200);
                setTimeout(forceResumeGrayBackground, 500);
                setTimeout(forceResumeGrayBackground, 1000);
                
                return result;
            };
        }
        
        // Monitor upload function specifically
        if (window.uploadResume) {
            const originalUpload = window.uploadResume;
            window.uploadResume = function(...args) {
                console.log('📤 uploadResume called - will fix backgrounds after upload');
                const result = originalUpload.apply(this, args);
                
                // Apply fixes aggressively after upload
                setTimeout(forceResumeGrayBackground, 100);
                setTimeout(forceResumeGrayBackground, 300);
                setTimeout(forceResumeGrayBackground, 600);
                setTimeout(forceResumeGrayBackground, 1000);
                setTimeout(forceResumeGrayBackground, 2000);
                
                return result;
            };
        }
    }
    
    // Initialize immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAggressiveFix);
    } else {
        startAggressiveFix();
    }
    
    // Also run after delays to catch late-loading content
    setTimeout(startAggressiveFix, 1000);
    setTimeout(startAggressiveFix, 3000);
    setTimeout(startAggressiveFix, 5000);
    
    console.log('Aggressive Resume Background Fix loaded and monitoring');
})();