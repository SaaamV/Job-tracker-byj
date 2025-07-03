// Resumes Feature Module - Simple File Management
// Handles resume file uploads and management (client-side only)

(function() {
  'use strict';
  
  console.log('📄 Loading Resumes Module...');
  
  // Module state
  let resumes = [];
  let isInitialized = false;
  
  // Initialize the module
  function initialize() {
    if (isInitialized) {
      console.log('✅ Resumes module already initialized');
      return;
    }
    
    setupEventListeners();
    renderResumes();
    updateResumeDropdown();
    
    isInitialized = true;
    console.log('📄 Resumes module initialized');
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
      nameInput.value = file.name.replace(/\\.[^/.]+$/, ''); // Remove extension
    }
    
    validateResumeForm();
  }
  
  // Add resume
  function addResume() {
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
    
    // Check for duplicate names
    if (resumes.some(resume => resume.name.toLowerCase() === name.toLowerCase())) {
      showErrorMessage('A resume with this name already exists');
      return;
    }
    
    // Create file reader to store file data
    const reader = new FileReader();
    reader.onload = function(e) {
      const resumeData = {
        id: Date.now() + Math.random(),
        name: name,
        version: version,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: e.target.result, // Base64 encoded file data
        uploadDate: new Date().toISOString(),
        isDefault: resumes.length === 0
      };
      
      resumes.push(resumeData);
      
      // Update global references
      window.resumes = resumes;
      window.jobTracker.resumes = resumes;
      
      // Update UI
      renderResumes();
      updateResumeDropdown();
      clearResumeForm();
      
      showSuccessMessage(`Resume "${name}" uploaded successfully!`);
    };
    
    reader.onerror = function() {
      showErrorMessage('Failed to read file');
    };
    
    reader.readAsDataURL(file);
  }
  
  // Render resumes list
  function renderResumes() {
    const resumesList = document.getElementById('resumesList');
    if (!resumesList) return;
    
    resumesList.innerHTML = '';
    
    if (resumes.length === 0) {
      resumesList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
          <h3>No resumes uploaded</h3>
          <p>Upload your first resume to get started.</p>
        </div>
      `;
      return;
    }
    
    resumes.forEach((resume, index) => {
      const resumeCard = document.createElement('div');
      resumeCard.className = 'resume-card';
      if (resume.isDefault) {
        resumeCard.classList.add('default-resume');
      }
      
      resumeCard.innerHTML = `
        <div class="resume-header">
          <h4>${escapeHtml(resume.name)}</h4>
          ${resume.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <p><strong>Version:</strong> ${escapeHtml(resume.version)}</p>
        <p><strong>File:</strong> ${escapeHtml(resume.fileName)}</p>
        <p><strong>Size:</strong> ${formatFileSize(resume.fileSize)}</p>
        <p><strong>Uploaded:</strong> ${formatDate(resume.uploadDate)}</p>
        
        <div class="resume-actions">
          <button class="btn btn-sm btn-primary" onclick="window.ResumesModule.downloadResume('${resume.id}')">Download</button>
          <button class="btn btn-sm" onclick="window.ResumesModule.setDefaultResume('${resume.id}')">Set Default</button>
          <button class="btn btn-sm btn-danger" onclick="window.ResumesModule.confirmDeleteResume('${resume.id}')">Delete</button>
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
    // Convert id to number if it's a string
    const numId = typeof id === 'string' ? parseFloat(id) : id;
    const resume = resumes.find(r => r.id === numId);
    if (!resume) {
      showErrorMessage('Resume not found');
      return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = resume.fileData;
    link.download = resume.fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage(`Downloading ${resume.name}`);
  }
  
  // Set default resume
  function setDefaultResume(id) {
    // Convert id to number if it's a string
    const numId = typeof id === 'string' ? parseFloat(id) : id;
    
    // Remove default from all resumes
    resumes.forEach(resume => {
      resume.isDefault = false;
    });
    
    // Set new default
    const resume = resumes.find(r => r.id === numId);
    if (resume) {
      resume.isDefault = true;
      renderResumes();
      updateResumeDropdown();
      showSuccessMessage(`${resume.name} set as default resume`);
    }
  }
  
  // Confirm delete resume
  function confirmDeleteResume(id) {
    // Convert id to number if it's a string
    const numId = typeof id === 'string' ? parseFloat(id) : id;
    const resume = resumes.find(r => r.id === numId);
    if (!resume) {
      showErrorMessage('Resume not found');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${resume.name}"?`)) {
      deleteResume(numId);
    }
  }
  
  // Delete resume
  function deleteResume(id) {
    // Convert id to number if it's a string
    const numId = typeof id === 'string' ? parseFloat(id) : id;
    const index = resumes.findIndex(r => r.id === numId);
    if (index === -1) {
      showErrorMessage('Resume not found');
      return;
    }
    
    const deletedResume = resumes[index];
    resumes.splice(index, 1);
    
    // If deleted resume was default and there are other resumes, set first one as default
    if (deletedResume.isDefault && resumes.length > 0) {
      resumes[0].isDefault = true;
    }
    
    // Update global references
    window.resumes = resumes;
    window.jobTracker.resumes = resumes;
    
    // Update UI
    renderResumes();
    updateResumeDropdown();
    
    showSuccessMessage(`Resume "${deletedResume.name}" deleted successfully`);
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
    const addButton = document.querySelector('#resumes .btn-primary');
    
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
  
  console.log('📄 Resumes module loaded successfully');
  
})();