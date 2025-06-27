// Immediate Application Sync - Direct Integration
(function() {
    'use strict';
    
    console.log('🚀 Loading Immediate Application Sync...');
    
    // Enhanced function to immediately show new applications
    function immediateApplicationSync() {
        try {
            // Check for Chrome extension storage
            if (typeof chrome !== 'undefined' && chrome.storage) {
                // Listen for storage changes in real-time
                chrome.storage.onChanged.addListener((changes, namespace) => {
                    if (namespace === 'local' && changes.jobApplications) {
                        console.log('📱 Chrome storage changed - syncing immediately!');
                        setTimeout(() => {
                            syncAndDisplayApplications();
                        }, 100); // Immediate sync
                    }
                });
                
                // Initial sync on page load
                setTimeout(() => {
                    syncAndDisplayApplications();
                }, 500);
                
                console.log('✅ Chrome storage listener setup for immediate sync');
            }
            
            // Also check localStorage changes (fallback)
            setInterval(() => {
                checkForNewApplications();
            }, 2000); // Check every 2 seconds
            
        } catch (error) {
            console.error('❌ Failed to setup immediate sync:', error);
        }
    }
    
    // Function to sync and immediately display applications
    async function syncAndDisplayApplications() {
        try {
            console.log('🔄 Syncing applications immediately...');
            
            let newApplications = [];
            
            // Get from Chrome storage first
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await new Promise((resolve) => {
                    chrome.storage.local.get(['jobApplications'], resolve);
                });
                newApplications = result.jobApplications || [];
            } else {
                // Fallback to localStorage
                newApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            }
            
            if (newApplications.length > 0) {
                // Get existing applications
                const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
                const existingIds = new Set(existingApps.map(app => app.id));
                
                // Find truly new applications
                const brandNewApps = newApplications.filter(app => !existingIds.has(app.id));
                
                if (brandNewApps.length > 0) {
                    console.log(`🆕 Found ${brandNewApps.length} new applications from extension!`);
                    
                    // Merge with existing
                    const mergedApps = [...existingApps, ...brandNewApps];
                    
                    // Update localStorage
                    localStorage.setItem('jobApplications', JSON.stringify(mergedApps));
                    
                    // Update global variables
                    window.applications = mergedApps;
                    if (typeof applications !== 'undefined') {
                        applications = mergedApps;
                    }
                    
                    // Immediately refresh display if on applications tab
                    const applicationsTab = document.getElementById('applications');
                    if (applicationsTab && applicationsTab.classList.contains('active')) {
                        console.log('📊 Refreshing applications display...');
                        
                        // Call render functions if they exist
                        if (typeof renderApplications === 'function') {
                            renderApplications();
                        }
                        if (typeof updateAnalytics === 'function') {
                            updateAnalytics();
                        }
                        
                        // Show success notification
                        showImmediateNotification(`✅ ${brandNewApps.length} new application(s) added from extension!`, 'success');
                    }
                    
                    return brandNewApps.length;
                } else {
                    console.log('📱 No new applications found');
                    return 0;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('❌ Failed to sync applications:', error);
            return 0;
        }
    }
    
    // Check for new applications in localStorage (fallback method)
    let lastApplicationCount = 0;
    function checkForNewApplications() {
        try {
            const currentApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            
            if (currentApps.length > lastApplicationCount) {
                console.log(`🆕 Detected ${currentApps.length - lastApplicationCount} new applications!`);
                lastApplicationCount = currentApps.length;
                
                // Update global state
                window.applications = currentApps;
                if (typeof applications !== 'undefined') {
                    applications = currentApps;
                }
                
                // Refresh display
                if (typeof renderApplications === 'function') {
                    renderApplications();
                }
                if (typeof updateAnalytics === 'function') {
                    updateAnalytics();
                }
            } else {
                lastApplicationCount = currentApps.length;
            }
        } catch (error) {
            console.error('Error checking for new applications:', error);
        }
    }
    
    // Enhanced notification system
    function showImmediateNotification(message, type = 'success', duration = 6000) {
        // Remove existing notification
        const existing = document.getElementById('immediate-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'immediate-notification';
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10001;
            font-weight: 600;
            font-size: 14px;
            max-width: 350px;
            animation: slideInBounce 0.5s ease-out;
            cursor: pointer;
            border-left: 4px solid rgba(255,255,255,0.5);
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">📊</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    // Enhanced message listener for extension communication
    function setupExtensionMessageListener() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    console.log('📱 Received message from extension:', request);
                    
                    if (request.action === 'applicationAdded') {
                        console.log('🆕 Extension reports new application added!');
                        setTimeout(() => {
                            syncAndDisplayApplications().then(count => {
                                sendResponse({ success: true, synced: count });
                            });
                        }, 200);
                        return true; // Keep message channel open
                    }
                    
                    if (request.action === 'forceSync') {
                        syncAndDisplayApplications().then(count => {
                            sendResponse({ success: true, synced: count });
                        });
                        return true;
                    }
                });
                
                console.log('✅ Extension message listener setup for immediate sync');
            }
        } catch (error) {
            console.error('Failed to setup extension message listener:', error);
        }
    }
    
    // Add required CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInBounce {
            0% {
                transform: translateX(100%) scale(0.8);
                opacity: 0;
            }
            60% {
                transform: translateX(-10px) scale(1.05);
                opacity: 1;
            }
            100% {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize everything
    function initializeImmediateSync() {
        console.log('🚀 Initializing Immediate Application Sync...');
        
        // Setup all listeners
        immediateApplicationSync();
        setupExtensionMessageListener();
        
        // Initial count
        try {
            const currentApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            lastApplicationCount = currentApps.length;
            console.log(`📊 Initial application count: ${lastApplicationCount}`);
        } catch (error) {
            console.error('Error getting initial count:', error);
        }
        
        // Expose function globally for testing
        window.syncAndDisplayApplications = syncAndDisplayApplications;
        window.showImmediateNotification = showImmediateNotification;
        
        console.log('✅ Immediate Application Sync initialized');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImmediateSync);
    } else {
        initializeImmediateSync();
    }
    
    console.log('Immediate Application Sync module loaded');
})();