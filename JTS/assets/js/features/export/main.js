// Main export module - Entry point for all export functionality

const ExportManager = {
  // Initialize export functionality
  init() {
    console.log('Export Manager initialized');
    this.bindEvents();
  },

  // Bind event listeners
  bindEvents() {
    // These functions are already bound in the individual modules
    // Just ensure they're available globally
    if (typeof exportToExcel === 'undefined') {
      window.exportToExcel = () => ExcelExporter.exportToExcel();
    }
    
    if (typeof exportToPDF === 'undefined') {
      window.exportToPDF = () => PDFExporter.exportToPDF();
    }
    
    if (typeof exportReport === 'undefined') {
      window.exportReport = () => this.generateReport();
    }
  },

  // Generate comprehensive report
  async generateReport() {
    try {
      const currentApplications = window.jobTracker?.applications || window.applications || [];
      const currentContacts = window.jobTracker?.contacts || window.contacts || [];
      
      if (currentApplications.length === 0 && currentContacts.length === 0) {
        showMessage('No data available for report generation.', 'error');
        return;
      }

      // Show options dialog
      const choice = await this.showReportOptions();
      
      switch (choice) {
        case 'pdf':
          PDFExporter.exportToPDF();
          break;
        case 'excel':
          ExcelExporter.exportToExcel();
          break;
        case 'both':
          await ExcelExporter.exportToExcel();
          setTimeout(() => PDFExporter.exportToPDF(), 1000);
          break;
        default:
          return;
      }
      
    } catch (error) {
      console.error('Report generation failed:', error);
      showMessage('❌ Failed to generate report', 'error');
    }
  },

  // Show report format options
  showReportOptions() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'export-modal-overlay';
      modal.innerHTML = `
        <div class="export-modal">
          <h3>📊 Generate Professional Report</h3>
          <p>Choose your preferred format:</p>
          <div class="export-options">
            <button class="btn btn-primary" data-choice="pdf">
              📄 PDF Report
            </button>
            <button class="btn btn-success" data-choice="excel">
              📊 Excel Spreadsheet
            </button>
            <button class="btn btn-warning" data-choice="both">
              📄📊 Both Formats
            </button>
          </div>
          <button class="btn btn-cancel" data-choice="cancel">Cancel</button>
        </div>
      `;
      
      modal.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-choice')) {
          const choice = e.target.getAttribute('data-choice');
          modal.remove();
          resolve(choice);
        }
      });
      
      document.body.appendChild(modal);
    });
  },

  // Import data functionality
  async importData() {
    const fileInput = document.getElementById('importFile');
    const replaceData = document.getElementById('replaceData')?.checked || false;
    
    if (!fileInput?.files?.[0]) {
      showMessage('Please select a file to import.', 'error');
      return;
    }
    
    const file = fileInput.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();
    
    try {
      if (fileType === 'csv') {
        await this.importCSV(file, replaceData);
      } else if (['xlsx', 'xls'].includes(fileType)) {
        await this.importExcel(file, replaceData);
      } else {
        showMessage('Unsupported file format. Please use CSV or Excel files.', 'error');
        return;
      }
      
      showMessage('✅ Data imported successfully!', 'success');
      
      // Refresh the UI
      if (typeof loadApplications === 'function') loadApplications();
      if (typeof loadContacts === 'function') loadContacts();
      
    } catch (error) {
      console.error('Import failed:', error);
      showMessage('❌ Failed to import data', 'error');
    }
  },

  // Import CSV data
  async importCSV(file, replaceData) {
    // This would need a CSV parsing library
    // For now, show a message about Excel import
    showMessage('CSV import coming soon. Please use Excel format for now.', 'info');
  },

  // Import Excel data
  async importExcel(file, replaceData) {
    if (typeof XLSX === 'undefined') {
      showMessage('Excel library not loaded. Please refresh the page.', 'error');
      return;
    }
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    // Process each sheet
    const sheetNames = workbook.SheetNames;
    let importedData = {
      applications: [],
      contacts: [],
      resumes: []
    };
    
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (sheetName.toLowerCase().includes('application')) {
        importedData.applications = this.mapApplicationData(jsonData);
      } else if (sheetName.toLowerCase().includes('contact')) {
        importedData.contacts = this.mapContactData(jsonData);
      } else if (sheetName.toLowerCase().includes('resume')) {
        importedData.resumes = this.mapResumeData(jsonData);
      }
    });
    
    // Save imported data
    await this.saveImportedData(importedData, replaceData);
  },

  // Map application data from import
  mapApplicationData(data) {
    return data.map(row => ({
      id: Date.now() + Math.random(),
      jobTitle: row['Job Title'] || row.jobTitle || '',
      company: row['Company'] || row.company || '',
      applicationDate: row['Application Date'] || row.applicationDate || new Date().toISOString().split('T')[0],
      status: row['Status'] || row.status || 'Applied',
      jobPortal: row['Job Portal'] || row.jobPortal || 'Other',
      location: row['Location'] || row.location || '',
      priority: row['Priority'] || row.priority || 'Medium',
      notes: row['Notes'] || row.notes || '',
      dateAdded: new Date().toISOString()
    }));
  },

  // Map contact data from import
  mapContactData(data) {
    return data.map(row => ({
      id: Date.now() + Math.random(),
      name: row['Contact Name'] || row.name || '',
      company: row['Company'] || row.company || '',
      position: row['Position/Title'] || row.position || '',
      email: row['Email Address'] || row.email || '',
      relationship: row['Relationship Type'] || row.relationship || 'Network Contact',
      status: row['Contact Status'] || row.status || 'Not Contacted',
      dateAdded: new Date().toISOString()
    }));
  },

  // Map resume data from import
  mapResumeData(data) {
    return data.map(row => ({
      id: Date.now() + Math.random(),
      name: row['Name'] || row.name || '',
      version: row['Version'] || row.version || '',
      fileName: row['File Name'] || row.fileName || '',
      dateAdded: new Date().toISOString()
    }));
  },

  // Save imported data
  async saveImportedData(importedData, replaceData) {
    if (replaceData) {
      // Replace existing data
      if (importedData.applications.length > 0) {
        window.applications = importedData.applications;
        localStorage.setItem('jobApplications', JSON.stringify(importedData.applications));
      }
      if (importedData.contacts.length > 0) {
        window.contacts = importedData.contacts;
        localStorage.setItem('jobContacts', JSON.stringify(importedData.contacts));
      }
      if (importedData.resumes.length > 0) {
        window.resumes = importedData.resumes;
        localStorage.setItem('jobResumes', JSON.stringify(importedData.resumes));
      }
    } else {
      // Merge with existing data
      const existingApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const existingContacts = JSON.parse(localStorage.getItem('jobContacts') || '[]');
      const existingResumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
      
      const mergedApplications = [...existingApplications, ...importedData.applications];
      const mergedContacts = [...existingContacts, ...importedData.contacts];
      const mergedResumes = [...existingResumes, ...importedData.resumes];
      
      window.applications = mergedApplications;
      window.contacts = mergedContacts;
      window.resumes = mergedResumes;
      
      localStorage.setItem('jobApplications', JSON.stringify(mergedApplications));
      localStorage.setItem('jobContacts', JSON.stringify(mergedContacts));
      localStorage.setItem('jobResumes', JSON.stringify(mergedResumes));
    }
  }
};

// Global functions for backward compatibility
function exportReport() {
  ExportManager.generateReport();
}

function importData() {
  ExportManager.importData();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ExportManager.init();
});

// Export for global use
window.ExportManager = ExportManager;