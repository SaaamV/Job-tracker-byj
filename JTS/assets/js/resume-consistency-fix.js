// Resume Section Consistency Check and Fix
(function() {
    'use strict';
    
    console.log('🔧 Loading Resume Section Consistency Fix...');
    
    function enforceResumeConsistency() {
        // Wait for DOM to be ready and resumes to be loaded
        setTimeout(() => {
            const resumeCards = document.querySelectorAll('#resumesList > div, .resume-card');
            
            if (resumeCards.length > 0) {
                console.log(`🎨 Applying consistency fix to ${resumeCards.length} resume cards`);
                
                resumeCards.forEach(card => {
                    // Apply consistent styling that matches input fields
                    card.style.cssText = `
                        background: #f5f5f7 !important;
                        border: 1px solid #e5e5e7 !important;
                        border-radius: 8px !important;
                        padding: 16px !important;
                        margin: 10px 0 !important;
                        color: #333 !important;
                        box-shadow: none !important;
                        backdrop-filter: none !important;
                    `;
                    
                    // Fix all text elements inside
                    const textElements = card.querySelectorAll('h4, p, span, div:not(.resume-actions)');
                    textElements.forEach(el => {
                        el.style.color = '#333 !important';
                        el.style.background = 'transparent !important';
                    });
                    
                    // Fix strong elements
                    const strongElements = card.querySelectorAll('strong');
                    strongElements.forEach(el => {
                        el.style.color = '#333 !important';
                        el.style.fontWeight = '600';
                    });
                    
                    // Fix buttons
                    const buttons = card.querySelectorAll('button');
                    buttons.forEach(btn => {
                        if (btn.textContent.includes('Delete')) {
                            btn.style.cssText = `
                                background: #dc3545 !important;
                                color: white !important;
                                border: none !important;
                                padding: 6px 12px !important;
                                border-radius: 4px !important;
                                cursor: pointer !important;
                                margin-right: 8px !important;
                            `;
                        } else {
                            btn.style.cssText = `
                                background: #007bff !important;
                                color: white !important;
                                border: none !important;
                                padding: 6px 12px !important;
                                border-radius: 4px !important;
                                cursor: pointer !important;
                                margin-right: 8px !important;
                            `;
                        }
                    });
                });
                
                console.log('✅ Resume cards styled to match other sections');
            }
            
            // Fix CV preview if it exists
            const cvPreview = document.querySelector('.cv-preview, #cvPreview');
            if (cvPreview) {
                cvPreview.style.cssText = `
                    background: #f5f5f7 !important;
                    border: 1px solid #e5e5e7 !important;
                    border-radius: 8px !important;
                    padding: 20px !important;
                    color: #333 !important;
                `;
                
                const cvElements = cvPreview.querySelectorAll('*');
                cvElements.forEach(el => {
                    el.style.color = '#333 !important';
                });
                
                console.log('✅ CV preview styled consistently');
            }
            
        }, 1000);
    }
    
    // Function to observe changes in the resume list
    function setupResumeObserver() {
        const resumesList = document.getElementById('resumesList');
        if (resumesList) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('📋 New resume cards detected, applying consistency fix...');
                        setTimeout(enforceResumeConsistency, 100);
                    }
                });
            });
            
            observer.observe(resumesList, {
                childList: true,
                subtree: true
            });
            
            console.log('👀 Resume list observer setup complete');
        }
    }
    
    // Override the renderResumes function to ensure consistency
    function enhanceRenderResumes() {
        if (window.renderResumes) {
            const originalRenderResumes = window.renderResumes;
            window.renderResumes = function(...args) {
                const result = originalRenderResumes.apply(this, args);
                setTimeout(enforceResumeConsistency, 200);
                return result;
            };
            console.log('🔄 Enhanced renderResumes function for consistency');
        }
    }
    
    // Check for dark mode and apply appropriate fixes
    function handleDarkMode() {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isDarkMode) {
            console.log('🌙 Dark mode detected, applying dark theme to resume section');
            const style = document.createElement('style');
            style.textContent = `
                #resumesList > div,
                .resume-card {
                    background: #2c2c2e !important;
                    border: 1px solid #48484a !important;
                    color: #ffffff !important;
                }
                
                #resumesList h4,
                .resume-card h4 {
                    color: #ffffff !important;
                }
                
                #resumesList p,
                .resume-card p {
                    color: #a1a1a6 !important;
                }
                
                #resumesList strong,
                .resume-card strong {
                    color: #ffffff !important;
                }
                
                .cv-preview {
                    background: #2c2c2e !important;
                    border: 1px solid #48484a !important;
                    color: #ffffff !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize everything
    function initializeResumeConsistency() {
        console.log('🚀 Initializing Resume Section Consistency...');
        
        // Apply initial fix
        enforceResumeConsistency();
        
        // Setup observer for dynamic changes
        setupResumeObserver();
        
        // Enhance render function
        enhanceRenderResumes();
        
        // Handle dark mode
        handleDarkMode();
        
        // Re-apply fixes when tab becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(enforceResumeConsistency, 500);
            }
        });
        
        // Re-apply fixes when window regains focus
        window.addEventListener('focus', () => {
            setTimeout(enforceResumeConsistency, 500);
        });
        
        // Apply fixes on tab switch (for single page apps)
        const tabButtons = document.querySelectorAll('.tab');
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.textContent.includes('Resume')) {
                    setTimeout(enforceResumeConsistency, 300);
                }
            });
        });
        
        console.log('✅ Resume Section Consistency initialized');
    }
    
    // Wait for DOM and then initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeResumeConsistency);
    } else {
        initializeResumeConsistency();
    }
    
    // Also initialize after a delay to catch any late-loading content
    setTimeout(initializeResumeConsistency, 2000);
    
    console.log('Resume Section Consistency module loaded');
})();