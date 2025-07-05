// Resumes Feature Module - Cloud-Only MongoDB Integration
// Handles resume file uploads and management with MongoDB cloud database

(function() {
  'use strict';
  
  console.log('📄 Loading Resumes Module (Cloud-Only)...');
  
  // Module state
  let resumes = [];
  let isInitialized = false;
  
  // Initialize the module
  async function initialize() {
    if (isInitialized) {
      console.log('✅ Resumes module already initialized');
      return;
    }
    
    try {
      await loadResumes();
      setupEventListeners();
      updateResumeDropdown();
      
      isInitialized = true;
      console.log(`📄 Resumes module initialized with ${resumes.length} resumes`);
    } catch (error) {
      console.error('❌ Failed to initialize resumes module:', error);
      showErrorMessage('Failed to load resumes. Please check your connection.');
    }
  }
  
  // Load resumes from cloud API
  async function loadResumes() {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      resumes = await window.apiService.getResumes();
      
      // Update global reference for backward compatibility
      window.resumes = resumes;
      window.jobTracker.resumes = resumes;
      
      renderResumes();
      
    } catch (error) {
      console.error('❌ Error loading resumes:', error);
      resumes = [];
      window.resumes = [];
      window.jobTracker.resumes = [];
      throw error;
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // File upload handler
    const fileInput = document.getElementById('resumeFile');
    if (fileInput) {
      fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Resume name input handler
    const nameInput = document.getElementById('resumeName');
    if (nameInput) {
      nameInput.addEventListener('input', validateResumeForm);
    }
    
    // Version input handler
    const versionInput = document.getElementById('resumeVersionInput');
    if (versionInput) {
      versionInput.addEventListener('input', validateResumeForm);
    }
  }
  
  // Handle file upload
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      showErrorMessage('Please upload a PDF, DOC, or DOCX file');
      event.target.value = '';
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showErrorMessage('File size must be less than 5MB');
      event.target.value = '';
      return;
    }
    
    // Auto-fill resume name if empty
    const nameInput = document.getElementById('resumeName');
    if (nameInput && !nameInput.value.trim()) {
      nameInput.value = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    }
    
    validateResumeForm();
  }
  
  // Add resume - Now saves to cloud
  async function addResume() {
    const nameInput = document.getElementById('resumeName');
    const fileInput = document.getElementById('resumeFile');
    const versionInput = document.getElementById('resumeVersionInput');
    
    if (!nameInput || !fileInput || !versionInput) {
      showErrorMessage('Resume form elements not found');
      return;
    }
    
    const name = nameInput.value.trim();
    const file = fileInput.files[0];
    const version = versionInput.value.trim();
    
    if (!name) {
      showErrorMessage('Please enter a resume name');
      return;
    }
    
    if (!file) {
      showErrorMessage('Please select a file to upload');
      return;
    }
    
    if (!version) {
      showErrorMessage('Please enter a version');
      return;
    }
    
    // Show loading state
    const addButton = document.querySelector('#resumes .btn-success');
    if (addButton) {
      addButton.disabled = true;
      addButton.textContent = 'Uploading...';
    }
    
    try {
      // Create file reader to get base64 data
      const fileData = await readFileAsDataURL(file);
      
      const resumeData = {
        name: name,
        version: version,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: fileData,
        isDefault: resumes.length === 0
      };
      
      // Save to cloud
      const savedResume = await window.apiService.saveResume(resumeData);
      
      // Update local state
      resumes.push(savedResume.data || savedResume);
      window.resumes = resumes;
      window.jobTracker.resumes = resumes;
      
      // Update UI
      renderResumes();
      updateResumeDropdown();
      clearResumeForm();
      
      showSuccessMessage(`Resume "${name}" uploaded successfully!`);
      
    } catch (error) {
      console.error('Failed to add resume:', error);
      showErrorMessage(`Failed to upload resume: ${error.message}`);
    } finally {
      // Reset button state
      if (addButton) {
        addButton.disabled = false;
        addButton.textContent = 'Upload Resume';
      }
    }
  }
  
  // Helper function to read file as data URL
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.onerror = function() {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }
  
  // Render resumes list - Simple list like contacts
  function renderResumes() {
    const resumesList = document.getElementById('resumesList');
    if (!resumesList) return;
    
    resumesList.innerHTML = '';
    
    if (resumes.length === 0) {
      resumesList.innerHTML = `
        <div class="empty-state">
          <div>📄</div>
          <h3>No Resumes Yet</h3>
          <p>Upload your first resume to start tracking your applications</p>
          <div style="margin-top: 24px; padding: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <p style="font-size: 0.9rem; margin: 0; opacity: 0.8;">💡 Tip: You can upload multiple versions (Technical, Senior, etc.) and set a default</p>
          </div>
        </div>
      `;
      return;
    }
    
    resumes.forEach((resume) => {
      const resumeCard = document.createElement('div');
      resumeCard.className = 'contact-card'; // Use same class as contacts
      
      resumeCard.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
          <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            📄 ${escapeHtml(resume.name)}
            ${resume.isDefault ? '<span style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.7rem;">DEFAULT</span>' : ''}
          </h4>
          <div style="opacity: 0.7; font-size: 0.8rem; color: var(--text-secondary);">
            ${formatDate(resume.uploadDate || resume.createdAt)}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div style="background: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px;">Version</div>
            <div style="font-weight: 600;">${escapeHtml(resume.version)}</div>
          </div>
          <div style="background: rgba(255, 255, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);">
            <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px;">Size</div>
            <div style="font-weight: 600;">${formatFileSize(resume.fileSize)}</div>
          </div>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.15); margin-bottom: 16px;">
          <div style="font-size: 0.8rem; opacity: 0.8; margin-bottom: 4px;">📎 File</div>
          <div style="font-weight: 500; word-break: break-all;">${escapeHtml(resume.fileName)}</div>
        </div>
        
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="window.ResumesModule.downloadResume('${resume._id}')">
            ⬇️ Download
          </button>
          ${!resume.isDefault ? `<button class="btn btn-sm btn-secondary" onclick="window.ResumesModule.setDefaultResume('${resume._id}')">
            ⭐ Set Default
          </button>` : ''}
          <button class="btn btn-sm btn-danger" onclick="window.ResumesModule.confirmDeleteResume('${resume._id}')">
            🗑️ Delete
          </button>
        </div>
      `;
      
      resumesList.appendChild(resumeCard);
    });
  }
  
  // Update resume dropdown in applications form
  function updateResumeDropdown() {
    const dropdown = document.getElementById('resumeVersion');
    if (!dropdown) return;
    
    // Save current selection
    const currentValue = dropdown.value;
    
    // Clear existing options
    dropdown.innerHTML = '<option value="">Select a resume version</option>';
    
    // Add resume options
    resumes.forEach(resume => {
      const option = document.createElement('option');
      option.value = `${resume.name} (${resume.version})`;
      option.textContent = `${resume.name} (${resume.version})`;
      if (resume.isDefault) {
        option.textContent += ' - Default';
      }
      dropdown.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentValue && Array.from(dropdown.options).some(opt => opt.value === currentValue)) {
      dropdown.value = currentValue;
    } else if (resumes.length > 0) {
      // Select default resume if available
      const defaultResume = resumes.find(r => r.isDefault);
      if (defaultResume) {
        dropdown.value = `${defaultResume.name} (${defaultResume.version})`;
      }
    }
  }
  
  // Download resume
  function downloadResume(id) {
    const resume = resumes.find(r => r._id === id);
    if (!resume) {
      showErrorMessage('Resume not found');
      return;
    }
    
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = resume.fileData;
      link.download = resume.fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccessMessage(`Downloading ${resume.name}`);
    } catch (error) {
      console.error('Download failed:', error);
      showErrorMessage('Failed to download resume');
    }
  }
  
  // Set default resume - Now uses cloud API
  async function setDefaultResume(id) {
    try {
      await window.apiService.setDefaultResume(id);
      
      // Update local state
      resumes.forEach(resume => {
        resume.isDefault = resume._id === id;
      });
      
      window.resumes = resumes;
      window.jobTracker.resumes = resumes;
      
      renderResumes();
      updateResumeDropdown();
      
      const resume = resumes.find(r => r._id === id);
      showSuccessMessage(`${resume.name} set as default resume`);
      
    } catch (error) {
      console.error('Failed to set default resume:', error);
      showErrorMessage(`Failed to set default resume: ${error.message}`);
    }
  }
  
  // Confirm delete resume
  function confirmDeleteResume(id) {
    const resume = resumes.find(r => r._id === id);
    if (!resume) {
      showErrorMessage('Resume not found');
      return;
    }
    
    window.showCustomConfirmDialog(
      'Delete Resume',
      `Are you sure you want to delete "${resume.name}"?`,
      () => deleteResume(id)
    );
  }
  
  // Delete resume - Now uses cloud API
  async function deleteResume(id) {
    try {
      await window.apiService.deleteResume(id);
      
      // Remove from local state
      resumes = resumes.filter(r => r._id !== id);
      window.resumes = resumes;
      window.jobTracker.resumes = resumes;
      
      // Update UI
      renderResumes();
      updateResumeDropdown();
      
      showSuccessMessage('Resume deleted successfully');
      
    } catch (error) {
      console.error('Failed to delete resume:', error);
      showErrorMessage(`Failed to delete resume: ${error.message}`);
    }
  }
  
  // Clear resume form
  function clearResumeForm() {
    const nameInput = document.getElementById('resumeName');
    const fileInput = document.getElementById('resumeFile');
    const versionInput = document.getElementById('resumeVersionInput');
    
    if (nameInput) nameInput.value = '';
    if (fileInput) fileInput.value = '';
    if (versionInput) versionInput.value = '';
    
    validateResumeForm();
  }
  
  // Validate resume form
  function validateResumeForm() {
    const nameInput = document.getElementById('resumeName');
    const fileInput = document.getElementById('resumeFile');
    const versionInput = document.getElementById('resumeVersionInput');
    const addButton = document.querySelector('#resumes .btn-success');
    
    if (!nameInput || !fileInput || !versionInput || !addButton) return;
    
    const isValid = nameInput.value.trim() && fileInput.files[0] && versionInput.value.trim();
    addButton.disabled = !isValid;
  }
  
  // Utility functions
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function showSuccessMessage(message) {
    if (window.showSuccessMessage) {
      window.showSuccessMessage(message);
    } else {
      console.log('✅', message);
    }
  }
  
  function showErrorMessage(message) {
    if (window.showErrorMessage) {
      window.showErrorMessage(message);
    } else {
      console.error('❌', message);
    }
  }
  
  
  // Public API
  window.ResumesModule = {
    initialize,
    loadResumes,
    addResume,
    downloadResume,
    setDefaultResume,
    confirmDeleteResume,
    deleteResume,
    clearResumeForm,
    updateResumeDropdown,
    renderResumes
  };
  
  // Export global functions for backward compatibility
  window.addResume = addResume;
  window.downloadResume = downloadResume;
  window.deleteResume = (id) => confirmDeleteResume(id);
  window.renderResumes = renderResumes;
  window.updateResumeDropdown = updateResumeDropdown;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('📄 Resumes module loaded successfully (Cloud-Only)');
  
})();