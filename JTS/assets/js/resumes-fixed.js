// resumes-fixed.js - Fixed resume management functionality

let resumes = [];

function loadResumes() {
    try {
        resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
        console.log('Loaded resumes:', resumes.length);
    } catch (error) {
        console.error('Error loading resumes:', error);
        resumes = [];
    }
}

function uploadResume() {
    console.log('uploadResume() called');
    
    const name = document.getElementById('resumeName').value.trim();
    const type = document.getElementById('resumeType').value;
    const file = document.getElementById('resumeFile').files[0];
    const description = document.getElementById('resumeDescription').value.trim();

    console.log('Resume upload data:', { name, type, fileSelected: !!file, description });

    if (!name) {
        showMessage('Please enter a resume name', 'error');
        return;
    }

    if (!file) {
        showMessage('Please select a resume file', 'error');
        return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
        showMessage('Please upload a PDF or Word document (.pdf, .doc, .docx)', 'error');
        return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showMessage('File size must be less than 10MB', 'error');
        return;
    }

    showMessage('Uploading resume...', 'info');

    // Create resume object
    const resume = {
        id: Date.now() + Math.random(),
        name: name,
        type: type,
        description: description,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        fileData: null // We'll store as base64
    };

    // Read file as base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            resume.fileData = e.target.result;
            
            // Load existing resumes
            let currentResumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');
            
            // Add new resume
            currentResumes.push(resume);
            
            // Save to storage
            localStorage.setItem('jobResumes', JSON.stringify(currentResumes));
            resumes = currentResumes;
            window.resumes = currentResumes;
            
            // Update UI
            renderResumes();
            updateResumeDropdown();
            clearResumeForm();
            
            showMessage('Resume uploaded successfully!', 'success');
            console.log('Resume uploaded successfully:', resume.name);
            
        } catch (error) {
            console.error('Error saving resume:', error);
            showMessage('Error saving resume. Please try again.', 'error');
        }
    };

    reader.onerror = function() {
        console.error('Error reading file');
        showMessage('Error reading file. Please try again.', 'error');
    };

    reader.readAsDataURL(file);
}

function renderResumes() {
    const resumesList = document.getElementById('resumesList');
    if (!resumesList) {
        console.error('resumesList element not found');
        return;
    }
    
    resumesList.innerHTML = '';

    if (resumes.length === 0) {
        resumesList.innerHTML = '<p>No resumes uploaded yet. Upload your first resume above.</p>';
        return;
    }

    resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'resume-card';
        card.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin: 10px 0;
            background: #f9f9f9;
        `;
        
        card.innerHTML = `
            <div class="resume-info" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">${resume.name}</h4>
                    <p style="margin: 4px 0; color: #666;"><strong>Type:</strong> ${resume.type}</p>
                    <p style="margin: 4px 0; color: #666;"><strong>File:</strong> ${resume.fileName} (${formatFileSize(resume.fileSize)})</p>
                    <p style="margin: 4px 0; color: #666;"><strong>Uploaded:</strong> ${new Date(resume.uploadDate).toLocaleDateString()}</p>
                    ${resume.description ? `<p style="margin: 4px 0; color: #666;"><strong>Description:</strong> ${resume.description}</p>` : ''}
                </div>
                <div class="resume-actions" style="display: flex; gap: 8px; flex-direction: column;">
                    <button class="btn" onclick="downloadResume(${resume.id})" style="padding: 6px 12px; border: 1px solid #007bff; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">Download</button>
                    <button class="btn btn-warning" onclick="editResume(${resume.id})" style="padding: 6px 12px; border: 1px solid #ffc107; background: #ffc107; color: black; border-radius: 4px; cursor: pointer;">Edit</button>
                    <button class="btn btn-danger" onclick="deleteResume(${resume.id})" style="padding: 6px 12px; border: 1px solid #dc3545; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
        resumesList.appendChild(card);
    });
    
    console.log('Rendered resumes:', resumes.length);
}

function updateResumeDropdown() {
    const dropdown = document.getElementById('resumeVersion');
    if (!dropdown) {
        console.error('resumeVersion dropdown not found');
        return;
    }
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select Resume</option>';
    
    // Add resumes to dropdown
    resumes.forEach(resume => {
        const option = document.createElement('option');
        option.value = resume.name;
        option.textContent = resume.name;
        dropdown.appendChild(option);
    });
    
    console.log('Updated resume dropdown with', resumes.length, 'resumes');
}

function downloadResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) {
        showMessage('Resume not found', 'error');
        return;
    }

    try {
        // Create download link
        const link = document.createElement('a');
        link.href = resume.fileData;
        link.download = resume.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('Resume downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading resume:', error);
        showMessage('Error downloading resume. Please try again.', 'error');
    }
}

function editResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) {
        showMessage('Resume not found', 'error');
        return;
    }

    // Populate form with resume data
    document.getElementById('resumeName').value = resume.name;
    document.getElementById('resumeType').value = resume.type;
    document.getElementById('resumeDescription').value = resume.description || '';
    
    // Remove the resume from array (will be re-added when form is submitted)
    resumes = resumes.filter(r => r.id !== id);
    localStorage.setItem('jobResumes', JSON.stringify(resumes));
    window.resumes = resumes;
    
    renderResumes();
    updateResumeDropdown();
    showMessage('Resume loaded for editing. Upload the file again to save changes.', 'info');
}

function deleteResume(id) {
    if (confirm('Are you sure you want to delete this resume?')) {
        try {
            resumes = resumes.filter(r => r.id !== id);
            localStorage.setItem('jobResumes', JSON.stringify(resumes));
            window.resumes = resumes;
            
            renderResumes();
            updateResumeDropdown();
            showMessage('Resume deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting resume:', error);
            showMessage('Error deleting resume. Please try again.', 'error');
        }
    }
}

function clearResumeForm() {
    document.getElementById('resumeName').value = '';
    document.getElementById('resumeType').value = 'General';
    document.getElementById('resumeDescription').value = '';
    document.getElementById('resumeFile').value = '';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// CV Template Generator - FIXED
function generateCVTemplate() {
    console.log('generateCVTemplate() called');
    
    const cvData = {
        name: document.getElementById('cvName').value.trim(),
        email: document.getElementById('cvEmail').value.trim(),
        phone: document.getElementById('cvPhone').value.trim(),
        location: document.getElementById('cvLocation').value.trim(),
        linkedin: document.getElementById('cvLinkedin').value.trim(),
        website: document.getElementById('cvWebsite').value.trim(),
        summary: document.getElementById('cvSummary').value.trim()
    };

    console.log('CV Data:', cvData);

    if (!cvData.name || !cvData.email) {
        showMessage('Please fill in at least name and email', 'error');
        return;
    }

    try {
        const cvHtml = generateCVHTML(cvData);
        const cvPreview = document.getElementById('cvPreview');
        
        if (!cvPreview) {
            console.error('cvPreview element not found');
            showMessage('CV preview area not found', 'error');
            return;
        }
        
        cvPreview.innerHTML = cvHtml;
        cvPreview.style.display = 'block';
        
        showMessage('CV template generated successfully! You can copy the content or print/save as PDF.', 'success');
        console.log('CV template generated successfully');
        
    } catch (error) {
        console.error('Error generating CV template:', error);
        showMessage('Error generating CV template. Please try again.', 'error');
    }
}

function generateCVHTML(data) {
    return `
        <div class="cv-container" style="max-width: 800px; margin: 20px auto; padding: 40px; background: white; border: 1px solid #ddd; border-radius: 8px; font-family: 'Times New Roman', serif; line-height: 1.6;">
            <div class="cv-header" style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 25px;">
                <div class="cv-name" style="font-size: 2.5em; font-weight: bold; margin-bottom: 10px; color: #333;">${data.name}</div>
                <div class="cv-contact" style="margin: 5px 0; color: #666;">${data.email}</div>
                ${data.phone ? `<div class="cv-contact" style="margin: 5px 0; color: #666;">${data.phone}</div>` : ''}
                ${data.location ? `<div class="cv-contact" style="margin: 5px 0; color: #666;">${data.location}</div>` : ''}
                ${data.linkedin ? `<div class="cv-contact" style="margin: 5px 0; color: #666;"><a href="${data.linkedin}" target="_blank">${data.linkedin}</a></div>` : ''}
                ${data.website ? `<div class="cv-contact" style="margin: 5px 0; color: #666;"><a href="${data.website}" target="_blank">${data.website}</a></div>` : ''}
            </div>
            
            ${data.summary ? `
                <div class="cv-section" style="margin: 25px 0;">
                    <div class="cv-section-title" style="font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #333;">PROFESSIONAL SUMMARY</div>
                    <p style="margin: 0; color: #555;">${data.summary}</p>
                </div>
            ` : ''}
            
            <div class="cv-section" style="margin: 25px 0;">
                <div class="cv-section-title" style="font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #333;">EXPERIENCE</div>
                <p style="margin: 0; color: #777; font-style: italic;">Add your work experience here...</p>
                <div style="margin: 15px 0;">
                    <strong>Job Title</strong> - Company Name (Start Date - End Date)<br>
                    • Key achievement or responsibility<br>
                    • Another achievement or responsibility<br>
                    • Quantified result or impact
                </div>
            </div>
            
            <div class="cv-section" style="margin: 25px 0;">
                <div class="cv-section-title" style="font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #333;">EDUCATION</div>
                <p style="margin: 0; color: #777; font-style: italic;">Add your education details here...</p>
                <div style="margin: 15px 0;">
                    <strong>Degree</strong> - Institution Name (Graduation Date)<br>
                    • Relevant coursework, honors, or achievements
                </div>
            </div>
            
            <div class="cv-section" style="margin: 25px 0;">
                <div class="cv-section-title" style="font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #333;">SKILLS</div>
                <p style="margin: 0; color: #777; font-style: italic;">List your key skills here...</p>
                <div style="margin: 15px 0;">
                    <strong>Technical Skills:</strong> List relevant technical skills<br>
                    <strong>Software:</strong> List software proficiencies<br>
                    <strong>Languages:</strong> List programming or spoken languages
                </div>
            </div>
            
            <div class="cv-section" style="margin: 25px 0;">
                <div class="cv-section-title" style="font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #333;">PROJECTS</div>
                <p style="margin: 0; color: #777; font-style: italic;">Describe your relevant projects here...</p>
                <div style="margin: 15px 0;">
                    <strong>Project Name</strong> - Brief Description<br>
                    • Technologies used<br>
                    • Key features or achievements<br>
                    • Results or impact
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                <button onclick="printCV()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Print CV</button>
                <button onclick="copyCV()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Copy CV</button>
            </div>
        </div>
    `;
}

function clearCVForm() {
    document.getElementById('cvName').value = '';
    document.getElementById('cvEmail').value = '';
    document.getElementById('cvPhone').value = '';
    document.getElementById('cvLocation').value = '';
    document.getElementById('cvLinkedin').value = '';
    document.getElementById('cvWebsite').value = '';
    document.getElementById('cvSummary').value = '';
    
    const cvPreview = document.getElementById('cvPreview');
    if (cvPreview) {
        cvPreview.innerHTML = '';
        cvPreview.style.display = 'none';
    }
}

function printCV() {
    const cvContent = document.getElementById('cvPreview').innerHTML;
    if (!cvContent) {
        showMessage('Please generate a CV template first', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>CV - Print</title>
                <style>
                    body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
                    .cv-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 25px; }
                    .cv-name { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
                    .cv-contact { margin: 5px 0; }
                    .cv-section { margin: 25px 0; }
                    .cv-section-title { font-size: 1.4em; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
                    button { display: none; }
                </style>
            </head>
            <body>${cvContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function copyCV() {
    const cvContent = document.getElementById('cvPreview');
    if (!cvContent) {
        showMessage('Please generate a CV template first', 'error');
        return;
    }
    
    // Create a temporary textarea with the CV text content
    const tempElement = document.createElement('textarea');
    tempElement.value = cvContent.innerText;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);
    
    showMessage('CV content copied to clipboard!', 'success');
}

// Message function
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

// Initialize resume functionality
function initializeResumes() {
    console.log('Initializing resumes module...');
    
    loadResumes();
    renderResumes();
    updateResumeDropdown();
    
    // Add event listeners for file input
    const fileInput = document.getElementById('resumeFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const fileName = this.files[0].name;
                const fileSize = formatFileSize(this.files[0].size);
                console.log('File selected:', fileName, fileSize);
                showMessage(`File selected: ${fileName} (${fileSize})`, 'info');
            }
        });
    }
    
    console.log('Resumes module initialized. Total resumes:', resumes.length);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing resumes...');
    initializeResumes();
    
    // Ensure buttons are properly connected
    const uploadBtn = document.querySelector('button[onclick="uploadResume()"]');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            uploadResume();
        });
    }
    
    const generateBtn = document.querySelector('button[onclick="generateCVTemplate()"]');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateCVTemplate();
        });
    }
    
    const clearCVBtn = document.querySelector('button[onclick="clearCVForm()"]');
    if (clearCVBtn) {
        clearCVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearCVForm();
        });
    }
});

// Make functions globally available
window.uploadResume = uploadResume;
window.renderResumes = renderResumes;
window.updateResumeDropdown = updateResumeDropdown;
window.downloadResume = downloadResume;
window.editResume = editResume;
window.deleteResume = deleteResume;
window.clearResumeForm = clearResumeForm;
window.generateCVTemplate = generateCVTemplate;
window.clearCVForm = clearCVForm;
window.printCV = printCV;
window.copyCV = copyCV;