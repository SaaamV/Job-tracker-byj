// applications-fixed.js - COMPLETELY FIXED application management

(function() {
    'use strict';
    
    // Avoid variable conflicts by checking if already initialized
    if (window.applicationsModuleLoaded) {
        console.log('Applications module already loaded, skipping...');
        return;
    }
    
    console.log('Loading Applications Module...');
    
    // Initialize applications array - only if not already exists
    if (!window.applications) {
        window.applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
    }
    let applications = window.applications;

    function addApplication() {
        console.log('addApplication() called');
        
        const application = {
            id: Date.now() + Math.random(),
            jobTitle: document.getElementById('jobTitle').value.trim(),
            company: document.getElementById('company').value.trim(),
            jobPortal: document.getElementById('jobPortal').value,
            jobUrl: document.getElementById('jobUrl').value.trim(),
            applicationDate: document.getElementById('applicationDate').value || new Date().toISOString().split('T')[0],
            status: document.getElementById('status').value,
            resumeVersion: document.getElementById('resumeVersion').value,
            location: document.getElementById('location').value.trim(),
            salaryRange: document.getElementById('salaryRange').value.trim(),
            jobType: document.getElementById('jobType').value,
            priority: document.getElementById('priority').value,
            followUpDate: document.getElementById('followUpDate').value,
            notes: document.getElementById('notes').value.trim(),
            dateAdded: new Date().toISOString()
        };

        // Validate required fields
        if (!application.jobTitle || !application.company) {
            showMessage('Please fill in required fields (Job Title and Company)', 'error');
            return;
        }

        try {
            // Add to applications array
            applications.push(application);
            window.applications = applications;
            
            // Save to localStorage
            localStorage.setItem('jobApplications', JSON.stringify(applications));
            
            // Update UI
            renderApplications();
            if (typeof updateAnalytics === 'function') {
                updateAnalytics();
            }
            clearForm();
            
            showMessage('Application added successfully!', 'success');
            console.log('Application added. Total applications:', applications.length);
            
        } catch (error) {
            console.error('Error adding application:', error);
            showMessage('Failed to save application. Please try again.', 'error');
        }
    }

    function loadApplications() {
        try {
            const savedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            applications = savedApplications;
            window.applications = savedApplications;
            
            console.log('Loaded applications:', applications.length);
            renderApplications();
            
            if (typeof updateAnalytics === 'function') {
                updateAnalytics();
            }
            
        } catch (error) {
            console.error('Error loading applications:', error);
            applications = [];
            window.applications = [];
        }
    }

    function renderApplications() {
        const tbody = document.getElementById('applicationsBody');
        if (!tbody) {
            console.error('Applications table body not found');
            return;
        }
        
        tbody.innerHTML = '';

        let filteredApps = getFilteredApplications();

        if (filteredApps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9">No applications found. Add your first application above!</td></tr>';
            return;
        }

        filteredApps.forEach(app => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(app.applicationDate)}</td>
                <td><strong>${app.jobTitle}</strong></td>
                <td>${app.company}</td>
                <td>${app.jobPortal || 'N/A'}</td>
                <td><span class="status-${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span></td>
                <td>${app.resumeVersion || 'N/A'}</td>
                <td><span class="priority-${app.priority.toLowerCase()}">${app.priority}</span></td>
                <td>${getFollowUpStatus(app.followUpDate)}</td>
                <td>
                    ${app.jobUrl ? `<a href="${app.jobUrl}" target="_blank" title="View Job Posting">🔗</a> | ` : ''}
                    <a href="#" onclick="editApplication(${app.id})" title="Edit">✏️</a> |
                    <a href="#" onclick="duplicateApplication(${app.id})" title="Duplicate">📋</a> |
                    <a href="#" onclick="deleteApplication(${app.id})" style="color: red;" title="Delete">🗑️</a>
                </td>
            `;
            tbody.appendChild(row);
        });

        console.log('Rendered applications:', filteredApps.length);
    }

    function getFilteredApplications() {
        let filtered = [...applications];
        
        const statusFilter = document.getElementById('statusFilter')?.value;
        if (statusFilter) {
            filtered = filtered.filter(app => app.status === statusFilter);
        }
        
        const companyFilter = document.getElementById('companyFilter')?.value?.toLowerCase();
        if (companyFilter) {
            filtered = filtered.filter(app => 
                app.company.toLowerCase().includes(companyFilter)
            );
        }
        
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.applicationDate) - new Date(b.applicationDate);
                case 'date-desc':
                    return new Date(b.applicationDate) - new Date(a.applicationDate);
                case 'company':
                    return a.company.localeCompare(b.company);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'priority':
                    const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                default:
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
        });
        
        return filtered;
    }

    function filterApplications() {
        renderApplications();
    }

    function getFollowUpStatus(followUpDate) {
        if (!followUpDate) return 'N/A';
        
        const today = new Date().toISOString().split('T')[0];
        const followUp = followUpDate;
        
        if (followUp < today) {
            return `<span class="follow-up-overdue">Overdue</span>`;
        } else if (followUp === today) {
            return `<span class="follow-up-today">Today</span>`;
        } else {
            return `<span class="follow-up-upcoming">${formatDate(followUp)}</span>`;
        }
    }

    function deleteApplication(id) {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                applications = applications.filter(app => app.id !== id);
                window.applications = applications;
                localStorage.setItem('jobApplications', JSON.stringify(applications));
                
                renderApplications();
                if (typeof updateAnalytics === 'function') {
                    updateAnalytics();
                }
                
                showMessage('Application deleted successfully!', 'success');
                
            } catch (error) {
                console.error('Error deleting application:', error);
                showMessage('Failed to delete application. Please try again.', 'error');
            }
        }
    }

    function editApplication(id) {
        const app = applications.find(a => a.id === id);
        if (!app) return;

        // Populate form with existing data
        document.getElementById('jobTitle').value = app.jobTitle || '';
        document.getElementById('company').value = app.company || '';
        document.getElementById('jobPortal').value = app.jobPortal || '';
        document.getElementById('jobUrl').value = app.jobUrl || '';
        document.getElementById('applicationDate').value = app.applicationDate || '';
        document.getElementById('status').value = app.status || 'Applied';
        document.getElementById('resumeVersion').value = app.resumeVersion || '';
        document.getElementById('location').value = app.location || '';
        document.getElementById('salaryRange').value = app.salaryRange || '';
        document.getElementById('jobType').value = app.jobType || '';
        document.getElementById('priority').value = app.priority || 'Medium';
        document.getElementById('followUpDate').value = app.followUpDate || '';
        document.getElementById('notes').value = app.notes || '';

        // Delete old version
        applications = applications.filter(a => a.id !== id);
        window.applications = applications;
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        
        renderApplications();
        if (typeof updateAnalytics === 'function') {
            updateAnalytics();
        }
        
        showMessage('Application loaded for editing. Make changes and click "Add Application" to save.', 'info');
    }

    function duplicateApplication(id) {
        const app = applications.find(a => a.id === id);
        if (!app) return;

        // Populate form with existing data but clear some fields
        document.getElementById('jobTitle').value = app.jobTitle || '';
        document.getElementById('company').value = '';
        document.getElementById('jobPortal').value = app.jobPortal || '';
        document.getElementById('jobUrl').value = '';
        document.getElementById('applicationDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('status').value = 'Applied';
        document.getElementById('resumeVersion').value = app.resumeVersion || '';
        document.getElementById('location').value = app.location || '';
        document.getElementById('salaryRange').value = app.salaryRange || '';
        document.getElementById('jobType').value = app.jobType || '';
        document.getElementById('priority').value = app.priority || 'Medium';
        document.getElementById('followUpDate').value = '';
        document.getElementById('notes').value = '';

        showMessage('Application duplicated. Modify details and click "Add Application" to save.', 'info');
    }

    function clearForm() {
        const inputs = document.querySelectorAll('#applications input, #applications select, #applications textarea');
        inputs.forEach(input => {
            if (input.id === 'applicationDate') {
                input.value = new Date().toISOString().split('T')[0];
            } else if (input.id === 'status') {
                input.value = 'Applied';
            } else if (input.id === 'priority') {
                input.value = 'Medium';
            } else {
                input.value = '';
            }
        });
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    }

    function showMessage(message, type = 'info') {
        let messageEl = document.getElementById('message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                max-width: 400px;
            `;
            document.body.appendChild(messageEl);
        }
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        messageEl.style.backgroundColor = colors[type] || colors.info;
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            if (messageEl) {
                messageEl.style.display = 'none';
            }
        }, 4000);
    }

    // Initialize applications when DOM is loaded
    function initializeApplications() {
        console.log('Initializing applications module...');
        
        loadApplications();
        
        // Set default application date to today
        const applicationDateInput = document.getElementById('applicationDate');
        if (applicationDateInput && !applicationDateInput.value) {
            applicationDateInput.value = new Date().toISOString().split('T')[0];
        }
        
        console.log('Applications module initialized. Total applications:', applications.length);
    }

    // Make functions globally available
    window.addApplication = addApplication;
    window.renderApplications = renderApplications;
    window.filterApplications = filterApplications;
    window.deleteApplication = deleteApplication;
    window.editApplication = editApplication;
    window.duplicateApplication = duplicateApplication;
    window.clearForm = clearForm;
    window.loadApplications = loadApplications;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApplications);
    } else {
        initializeApplications();
    }
    
    // Mark module as loaded
    window.applicationsModuleLoaded = true;
    
    console.log('Applications module loaded successfully');
})();