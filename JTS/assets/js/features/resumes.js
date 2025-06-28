// Resumes Feature Module - Clean and Consolidated
// Manages resume uploads, CV generation, and file handling

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
    
    loadResumes();
    setupEventListeners();
    
    isInitialized = true;
    console.log(`📄 Resumes module initialized with ${resumes.length} resumes`);
  }
  
  // Load resumes from localStorage
  function loadResumes() {
    try {
      resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
      window.resumes = resumes; // Backward compatibility
      
      renderResumes();
      updateResumeDropdown();
      
      console.log(`📄 Loaded ${resumes.length} resumes from storage`);
      
    } catch (error) {
      console.error('❌ Error loading resumes:', error);
      resumes = [];
      window.resumes = [];
    }
  }
  
  // Upload new resume
  function uploadResume() {
    console.log('📤 Uploading resume...');
    
    const formData = getResumeFormData();
    
    // Validate form data
    const validation = validateResumeForm(formData);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }
    
    showMessage('📤 Uploading resume...', 'info');
    
    const resume = {
      id: Date.now() + Math.random(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      fileName: formData.file.name,
      fileSize: formData.file.size,
      uploadDate: new Date().toISOString(),
      fileData: null
    };
    
    // Read file as base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        resume.fileData = e.target.result;
        
        // Add to resumes array
        resumes.push(resume);
        window.resumes = resumes;
        
        // Save to localStorage
        localStorage.setItem('jobResumes', JSON.stringify(resumes));
        
        // Update UI
        renderResumes();
        updateResumeDropdown();
        clearResumeForm();
        
        showMessage('✅ Resume uploaded successfully!', 'success');
        console.log(`📄 Resume uploaded: ${resume.name}`);
        
      } catch (error) {
        console.error('❌ Error saving resume:', error);
        showMessage('Failed to save resume. Please try again.', 'error');
      }
    };
    
    reader.onerror = function() {
      console.error('❌ Error reading file');
      showMessage('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsDataURL(formData.file);
  }
  
  // Get form data
  function getResumeFormData() {
    return {
      name: getElementById('resumeName').value.trim(),
      type: getElementById('resumeType').value,
      description: getElementById('resumeDescription').value.trim(),
      file: getElementById('resumeFile').files[0]
    };
  }
  
  // Validate resume form
  function validateResumeForm(data) {
    if (!data.name) {
      return { isValid: false, message: 'Please enter a resume name' };
    }
    
    if (!data.file) {
      return { isValid: false, message: 'Please select a resume file' };
    }
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(data.file.type)) {
      return { isValid: false, message: 'Please upload a PDF or Word document (.pdf, .doc, .docx)' };
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (data.file.size > maxSize) {
      return { isValid: false, message: 'File size must be less than 10MB' };
    }
    
    return { isValid: true };
  }
  
  // Render resumes list
  function renderResumes() {
    const resumesList = document.getElementById('resumesList');
    if (!resumesList) {
      console.warn('⚠️ resumesList element not found');
      return;
    }
    
    resumesList.innerHTML = '';
    
    if (resumes.length === 0) {
      resumesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary); background: transparent;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
          <h3>No resumes uploaded yet</h3>
          <p>Upload your first resume above to get started.</p>
        </div>
      `;
      return;
    }
    
    resumes.forEach(resume => {
      const card = createResumeCard(resume);
      resumesList.appendChild(card);
    });
    
    console.log(`📄 Rendered ${resumes.length} resume cards`);
  }
  
  // Create resume card element
  function createResumeCard(resume) {
    const card = document.createElement('div');
    card.className = 'resume-card';
    card.style.cssText = `
      background: #f5f5f7 !important;
      border: 1px solid #e5e5e7 !important;
      border-radius: 8px !important;
      padding: 16px !important;
      margin: 10px 0 !important;
      color: #333 !important;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    
    card.innerHTML = `
      <div class="resume-info" style="flex: 1; background: transparent !important;">
        <h4 style="margin: 0 0 8px 0; color: #333 !important; font-weight: 600;">${escapeHtml(resume.name)}</h4>
        <p style="margin: 4px 0; color: #666 !important;">
          <strong style="color: #333 !important;">Type:</strong> ${escapeHtml(resume.type)}
        </p>
        <p style="margin: 4px 0; color: #666 !important;">
          <strong style="color: #333 !important;">File:</strong> ${escapeHtml(resume.fileName)} (${formatFileSize(resume.fileSize)})
        </p>
        <p style="margin: 4px 0; color: #666 !important;">
          <strong style="color: #333 !important;">Uploaded:</strong> ${formatDate(resume.uploadDate)}
        </p>
        ${resume.description ? `
          <p style="margin: 4px 0; color: #666 !important;">
            <strong style="color: #333 !important;">Description:</strong> ${escapeHtml(resume.description)}
          </p>
        ` : ''}
      </div>
      <div class="resume-actions" style="display: flex; gap: 8px; flex-direction: column;">
        <button class="btn btn-primary" onclick="Resumes.download(${resume.id})" title="Download">
          📥 Download
        </button>
        <button class="btn btn-danger" onclick="Resumes.delete(${resume.id})" title="Delete">
          🗑️ Delete
        </button>
      </div>
    `;
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'none';
    });
    
    return card;
  }
  
  // Update resume dropdown in applications form
  function updateResumeDropdown() {
    const dropdown = document.getElementById('resumeVersion');
    if (!dropdown) {
      console.warn('⚠️ resumeVersion dropdown not found');
      return;
    }
    
    dropdown.innerHTML = '<option value="">Select Resume</option>';
    
    resumes.forEach(resume => {
      const option = document.createElement('option');
      option.value = resume.name;
      option.textContent = resume.name;
      dropdown.appendChild(option);
    });
    
    console.log(`📄 Updated resume dropdown with ${resumes.length} options`);
  }
  
  // Download resume
  function downloadResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) {
      showMessage('Resume not found', 'error');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = resume.fileData;
      link.download = resume.fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showMessage('📥 Resume downloaded successfully!', 'success');
      console.log(`📥 Downloaded resume: ${resume.name}`);
      
    } catch (error) {
      console.error('❌ Error downloading resume:', error);
      showMessage('Error downloading resume. Please try again.', 'error');
    }
  }
  
  // Delete resume
  function deleteResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) {
      showMessage('Resume not found', 'error');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${resume.name}"?`)) {
      return;
    }
    
    try {
      resumes = resumes.filter(r => r.id !== id);
      window.resumes = resumes;
      
      localStorage.setItem('jobResumes', JSON.stringify(resumes));
      
      renderResumes();
      updateResumeDropdown();
      
      showMessage('🗑️ Resume deleted successfully!', 'success');
      console.log(`🗑️ Deleted resume: ${resume.name}`);
      
    } catch (error) {
      console.error('❌ Error deleting resume:', error);
      showMessage('Error deleting resume. Please try again.', 'error');
    }
  }
  
  // Clear resume form
  function clearResumeForm() {
    getElementById('resumeName').value = '';
    getElementById('resumeType').value = 'General';
    getElementById('resumeDescription').value = '';
    getElementById('resumeFile').value = '';
  }
  
  // CV Template Generator
  function generateCVTemplate() {
    console.log('📋 Generating CV template...');
    
    const cvData = getCVFormData();
    
    if (!cvData.name || !cvData.email) {
      showMessage('Please fill in at least name and email', 'error');
      return;
    }
    
    try {
      const cvHtml = generateCVHTML(cvData);
      const cvPreview = document.getElementById('cvPreview');
      
      if (!cvPreview) {
        console.error('❌ cvPreview element not found');
        showMessage('CV preview area not found', 'error');
        return;
      }
      
      cvPreview.innerHTML = cvHtml;
      cvPreview.style.display = 'block';
      
      showMessage('✅ CV template generated successfully!', 'success');
      console.log('📋 CV template generated successfully');
      
    } catch (error) {
      console.error('❌ Error generating CV template:', error);
      showMessage('Error generating CV template. Please try again.', 'error');
    }
  }
  
  // Get CV form data
  function getCVFormData() {
    return {
      name: getElementById('cvName').value.trim(),
      email: getElementById('cvEmail').value.trim(),
      phone: getElementById('cvPhone').value.trim(),
      location: getElementById('cvLocation').value.trim(),
      linkedin: getElementById('cvLinkedin').value.trim(),
      website: getElementById('cvWebsite').value.trim(),
      summary: getElementById('cvSummary').value.trim()
    };
  }
  
  // Generate CV HTML
  function generateCVHTML(data) {
    return `
      <div class="cv-container" style="
        max-width: 800px; 
        margin: 20px auto; 
        padding: 40px; 
        background: #f5f5f7 !important; 
        border: 1px solid #e5e5e7 !important; 
        border-radius: 8px; 
        font-family: 'Times New Roman', serif; 
        line-height: 1.6;
        color: #333 !important;
      ">
        <div class="cv-header" style="
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 25px;
        ">
          <div class="cv-name" style="
            font-size: 2.5em; 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #333 !important;
          ">${escapeHtml(data.name)}</div>
          <div class="cv-contact" style="margin: 5px 0; color: #666 !important;">${escapeHtml(data.email)}</div>
          ${data.phone ? `<div class="cv-contact" style="margin: 5px 0; color: #666 !important;">${escapeHtml(data.phone)}</div>` : ''}
          ${data.location ? `<div class="cv-contact" style="margin: 5px 0; color: #666 !important;">${escapeHtml(data.location)}</div>` : ''}
          ${data.linkedin ? `<div class="cv-contact" style="margin: 5px 0; color: #666 !important;"><a href="${escapeHtml(data.linkedin)}" target="_blank" style="color: #007bff;">${escapeHtml(data.linkedin)}</a></div>` : ''}
          ${data.website ? `<div class="cv-contact" style="margin: 5px 0; color: #666 !important;"><a href="${escapeHtml(data.website)}" target="_blank" style="color: #007bff;">${escapeHtml(data.website)}</a></div>` : ''}
        </div>
        
        ${data.summary ? `
          <div class="cv-section" style="margin: 25px 0;">
            <div class="cv-section-title" style="
              font-size: 1.4em; 
              font-weight: bold; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
              color: #333 !important;
            ">PROFESSIONAL SUMMARY</div>
            <p style="margin: 0; color: #555 !important;">${escapeHtml(data.summary)}</p>
          </div>
        ` : ''}
        
        <div class="cv-section" style="margin: 25px 0;">
          <div class="cv-section-title" style="
            font-size: 1.4em; 
            font-weight: bold; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
            color: #333 !important;
          ">EXPERIENCE</div>
          <p style="margin: 0; color: #777 !important; font-style: italic;">Add your work experience here...</p>
        </div>
        
        <div class="cv-section" style="margin: 25px 0;">
          <div class="cv-section-title" style="
            font-size: 1.4em; 
            font-weight: bold; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
            color: #333 !important;
          ">EDUCATION</div>
          <p style="margin: 0; color: #777 !important; font-style: italic;">Add your education details here...</p>
        </div>
        
        <div class="cv-section" style="margin: 25px 0;">
          <div class="cv-section-title" style="
            font-size: 1.4em; 
            font-weight: bold; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
            color: #333 !important;
          ">SKILLS</div>
          <p style="margin: 0; color: #777 !important; font-style: italic;">List your key skills here...</p>
        </div>
        
        <div style="
          margin-top: 40px; 
          text-align: center; 
          padding-top: 20px; 
          border-top: 1px solid #eee;
        ">
          <button onclick="Resumes.printCV()" class="btn btn-primary" style="margin-right: 10px;">
            🖨️ Print CV
          </button>
          <button onclick="Resumes.copyCV()" class="btn btn-success">
            📋 Copy CV
          </button>
        </div>
      </div>
    `;
  }
  
  // Clear CV form
  function clearCVForm() {
    getElementById('cvName').value = '';
    getElementById('cvEmail').value = '';
    getElementById('cvPhone').value = '';
    getElementById('cvLocation').value = '';
    getElementById('cvLinkedin').value = '';
    getElementById('cvWebsite').value = '';
    getElementById('cvSummary').value = '';
    
    const cvPreview = document.getElementById('cvPreview');
    if (cvPreview) {
      cvPreview.innerHTML = '';
      cvPreview.style.display = 'none';
    }
  }
  
  // Print CV
  function printCV() {
    const cvContent = document.getElementById('cvPreview');
    if (!cvContent || !cvContent.innerHTML.trim()) {
      showMessage('Please generate a CV template first', 'error');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>CV - Print</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 40px; 
              line-height: 1.6; 
              color: #333;
            }
            .cv-header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 25px; 
            }
            .cv-name { 
              font-size: 2.5em; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .cv-contact { margin: 5px 0; }
            .cv-section { margin: 25px 0; }
            .cv-section-title { 
              font-size: 1.4em; 
              font-weight: bold; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
            }
            button { display: none; }
            a { color: #007bff; text-decoration: none; }
          </style>
        </head>
        <body>${cvContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  }
  
  // Copy CV content
  function copyCV() {
    const cvContent = document.getElementById('cvPreview');
    if (!cvContent || !cvContent.innerHTML.trim()) {
      showMessage('Please generate a CV template first', 'error');
      return;
    }
    
    try {
      const tempElement = document.createElement('textarea');
      tempElement.value = cvContent.innerText;
      document.body.appendChild(tempElement);
      tempElement.select();
      document.execCommand('copy');
      document.body.removeChild(tempElement);
      
      showMessage('📋 CV content copied to clipboard!', 'success');
    } catch (error) {
      console.error('❌ Error copying CV:', error);
      showMessage('Error copying CV. Please try again.', 'error');
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    const fileInput = document.getElementById('resumeFile');
    if (fileInput) {
      fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const fileName = this.files[0].name;
          const fileSize = formatFileSize(this.files[0].size);
          console.log(`📄 File selected: ${fileName} (${fileSize})`);
          showMessage(`File selected: ${fileName} (${fileSize})`, 'info');
        }
      });
    }
  }
  
  // Utility functions
  function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`⚠️ Element not found: ${id}`);
      return { value: '', files: [] }; // Return mock element to prevent errors
    }
    return element;
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function showMessage(message, type = 'info') {
    if (typeof window.showMessage === 'function') {
      window.showMessage(message, type);
      return;
    }
    
    // Fallback message display
    console.log(`${type.toUpperCase()}: ${message}`);
    
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const colors = {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF'
    };
    
    messageEl.style.backgroundColor = colors[type] || colors.info;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 4000);
  }
  
  // Public API
  window.Resumes = {
    initialize,
    upload: uploadResume,
    download: downloadResume,
    delete: deleteResume,
    render: renderResumes,
    load: loadResumes,
    clear: clearResumeForm,
    generateCV: generateCVTemplate,
    clearCV: clearCVForm,
    printCV: printCV,
    copyCV: copyCV,
    updateDropdown: updateResumeDropdown
  };
  
  // Legacy global functions for backward compatibility
  window.uploadResume = uploadResume;
  window.renderResumes = renderResumes;
  window.updateResumeDropdown = updateResumeDropdown;
  window.downloadResume = downloadResume;
  window.deleteResume = deleteResume;
  window.clearResumeForm = clearResumeForm;
  window.generateCVTemplate = generateCVTemplate;
  window.clearCVForm = clearCVForm;
  window.printCV = printCV;
  window.copyCV = copyCV;
  window.loadResumes = loadResumes;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('📄 Resumes module loaded successfully');
})();