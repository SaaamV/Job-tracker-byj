// resumes.js - Resume management functionality

let resumes = JSON.parse(localStorage.getItem('jobResumes') || '[]');

function uploadResume() {
    const name = document.getElementById('resumeName').value.trim();
    const type = document.getElementById('resumeType').value;
    const file = document.getElementById('resumeFile').files[0];
    const description = document.getElementById('resumeDescription').value.trim();

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
        showMessage('Please upload a PDF or Word document', 'error');
        return;
    }

    // Create resume object
    const resume = {
        id: Date.now(),
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
        resume.fileData = e.target.result;
        
        // Save to storage
        resumes.push(resume);
        localStorage.setItem('jobResumes', JSON.stringify(resumes));
        
        // Update UI
        renderResumes();
        updateResumeDropdown();
        clearResumeForm();
        showMessage('Resume uploaded successfully!', 'success');
    };

    reader.onerror = function() {
        showMessage('Error reading file. Please try again.', 'error');
    };

    reader.readAsDataURL(file);
}

function renderResumes() {
    const resumesList = document.getElementById('resumesList');
    resumesList.innerHTML = '';

    if (resumes.length === 0) {
        resumesList.innerHTML = '<p>No resumes uploaded yet. Upload your first resume above.</p>';
        return;
    }

    resumes.forEach(resume => {
        const card = document.createElement('div');
        card.className = 'resume-card';
        card.innerHTML = `
            <div class="resume-info">
                <div>
                    <h4>${resume.name}</h4>
                    <p><strong>Type:</strong> ${resume.type}</p>
                    <p><strong>File:</strong> ${resume.fileName} (${formatFileSize(resume.fileSize)})</p>
                    <p><strong>Uploaded:</strong> ${new Date(resume.uploadDate).toLocaleDateString()}</p>
                    ${resume.description ? `<p><strong>Description:</strong> ${resume.description}</p>` : ''}
                </div>
                <div class="resume-actions">
                    <button class="btn" onclick="downloadResume(${resume.id})">Download</button>
                    <button class="btn btn-warning" onclick="editResume(${resume.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteResume(${resume.id})">Delete</button>
                </div>
            </div>
        `;
        resumesList.appendChild(card);
    });
}

function updateResumeDropdown() {
    const dropdown = document.getElementById('resumeVersion');
    
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Select Resume</option>';
    
    // Add resumes to dropdown
    resumes.forEach(resume => {
        const option = document.createElement('option');
        option.value = resume.name;
        option.textContent = resume.name;
        dropdown.appendChild(option);
    });
}

function downloadResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) return;

    // Create download link
    const link = document.createElement('a');
    link.href = resume.fileData;
    link.download = resume.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function editResume(id) {
    const resume = resumes.find(r => r.id === id);
    if (!resume) return;

    // Populate form with resume data
    document.getElementById('resumeName').value = resume.name;
    document.getElementById('resumeType').value = resume.type;
    document.getElementById('resumeDescription').value = resume.description || '';
    
    // Remove the resume from array (will be re-added when form is submitted)
    resumes = resumes.filter(r => r.id !== id);
    localStorage.setItem('jobResumes', JSON.stringify(resumes));
    
    renderResumes();
    updateResumeDropdown();
    showMessage('Resume loaded for editing. Upload the file again to save changes.', 'info');
}

function deleteResume(id) {
    if (confirm('Are you sure you want to delete this resume?')) {
        resumes = resumes.filter(r => r.id !== id);
        localStorage.setItem('jobResumes', JSON.stringify(resumes));
        renderResumes();
        updateResumeDropdown();
        showMessage('Resume deleted successfully!', 'success');
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

// CV Template Generator
function generateCVTemplate() {
    const cvData = {
        name: document.getElementById('cvName').value.trim(),
        email: document.getElementById('cvEmail').value.trim(),
        phone: document.getElementById('cvPhone').value.trim(),
        location: document.getElementById('cvLocation').value.trim(),
        linkedin: document.getElementById('cvLinkedin').value.trim(),
        website: document.getElementById('cvWebsite').value.trim(),
        summary: document.getElementById('cvSummary').value.trim()
    };

    if (!cvData.name || !cvData.email) {
        showMessage('Please fill in at least name and email', 'error');
        return;
    }

    const cvHtml = generateCVHTML(cvData);
    document.getElementById('cvPreview').innerHTML = cvHtml;
    showMessage('CV template generated! You can copy the content or print/save as PDF.', 'success');
}

function generateCVHTML(data) {
    return `
        <div class="cv-header">
            <div class="cv-name">${data.name}</div>
            <div class="cv-contact">${data.email}</div>
            ${data.phone ? `<div class="cv-contact">${data.phone}</div>` : ''}
            ${data.location ? `<div class="cv-contact">${data.location}</div>` : ''}
            ${data.linkedin ? `<div class="cv-contact">${data.linkedin}</div>` : ''}
            ${data.website ? `<div class="cv-contact">${data.website}</div>` : ''}
        </div>
        
        ${data.summary ? `
            <div class="cv-section">
                <div class="cv-section-title">PROFESSIONAL SUMMARY</div>
                <p>${data.summary}</p>
            </div>
        ` : ''}
        
        <div class="cv-section">
            <div class="cv-section-title">EXPERIENCE</div>
            <p><em>Add your work experience here...</em></p>
        </div>
        
        <div class="cv-section">
            <div class="cv-section-title">EDUCATION</div>
            <p><em>Add your education details here...</em></p>
        </div>
        
        <div class="cv-section">
            <div class="cv-section-title">SKILLS</div>
            <p><em>List your key skills here...</em></p>
        </div>
        
        <div class="cv-section">
            <div class="cv-section-title">PROJECTS</div>
            <p><em>Describe your relevant projects here...</em></p>
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
    document.getElementById('cvPreview').innerHTML = '';
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
                </style>
            </head>
            <body>${cvContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Initialize resume functionality
function initializeResumes() {
    renderResumes();
    updateResumeDropdown();
}

// Utility function for showing messages
function showMessage(message, type = 'info') {
    // Create or update message element
    let messageEl = document.getElementById('message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        document.body.insertBefore(messageEl, document.body.firstChild);
    }
    
    messageEl.className = `${type}-message`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}