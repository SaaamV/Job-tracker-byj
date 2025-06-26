// Enhanced Chrome Extension Integration
(function() {
    'use strict';
    
    console.log('Loading Chrome Extension Integration...');
    
    // Enhanced function to sync Chrome extension data
    async function syncChromeExtensionData() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                console.log('🔄 Syncing Chrome extension data...');
                
                const result = await new Promise((resolve) => {
                    chrome.storage.local.get(['jobApplications', 'jobContacts', 'jobResumes'], resolve);
                });
                
                let syncCount = 0;
                
                // Sync applications
                if (result.jobApplications && result.jobApplications.length > 0) {
                    const existingApps = JSON.parse(localStorage.getItem('jobApplications') || '[]');
                    const existingIds = new Set(existingApps.map(app => app.id));
                    
                    const newApps = result.jobApplications.filter(app => !existingIds.has(app.id));
                    
                    if (newApps.length > 0) {
                        const mergedApps = [...existingApps, ...newApps];
                        localStorage.setItem('jobApplications', JSON.stringify(mergedApps));
                        window.applications = mergedApps;
                        syncCount += newApps.length;
                        console.log(`✅ Synced ${newApps.length} new applications from extension`);
                        
                        // Refresh the applications display if on applications tab
                        if (typeof renderApplications === 'function') {
                            renderApplications();
                        }
                        if (typeof updateAnalytics === 'function') {
                            updateAnalytics();
                        }
                    }
                }
                
                // Sync contacts
                if (result.jobContacts && result.jobContacts.length > 0) {
                    const existingContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
                    const existingIds = new Set(existingContacts.map(contact => contact.id));
                    
                    const newContacts = result.jobContacts.filter(contact => !existingIds.has(contact.id));
                    
                    if (newContacts.length > 0) {
                        const mergedContacts = [...existingContacts, ...newContacts];
                        localStorage.setItem('jobContacts', JSON.stringify(mergedContacts));
                        window.contacts = mergedContacts;
                        console.log(`✅ Synced ${newContacts.length} new contacts from extension`);
                        
                        // Refresh contacts display if on contacts tab
                        if (typeof renderContacts === 'function') {
                            renderContacts();
                        }
                    }
                }
                
                // Sync resumes
                if (result.jobResumes && result.jobResumes.length > 0) {
                    const existingResumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
                    const existingIds = new Set(existingResumes.map(resume => resume.id));
                    
                    const newResumes = result.jobResumes.filter(resume => !existingIds.has(resume.id));
                    
                    if (newResumes.length > 0) {
                        const mergedResumes = [...existingResumes, ...newResumes];
                        localStorage.setItem('jobResumes', JSON.stringify(mergedResumes));
                        window.resumes = mergedResumes;
                        console.log(`✅ Synced ${newResumes.length} new resumes from extension`);
                        
                        // Refresh resumes display if available
                        if (typeof renderResumes === 'function') {
                            renderResumes();
                        }
                        if (typeof updateResumeDropdown === 'function') {
                            updateResumeDropdown();
                        }
                    }
                }
                
                if (syncCount > 0) {
                    showNotification(`✅ Synced ${syncCount} new items from Chrome extension!`, 'success');
                    console.log(`🎉 Total synced: ${syncCount} items from Chrome extension`);
                } else {
                    console.log('📱 Chrome extension data is already up to date');
                }
                
                return syncCount;
            } else {
                console.log('📱 Chrome extension API not available');
                return 0;
            }
        } catch (error) {
            console.error('❌ Failed to sync Chrome extension data:', error);
            return 0;
        }
    }
    
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
    
    // Auto-sync function that runs periodically
    async function autoSync() {
        try {
            await syncChromeExtensionData();
        } catch (error) {
            console.error('Auto-sync failed:', error);
        }
    }
    
    // Listen for extension sync requests
    function setupExtensionListener() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    console.log('Received message from extension:', request);
                    
                    if (request.action === 'syncData') {
                        syncChromeExtensionData().then(syncCount => {
                            sendResponse({ success: true, synced: syncCount });
                        }).catch(error => {
                            console.error('Sync failed:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                        return true; // Keep message channel open for async response
                    }
                    
                    if (request.action === 'requestSync') {
                        autoSync();
                        sendResponse({ success: true });
                    }
                });
                console.log('📱 Extension message listener setup complete');
            }
        } catch (error) {
            console.error('Failed to setup extension listener:', error);
        }
    }
    
    // Storage change listener
    function setupStorageListener() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.onChanged.addListener((changes, namespace) => {
                    if (namespace === 'local') {
                        console.log('Chrome storage changed:', Object.keys(changes));
                        
                        // Automatically sync when storage changes
                        setTimeout(() => {
                            autoSync();
                        }, 1000); // Small delay to allow other operations to complete
                    }
                });
                console.log('📱 Storage change listener setup complete');
            }
        } catch (error) {
            console.error('Failed to setup storage listener:', error);
        }
    }
    
    // Manual sync button
    function addSyncButton() {
        const header = document.querySelector('.header');
        if (header && !document.getElementById('chrome-sync-btn')) {
            const syncButton = document.createElement('button');
            syncButton.id = 'chrome-sync-btn';
            syncButton.innerHTML = '📱 Sync Extension Data';
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
                syncButton.textContent = '🔄 Syncing...';
                
                try {
                    const syncCount = await syncChromeExtensionData();
                    syncButton.textContent = syncCount > 0 ? `✅ Synced ${syncCount} items` : '✅ Up to date';
                } catch (error) {
                    syncButton.textContent = '❌ Sync failed';
                }
                
                setTimeout(() => {
                    syncButton.disabled = false;
                    syncButton.textContent = '📱 Sync Extension Data';
                }, 3000);
            });
            
            syncButton.addEventListener('mouseenter', () => {
                syncButton.style.transform = 'translateY(-2px)';
                syncButton.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
            });
            
            syncButton.addEventListener('mouseleave', () => {
                syncButton.style.transform = 'translateY(0)';
                syncButton.style.boxShadow = 'none';
            });
            
            header.style.position = 'relative';
            header.appendChild(syncButton);
        }
    }
    
    // URL change detection for single page applications
    function detectURLChanges() {
        let currentURL = window.location.href;
        
        setInterval(() => {
            if (window.location.href !== currentURL) {
                currentURL = window.location.href;
                console.log('URL changed, triggering sync...');
                setTimeout(autoSync, 1000);
            }
        }, 2000);
    }
    
    // Initialize everything
    function initializeChromeIntegration() {
        console.log('🚀 Initializing Chrome Extension Integration...');
        
        // Set up listeners
        setupExtensionListener();
        setupStorageListener();
        
        // Add manual sync button
        setTimeout(addSyncButton, 1000);
        
        // Initial sync on page load
        setTimeout(autoSync, 2000);
        
        // Periodic auto-sync every 30 seconds
        setInterval(autoSync, 30000);
        
        // URL change detection
        detectURLChanges();
        
        // Expose functions globally for manual use
        window.syncChromeExtensionData = syncChromeExtensionData;
        window.showSyncNotification = showNotification;
        
        console.log('✅ Chrome Extension Integration initialized');
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
    
    console.log('Chrome Extension Integration module loaded');
})();