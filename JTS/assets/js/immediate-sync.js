// Immediate Sync Handler - Ensures analytics update when extension data is added
(function() {
    'use strict';
    
    console.log('🔄 Loading Immediate Sync Handler...');
    
    // Storage event listener for localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'jobApplications') {
            console.log('📊 Job applications updated in localStorage, refreshing analytics...');
            updateApplicationsAndAnalytics();
        }
        
        if (e.key === 'jobContacts') {
            console.log('👥 Contacts updated in localStorage, refreshing display...');
            if (typeof renderContacts === 'function') {
                renderContacts();
            }
        }
        
        if (e.key === 'jobResumes') {
            console.log('📄 Resumes updated in localStorage, refreshing display...');
            if (typeof renderResumes === 'function') {
                renderResumes();
            }
            if (typeof updateResumeDropdown === 'function') {
                updateResumeDropdown();
            }
        }
    });
    
    // Manual sync function for applications
    function updateApplicationsAndAnalytics() {
        try {
            // Update the global applications array
            const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            window.applications = savedApplications;
            
            // Update applications display if on applications tab
            if (typeof renderApplications === 'function') {
                renderApplications();
            }
            
            // Update analytics if function exists
            if (typeof updateAnalytics === 'function') {
                updateAnalytics();
            }
            
            console.log('✅ Applications and analytics updated successfully');
        } catch (error) {
            console.error('❌ Error updating applications and analytics:', error);
        }
    }
    
    // Periodic check for changes (fallback for cross-tab sync issues)
    let lastApplicationCount = 0;
    let lastContactCount = 0;
    let lastResumeCount = 0;
    
    setInterval(function() {
        try {
            const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const contacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
            const resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
            
            // Check if applications count changed
            if (applications.length !== lastApplicationCount) {
                console.log('🔄 Applications count changed:', lastApplicationCount, '->', applications.length);
                lastApplicationCount = applications.length;
                updateApplicationsAndAnalytics();
            }
            
            // Check if contacts count changed
            if (contacts.length !== lastContactCount) {
                console.log('🔄 Contacts count changed:', lastContactCount, '->', contacts.length);
                lastContactCount = contacts.length;
                if (typeof renderContacts === 'function') {
                    renderContacts();
                }
            }
            
            // Check if resumes count changed
            if (resumes.length !== lastResumeCount) {
                console.log('🔄 Resumes count changed:', lastResumeCount, '->', resumes.length);
                lastResumeCount = resumes.length;
                if (typeof renderResumes === 'function') {
                    renderResumes();
                }
                if (typeof updateResumeDropdown === 'function') {
                    updateResumeDropdown();
                }
            }
        } catch (error) {
            console.error('❌ Error in periodic sync check:', error);
        }
    }, 2000); // Check every 2 seconds
    
    // Listen for custom events from chrome extension
    window.addEventListener('chromeExtensionDataUpdated', function(e) {
        console.log('📱 Chrome extension data updated event received');
        setTimeout(updateApplicationsAndAnalytics, 500); // Small delay to allow data to settle
    });
    
    // Listen for focus events to sync when user returns to tab
    window.addEventListener('focus', function() {
        console.log('👁️ Window focused, checking for data updates...');
        setTimeout(updateApplicationsAndAnalytics, 1000);
    });
    
    // Listen for visibility change events
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('👁️ Tab became visible, checking for data updates...');
            setTimeout(updateApplicationsAndAnalytics, 1000);
        }
    });
    
    // Expose sync function globally for manual triggering
    window.forceSyncApplications = updateApplicationsAndAnalytics;
    
    // Initial sync on load
    setTimeout(function() {
        updateApplicationsAndAnalytics();
    }, 1000);
    
    console.log('✅ Immediate Sync Handler initialized');
})();
