// Cloud sync functions
async function syncData() {
    if (!apiService.isOnline) {
        showSyncStatus('Cannot sync while offline', 'error');
        return;
    }
    
    showSyncStatus('Syncing data...', 'info');
    
    try {
        await apiService.syncData();
        updateLastSyncTime();
        showSyncStatus('Data synced successfully!', 'success');
        
        // Refresh UI with latest data
        applications = await apiService.getApplications();
        contacts = await apiService.getContacts();
        resumes = await apiService.getResumes();
        
        renderApplications();
        renderContacts();
        renderResumes();
        updateAnalytics();
        
    } catch (error) {
        console.error('Sync failed:', error);
        showSyncStatus('Sync failed. Please try again.', 'error');
    }
}

function updateLastSyncTime() {
    const lastSync = localStorage.getItem('lastSync');
    const lastSyncEl = document.getElementById('lastSyncTime');
    
    if (lastSyncEl) {
        if (lastSync) {
            lastSyncEl.textContent = new Date(lastSync).toLocaleString();
        } else {
            lastSyncEl.textContent = 'Never';
        }
    }
}

// googlesheets.js - Google Sheets integration

// Google Sheets API configuration
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let gapi;
let googleAuth = null;
let isGoogleSignedIn = false;

// Initialize Google API
function initializeGoogleAPI() {
// Check if gapi is loaded
if (typeof gapi === 'undefined') {
console.warn('Google API not loaded. Skipping Google Sheets integration.');
  showSyncStatus('Google Sheets integration not available. Please check your internet connection.', 'error');
    return;
  }
  
gapi.load('auth2', initializeGapiClient);
}

async function initializeGapiClient() {
try {
// You need to get these from Google Cloud Console
await gapi.auth2.init({
  client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
});

googleAuth = gapi.auth2.getAuthInstance();

// Check if user is already signed in
if (googleAuth.isSignedIn.get()) {
  isGoogleSignedIn = true;
  updateGoogleUIState(true);
  }

// Listen for sign-in state changes
  googleAuth.isSignedIn.listen(updateGoogleUIState);
  } catch (error) {
    console.error('Error initializing Google API:', error);
    showSyncStatus('Failed to initialize Google Sheets. Please check your configuration.', 'error');
  }
}

function updateGoogleUIState(isSignedIn) {
    isGoogleSignedIn = isSignedIn;
    const authSection = document.getElementById('googleAuth');
    const syncSection = document.getElementById('googleSyncOptions');
    
    if (isSignedIn) {
        authSection.style.display = 'none';
        syncSection.style.display = 'block';
        showSyncStatus('Connected to Google Sheets', 'success');
    } else {
        authSection.style.display = 'block';
        syncSection.style.display = 'none';
    }
}

async function signInToGoogle() {
    if (!googleAuth) {
        showMessage('Google API not initialized. Please refresh the page and try again.', 'error');
        return;
    }
    
    try {
        const result = await googleAuth.signIn();
        showMessage('Successfully connected to Google Sheets!', 'success');
    } catch (error) {
        console.error('Sign-in failed:', error);
        showMessage('Failed to sign in to Google. Please try again.', 'error');
    }
}

function disconnectGoogle() {
    if (googleAuth) {
        googleAuth.signOut();
        showMessage('Disconnected from Google Sheets', 'info');
    }
}

async function createNewSpreadsheet() {
    if (!isGoogleSignedIn) {
        showMessage('Please sign in to Google first', 'error');
        return;
    }
    
    const spreadsheetName = document.getElementById('spreadsheetName').value || 'Job Tracker';
    
    showSyncStatus('Creating spreadsheet...', 'info');
    
    try {
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: {
                title: spreadsheetName
            },
            sheets: [
                {
                    properties: {
                        title: 'Applications'
                    }
                },
                {
                    properties: {
                        title: 'Contacts'
                    }
                },
                {
                    properties: {
                        title: 'Analytics'
                    }
                }
            ]
        });
        
        const spreadsheetId = response.result.spreadsheetId;
        const spreadsheetUrl = response.result.spreadsheetUrl;
        
        // Save spreadsheet info
        localStorage.setItem('googleSheetsId', spreadsheetId);
        localStorage.setItem('googleSheetsUrl', spreadsheetUrl);
        
        // Setup initial data
        await setupSpreadsheetStructure(spreadsheetId);
        
        showSyncStatus(`Spreadsheet created successfully! <a href="${spreadsheetUrl}" target="_blank">Open in Google Sheets</a>`, 'success');
        
    } catch (error) {
        console.error('Failed to create spreadsheet:', error);
        showSyncStatus('Failed to create spreadsheet', 'error');
    }
}

async function setupSpreadsheetStructure(spreadsheetId) {
    try {
        // Setup Applications sheet headers
        const applicationsHeaders = [
            'Date Applied', 'Job Title', 'Company', 'Portal', 'Job URL', 'Status', 
            'Resume Version', 'Location', 'Salary Range', 'Job Type', 'Priority', 
            'Follow-up Date', 'Notes', 'Date Added'
        ];
        
        // Setup Contacts sheet headers
        const contactsHeaders = [
            'Name', 'Company', 'Position', 'LinkedIn URL', 'Email', 'Phone',
            'Relationship', 'Status', 'Last Contact Date', 'Next Follow-up Date',
            'Tags', 'Notes', 'Date Added'
        ];
        
        const requests = [
            {
                updateCells: {
                    range: {
                        sheetId: 0, // Applications sheet
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: applicationsHeaders.length
                    },
                    rows: [{
                        values: applicationsHeaders.map(header => ({
                            userEnteredValue: { stringValue: header },
                            userEnteredFormat: {
                                textFormat: { bold: true },
                                backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 }
                            }
                        }))
                    }],
                    fields: 'userEnteredValue,userEnteredFormat'
                }
            },
            {
                updateCells: {
                    range: {
                        sheetId: 1, // Contacts sheet
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: contactsHeaders.length
                    },
                    rows: [{
                        values: contactsHeaders.map(header => ({
                            userEnteredValue: { stringValue: header },
                            userEnteredFormat: {
                                textFormat: { bold: true },
                                backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 }
                            }
                        }))
                    }],
                    fields: 'userEnteredValue,userEnteredFormat'
                }
            }
        ];
        
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requests: requests
        });
        
    } catch (error) {
        console.error('Failed to setup spreadsheet structure:', error);
        throw error;
    }
}

async function syncToGoogleSheets() {
    if (!isGoogleSignedIn) {
        showMessage('Please sign in to Google first', 'error');
        return;
    }
    
    let spreadsheetId = localStorage.getItem('googleSheetsId');
    
    if (!spreadsheetId) {
        showMessage('No spreadsheet found. Please create one first.', 'error');
        return;
    }
    
    showSyncStatus('Syncing data to Google Sheets...', 'info');
    
    try {
        // Sync Applications
        await syncApplicationsToSheets(spreadsheetId);
        
        // Sync Contacts
        await syncContactsToSheets(spreadsheetId);
        
        // Update last sync time
        localStorage.setItem('lastGoogleSync', new Date().toISOString());
        
        const spreadsheetUrl = localStorage.getItem('googleSheetsUrl');
        showSyncStatus(`Sync completed successfully! <a href="${spreadsheetUrl}" target="_blank">View in Google Sheets</a>`, 'success');
        
    } catch (error) {
        console.error('Sync failed:', error);
        showSyncStatus('Sync failed. Please try again.', 'error');
    }
}

async function syncApplicationsToSheets(spreadsheetId) {
    const applicationsData = applications.map(app => [
        app.applicationDate,
        app.jobTitle,
        app.company,
        app.jobPortal || '',
        app.jobUrl || '',
        app.status,
        app.resumeVersion || '',
        app.location || '',
        app.salaryRange || '',
        app.jobType || '',
        app.priority,
        app.followUpDate || '',
        app.notes || '',
        new Date(app.dateAdded).toLocaleDateString()
    ]);
    
    if (applicationsData.length === 0) return;
    
    // Clear existing data (except headers)
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: 'Applications!A2:Z'
    });
    
    // Add new data
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Applications!A2',
        valueInputOption: 'RAW',
        values: applicationsData
    });
}

async function syncContactsToSheets(spreadsheetId) {
    const contactsData = contacts.map(contact => [
        contact.name,
        contact.company || '',
        contact.position || '',
        contact.linkedinUrl || '',
        contact.email || '',
        contact.phone || '',
        contact.relationship,
        contact.status,
        contact.lastContactDate || '',
        contact.nextFollowUpDate || '',
        contact.tags || '',
        contact.notes || '',
        new Date(contact.dateAdded).toLocaleDateString()
    ]);
    
    if (contactsData.length === 0) return;
    
    // Clear existing data (except headers)
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: 'Contacts!A2:Z'
    });
    
    // Add new data
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Contacts!A2',
        valueInputOption: 'RAW',
        values: contactsData
    });
}

async function importFromGoogleSheets() {
    if (!isGoogleSignedIn) {
        showMessage('Please sign in to Google first', 'error');
        return;
    }
    
    const spreadsheetId = localStorage.getItem('googleSheetsId');
    if (!spreadsheetId) {
        showMessage('No linked spreadsheet found', 'error');
        return;
    }
    
    showSyncStatus('Importing data from Google Sheets...', 'info');
    
    try {
        // Import Applications
        const applicationsResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Applications!A2:Z'
        });
        
        // Import Contacts
        const contactsResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Contacts!A2:Z'
        });
        
        // Process imported data
        if (applicationsResponse.result.values) {
            processImportedApplications(applicationsResponse.result.values);
        }
        
        if (contactsResponse.result.values) {
            processImportedContacts(contactsResponse.result.values);
        }
        
        // Refresh UI
        renderApplications();
        renderContacts();
        updateAnalytics();
        
        showSyncStatus('Import completed successfully!', 'success');
        
    } catch (error) {
        console.error('Import failed:', error);
        showSyncStatus('Import failed. Please try again.', 'error');
    }
}

function processImportedApplications(sheetsData) {
    const importedApps = sheetsData.map(row => ({
        id: Date.now() + Math.random(),
        applicationDate: row[0] || '',
        jobTitle: row[1] || '',
        company: row[2] || '',
        jobPortal: row[3] || '',
        jobUrl: row[4] || '',
        status: row[5] || 'Applied',
        resumeVersion: row[6] || '',
        location: row[7] || '',
        salaryRange: row[8] || '',
        jobType: row[9] || '',
        priority: row[10] || 'Medium',
        followUpDate: row[11] || '',
        notes: row[12] || '',
        dateAdded: new Date().toISOString()
    }));
    
    // Merge with existing applications (avoid duplicates)
    importedApps.forEach(importedApp => {
        const exists = applications.some(app => 
            app.jobTitle === importedApp.jobTitle && 
            app.company === importedApp.company && 
            app.applicationDate === importedApp.applicationDate
        );
        
        if (!exists) {
            applications.push(importedApp);
        }
    });
    
    localStorage.setItem('jobApplications', JSON.stringify(applications));
}

function processImportedContacts(sheetsData) {
    const importedContacts = sheetsData.map(row => ({
        id: Date.now() + Math.random(),
        name: row[0] || '',
        company: row[1] || '',
        position: row[2] || '',
        linkedinUrl: row[3] || '',
        email: row[4] || '',
        phone: row[5] || '',
        relationship: row[6] || 'Network Contact',
        status: row[7] || 'Not Contacted',
        lastContactDate: row[8] || '',
        nextFollowUpDate: row[9] || '',
        tags: row[10] || '',
        notes: row[11] || '',
        dateAdded: new Date().toISOString()
    }));
    
    // Merge with existing contacts (avoid duplicates)
    importedContacts.forEach(importedContact => {
        const exists = contacts.some(contact => 
            contact.name === importedContact.name && 
            contact.email === importedContact.email
        );
        
        if (!exists) {
            contacts.push(importedContact);
        }
    });
    
    localStorage.setItem('jobContacts', JSON.stringify(contacts));
}

function showSyncStatus(message, type) {
    const statusDiv = document.getElementById('syncStatus');
    if (statusDiv) {
        statusDiv.innerHTML = message;
        statusDiv.className = `sync-status ${type}`;
    }
}

// Auto-sync functionality
function setupAutoSync() {
    const autoSyncSetting = localStorage.getItem('autoSyncSetting') || 'manual';
    
    if (autoSyncSetting !== 'manual' && isGoogleSignedIn) {
        let interval;
        
        switch (autoSyncSetting) {
            case 'hourly':
                interval = 60 * 60 * 1000; // 1 hour
                break;
            case 'daily':
                interval = 24 * 60 * 60 * 1000; // 24 hours
                break;
            case 'weekly':
                interval = 7 * 24 * 60 * 60 * 1000; // 7 days
                break;
            default:
                return;
        }
        
        // Set up periodic sync
        setInterval(() => {
            if (isGoogleSignedIn) {
                syncToGoogleSheets();
            }
        }, interval);
    }
}

// Event listeners for auto-sync settings
function setupAutoSyncListeners() {
    const autoSyncSelect = document.getElementById('autoSync');
    if (autoSyncSelect) {
        autoSyncSelect.addEventListener('change', function() {
            localStorage.setItem('autoSyncSetting', this.value);
            setupAutoSync();
        });
        
        // Set current value
        autoSyncSelect.value = localStorage.getItem('autoSyncSetting') || 'manual';
    }
}

// Initialize Google Sheets integration
function initializeGoogleSheets() {
    // For now, disable Google Sheets and use our own cloud sync
    console.log('Google Sheets integration disabled. Using built-in cloud sync instead.');
    
    const authSection = document.getElementById('googleAuth');
    const syncSection = document.getElementById('googleSyncOptions');
    
    if (authSection) {
        authSection.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h4>Cloud Sync</h4>
                <p>Your data is automatically synced to the cloud.</p>
                <button class="btn btn-success" onclick="syncData()">Sync Now</button>
                <p><small>Last sync: <span id="lastSyncTime">Never</span></small></p>
            </div>
        `;
    }
    
    if (syncSection) {
        syncSection.style.display = 'none';
    }
    
    // Show last sync time
    updateLastSyncTime();
}

// Backup and restore functionality
function createBackup() {
    const backupData = {
        applications: applications,
        contacts: contacts,
        resumes: resumes,
        customTemplates: customTemplates,
        settings: {
            autoSyncSetting: localStorage.getItem('autoSyncSetting'),
            googleSheetsId: localStorage.getItem('googleSheetsId'),
            googleSheetsUrl: localStorage.getItem('googleSheetsUrl')
        },
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    showMessage('Backup created successfully!', 'success');
}

function restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validate backup data
                if (!backupData.applications || !backupData.contacts) {
                    throw new Error('Invalid backup file format');
                }
                
                // Confirm restore
                if (confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
                    // Restore data
                    applications = backupData.applications || [];
                    contacts = backupData.contacts || [];
                    resumes = backupData.resumes || [];
                    customTemplates = backupData.customTemplates || [];
                    
                    // Save to localStorage
                    localStorage.setItem('jobApplications', JSON.stringify(applications));
                    localStorage.setItem('jobContacts', JSON.stringify(contacts));
                    localStorage.setItem('jobResumes', JSON.stringify(resumes));
                    localStorage.setItem('customEmailTemplates', JSON.stringify(customTemplates));
                    
                    // Restore settings
                    if (backupData.settings) {
                        Object.keys(backupData.settings).forEach(key => {
                            if (backupData.settings[key]) {
                                localStorage.setItem(key, backupData.settings[key]);
                            }
                        });
                    }
                    
                    // Refresh UI
                    renderApplications();
                    renderContacts();
                    renderResumes();
                    updateResumeDropdown();
                    updateAnalytics();
                    populateEmailContacts();
                    updateTemplateDropdown();
                    
                    showMessage('Backup restored successfully!', 'success');
                }
                
            } catch (error) {
                console.error('Restore failed:', error);
                showMessage('Failed to restore backup. Please check the file format.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Export to PDF functionality
function exportToPDF() {
    const printContent = generatePrintableReport();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Job Tracker Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    h1, h2 { color: #2c3e50; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .stat { display: inline-block; margin: 10px 20px 10px 0; }
                    @media print { 
                        body { margin: 20px; } 
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <div class="no-print" style="margin-top: 30px;">
                    <button onclick="window.print()">Print Report</button>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
}

function generatePrintableReport() {
    const stats = calculateDetailedStats();
    
    return `
        <h1>Job Application Tracker Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
            <h2>Summary Statistics</h2>
            <div class="stat"><strong>Total Applications:</strong> ${stats.totalApps}</div>
            <div class="stat"><strong>Interview Rate:</strong> ${stats.interviewRate}%</div>
            <div class="stat"><strong>Response Rate:</strong> ${stats.responseRate}%</div>
            <div class="stat"><strong>Offer Rate:</strong> ${stats.offerRate}%</div>
            <div class="stat"><strong>Total Contacts:</strong> ${contacts.length}</div>
        </div>
        
        <h2>Recent Applications</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Priority</th>
                </tr>
            </thead>
            <tbody>
                ${applications.slice(0, 20).map(app => `
                    <tr>
                        <td>${new Date(app.applicationDate).toLocaleDateString()}</td>
                        <td>${app.jobTitle}</td>
                        <td>${app.company}</td>
                        <td>${app.status}</td>
                        <td>${app.priority}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>Key Contacts</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Position</th>
                    <th>Relationship</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${contacts.slice(0, 15).map(contact => `
                    <tr>
                        <td>${contact.name}</td>
                        <td>${contact.company || 'N/A'}</td>
                        <td>${contact.position || 'N/A'}</td>
                        <td>${contact.relationship}</td>
                        <td>${contact.status}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function calculateDetailedStats() {
    const totalApps = applications.length;
    const interviewStatuses = ['Phone Screen', 'Interview Scheduled', 'Final Interview'];
    const interviewApps = applications.filter(app => interviewStatuses.includes(app.status)).length;
    const responseStatuses = ['Under Review', 'Phone Screen', 'Interview Scheduled', 'Final Interview', 'Offer', 'Rejected'];
    const responseApps = applications.filter(app => responseStatuses.includes(app.status)).length;
    const offerApps = applications.filter(app => app.status === 'Offer').length;
    
    return {
        totalApps,
        interviewRate: totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) : 0,
        responseRate: totalApps > 0 ? Math.round((responseApps / totalApps) * 100) : 0,
        offerRate: totalApps > 0 ? Math.round((offerApps / totalApps) * 100) : 0
    };
}