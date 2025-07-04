// Chrome Extension Integration - Cloud-Only
(function() {
    'use strict';
    
    console.log('🔌 Loading Chrome Extension Integration (Cloud-Only)...');
    
    // Enhanced notification system
    function showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notification if any
        const existingNotification = document.getElementById('sync-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'sync-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            cursor: pointer;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Add click to dismiss
        notification.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after duration
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
    
    // Listen for extension sync requests and window messages
    function setupExtensionListener() {
        try {
            // Chrome extension runtime messages
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    console.log('📨 Received message from extension:', request);
                    
                    if (request.action === 'applicationAdded') {
                        handleNewApplicationFromExtension(request.application);
                        sendResponse({ success: true });
                    }
                    
                    if (request.action === 'requestSync') {
                        refreshAllData();
                        sendResponse({ success: true });
                    }
                });
                console.log('📱 Extension message listener setup complete');
            }

            // Window postMessage listener for cross-window communication
            window.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NEW_APPLICATION_FROM_EXTENSION') {
                    console.log('📨 Received new application from extension via postMessage:', event.data.application);
                    handleNewApplicationFromExtension(event.data.application);
                }
            });
            
        } catch (error) {
            console.error('❌ Failed to setup extension listener:', error);
        }
    }

    // Handle new application from extension
    async function handleNewApplicationFromExtension(applicationData) {
        try {
            console.log('📋 Processing new application from extension:', applicationData.jobTitle);
            
            // Reload applications from the cloud to get the latest data
            if (window.ApplicationsModule && window.ApplicationsModule.loadApplications) {
                await window.ApplicationsModule.loadApplications();
                showNotification(`✅ New application "${applicationData.jobTitle}" synced from extension!`, 'success');
            } else {
                // Fallback: refresh all data
                await refreshAllData();
                showNotification(`✅ Application data refreshed from extension!`, 'success');
            }
            
            // Switch to applications tab if not already there
            if (window.switchTab && window.jobTracker && window.jobTracker.currentTab !== 'applications') {
                const appsTab = document.querySelector('.tab[onclick*="applications"]');
                if (appsTab) {
                    window.switchTab('applications', appsTab);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to handle extension application:', error);
            showNotification('⚠️ Application added but sync failed. Please refresh manually.', 'error');
        }
    }
    
    // Refresh all data from cloud
    async function refreshAllData() {
        try {
            console.log('🔄 Refreshing all data from cloud...');
            
            // Load all modules data from cloud
            const promises = [];
            
            if (window.ApplicationsModule && window.ApplicationsModule.loadApplications) {
                promises.push(window.ApplicationsModule.loadApplications());
            }
            
            if (window.ContactsModule && window.ContactsModule.loadContacts) {
                promises.push(window.ContactsModule.loadContacts());
            }
            
            if (window.ResumesModule && window.ResumesModule.loadResumes) {
                promises.push(window.ResumesModule.loadResumes());
            }
            
            await Promise.all(promises);
            
            // Update analytics if available
            if (window.updateAnalytics) {
                window.updateAnalytics();
            }
            
            console.log('✅ All data refreshed from cloud');
            showNotification('✅ Data refreshed from cloud!', 'success');
            
        } catch (error) {
            console.error('❌ Failed to refresh data:', error);
            showNotification('❌ Failed to refresh data from cloud', 'error');
        }
    }
    
    // Manual sync button
    function addSyncButton() {
        const header = document.querySelector('.header');
        if (header && !document.getElementById('chrome-sync-btn')) {
            const syncButton = document.createElement('button');
            syncButton.id = 'chrome-sync-btn';
            syncButton.innerHTML = '🔄 Refresh from Cloud';
            syncButton.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #007AFF, #5AC8FA);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9em;
                font-weight: 500;
                transition: all 0.3s ease;
                z-index: 100;
            `;
            
            syncButton.addEventListener('click', async () => {
                syncButton.disabled = true;
                syncButton.textContent = '🔄 Refreshing...';
                
                try {
                    await refreshAllData();
                    syncButton.textContent = '✅ Refreshed!';
                } catch (error) {
                    syncButton.textContent = '❌ Failed';
                }
                
                setTimeout(() => {
                    syncButton.disabled = false;
                    syncButton.textContent = '🔄 Refresh from Cloud';
                }, 3000);
            });
            
            syncButton.addEventListener('mouseenter', () => {
                if (!syncButton.disabled) {
                    syncButton.style.transform = 'translateY(-2px)';
                    syncButton.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
                }
            });
            
            syncButton.addEventListener('mouseleave', () => {
                syncButton.style.transform = 'translateY(0)';
                syncButton.style.boxShadow = 'none';
            });
            
            header.style.position = 'relative';
            header.appendChild(syncButton);
        }
    }
    
    // Check for extension sync requests
    function checkExtensionConnection() {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            try {
                // Test connection to extension
                chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
                    if (!chrome.runtime.lastError) {
                        console.log('📱 Chrome extension connected');
                        showNotification('📱 Chrome extension connected', 'success', 2000);
                    }
                });
            } catch (error) {
                console.log('📱 Chrome extension not available');
            }
        }
    }
    
    // Initialize everything
    function initializeChromeIntegration() {
        console.log('🚀 Initializing Chrome Extension Integration (Cloud-Only)...');
        
        // Set up listeners
        setupExtensionListener();
        
        // Add manual sync button
        setTimeout(addSyncButton, 1000);
        
        // Check extension connection
        setTimeout(checkExtensionConnection, 2000);
        
        // Expose functions globally for manual use
        window.refreshAllData = refreshAllData;
        window.showSyncNotification = showNotification;
        
        console.log('✅ Chrome Extension Integration initialized (Cloud-Only)');
    }
    
    // Add required CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
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
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChromeIntegration);
    } else {
        initializeChromeIntegration();
    }
    
    console.log('🔌 Chrome Extension Integration module loaded (Cloud-Only)');
})();