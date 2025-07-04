// templates.js - Email template functionality

const emailTemplates = {
    'cold-outreach': {
        subject: 'Interest in [Position] at [Company]',
        body: `Dear [Contact Name],

I hope this message finds you well. My name is [Your Name], and I'm a [Your Title/Background] with [X years] of experience in [Industry/Field].

I came across your profile while researching [Company] and was impressed by [specific detail about company/their work]. I'm particularly interested in [specific role/department] and would love to learn more about opportunities at [Company].

I believe my background in [relevant skills/experience] would be valuable to your team. I've attached my resume for your review and would appreciate any insights you might have about the hiring process or the company culture.

Would you be open to a brief 15-minute conversation sometime in the next week or two? I'd be happy to work around your schedule.

Thank you for your time and consideration.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
    },
    
    'referral-request': {
        subject: 'Referral Request for [Position] at [Company]',
        body: `Hi [Contact Name],

I hope you're doing well! I wanted to reach out because I saw that [Company] has an opening for [Position], and I know you work there.

I'm really excited about this opportunity because [specific reason why you're interested]. Given my background in [relevant experience], I think I could be a strong fit for the role.

Would you be comfortable providing a referral for me? I understand that referrals are valuable, so I want to assure you that:
- I've thoroughly researched the role and company
- My skills align well with the requirements
- I'm genuinely committed to contributing to [Company]'s success

I've attached my resume for your review. If you're willing to refer me, I can provide any additional information you might need.

Thank you so much for considering this, and please let me know if you have any questions!

Best regards,
[Your Name]`
    },
    
    'thank-you': {
        subject: 'Thank you for the interview - [Position]',
        body: `Dear [Interviewer Name],

Thank you for taking the time to speak with me today about the [Position] role at [Company]. I really enjoyed our conversation about [specific topic discussed] and learning more about [team/project/company initiative].

Our discussion reinforced my enthusiasm for the position and my desire to contribute to [specific team/goal]. I'm particularly excited about [specific aspect of the role/company] that we discussed.

If there's any additional information I can provide to help with your decision, please don't hesitate to ask. I look forward to hearing about the next steps in the process.

Thank you again for your time and consideration.

Best regards,
[Your Name]`
    },
    
    'follow-up': {
        subject: 'Following up on [Position] application',
        body: `Dear [Contact Name],

I hope you're doing well. I wanted to follow up on my application for the [Position] role at [Company], which I submitted on [Date].

I remain very interested in this opportunity and believe my background in [relevant skills/experience] would be valuable to your team. Since our last communication, I've [mention any relevant updates, new projects, or skills].

I understand that the hiring process takes time, and I don't want to be pushy. I'm simply eager to learn more about the next steps and timeline for this position.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Name]`
    },
    
    'networking': {
        subject: 'Connecting with a fellow [Industry] professional',
        body: `Hi [Contact Name],

I hope this message finds you well. My name is [Your Name], and I'm a [Your Title] with [X years] of experience in [Industry].

I came across your profile and was impressed by your work at [Company] and your background in [specific area]. I'm currently [looking for new opportunities/exploring the field/seeking advice] and would love to connect with experienced professionals like yourself.

Would you be open to a brief 15-20 minute coffee chat or video call? I'd love to learn about your career journey and get your perspective on [specific topic/industry trends].

I understand you're busy, so I'm happy to work around your schedule. Thank you for considering my request!

Best regards,
[Your Name]
[Your LinkedIn Profile]`
    },
    
    'recruiter-response': {
        subject: 'Re: [Position] opportunity',
        body: `Hi [Recruiter Name],

Thank you for reaching out about the [Position] opportunity at [Company]. I'm very interested in learning more about this role.

Based on the description you provided, this position aligns well with my background in [relevant experience] and my career goals. I'm particularly excited about [specific aspect of the role/company].

I'd be happy to schedule a call to discuss the opportunity in more detail. I'm available [mention your availability] and can be flexible with timing.

I've attached my updated resume for your review. Please let me know if you need any additional information.

Looking forward to speaking with you soon!

Best regards,
[Your Name]
[Your Phone]`
    },
    
    'application-status': {
        subject: 'Status inquiry - [Position] application',
        body: `Dear Hiring Manager,

I hope this email finds you well. I'm writing to inquire about the status of my application for the [Position] role at [Company], which I submitted on [Date].

I remain very interested in this opportunity and am excited about the possibility of contributing to [Company]'s [specific team/mission/goals]. The role aligns perfectly with my background in [relevant skills/experience] and my career aspirations.

I understand that the review process takes time, and I don't want to be intrusive. I'm simply eager to learn about any updates regarding the timeline or next steps in the process.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
    },
    
    'offer-negotiation': {
        subject: 'Re: Job offer for [Position]',
        body: `Dear [Hiring Manager/HR Name],

Thank you very much for extending the offer for the [Position] role at [Company]. I'm excited about the opportunity to join your team and contribute to [specific company goal/project].

I've carefully reviewed the offer details, and I'm very enthusiastic about the role itself. However, I'd like to discuss the compensation package to ensure it aligns with market standards and my experience level.

Based on my research and experience in [relevant field], I was hoping we could discuss [specific aspect - salary/benefits/start date]. Would you be open to a brief conversation about this?

I'm confident we can reach an agreement that works for both parties. I'm very much looking forward to joining the team and getting started.

Thank you for your understanding and consideration.

Best regards,
[Your Name]`
    }
};

let customTemplates = JSON.parse(localStorage.getItem('customEmailTemplates') || '[]');

function loadTemplate() {
    const templateType = document.getElementById('templateType').value;
    const subjectField = document.getElementById('emailSubject');
    const bodyField = document.getElementById('emailBody');
    const previewDiv = document.getElementById('templatePreview');

    if (!templateType) {
        subjectField.value = '';
        bodyField.value = '';
        previewDiv.innerHTML = 'Select a template above to see the preview.';
        return;
    }

    let template;
    if (emailTemplates[templateType]) {
        template = emailTemplates[templateType];
    } else {
        // Check custom templates
        template = customTemplates.find(t => t.id === templateType);
    }

    if (template) {
        subjectField.value = template.subject;
        bodyField.value = template.body;
        
        // Show preview
        previewDiv.innerHTML = `
            <h4>Subject:</h4>
            <p>${template.subject}</p>
            <h4>Body:</h4>
            <div style="white-space: pre-wrap; font-family: Arial, sans-serif;">${template.body}</div>
        `;
    }
}

function populateEmailContacts() {
    const contactSelect = document.getElementById('emailContact');
    contactSelect.innerHTML = '<option value="">Select a contact...</option>';
    
    contacts.forEach(contact => {
        if (contact.email) {
            const option = document.createElement('option');
            option.value = contact.id;
            option.textContent = `${contact.name} (${contact.company || 'No company'})`;
            contactSelect.appendChild(option);
        }
    });
}

function copyEmail() {
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    
    if (!subject || !body) {
        showMessage('Please enter subject and body text', 'error');
        return;
    }
    
    const emailText = `Subject: ${subject}\n\n${body}`;
    
    navigator.clipboard.writeText(emailText).then(() => {
        showMessage('Email copied to clipboard!', 'success');
    }).catch(err => {
        showMessage('Failed to copy email', 'error');
        console.error('Copy failed:', err);
    });
}

function openEmailClient() {
    const contactId = document.getElementById('emailContact').value;
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    
    let toEmail = '';
    if (contactId) {
        const contact = contacts.find(c => c.id == contactId);
        if (contact && contact.email) {
            toEmail = contact.email;
        }
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    const mailtoLink = `mailto:${toEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoLink);
}

function saveTemplate() {
    const templateName = prompt('Enter a name for this custom template:');
    if (!templateName) return;
    
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    
    if (!subject || !body) {
        showMessage('Please enter subject and body text', 'error');
        return;
    }
    
    const customTemplate = {
        id: `custom-${Date.now()}`,
        name: templateName,
        subject: subject,
        body: body,
        dateCreated: new Date().toISOString()
    };
    
    customTemplates.push(customTemplate);
    localStorage.setItem('customEmailTemplates', JSON.stringify(customTemplates));
    
    // Add to dropdown
    updateTemplateDropdown();
    
    showMessage('Template saved successfully!', 'success');
}

function updateTemplateDropdown() {
    const templateSelect = document.getElementById('templateType');
    
    // Remove existing custom options
    const customOptions = templateSelect.querySelectorAll('option[data-custom="true"]');
    customOptions.forEach(option => option.remove());
    
    // Add custom templates
    customTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (Custom)`;
        option.dataset.custom = 'true';
        templateSelect.appendChild(option);
    });
}

function deleteCustomTemplate(templateId) {
    window.showCustomConfirmDialog(
        'Delete Template',
        'Are you sure you want to delete this custom template?',
        () => {
            customTemplates = customTemplates.filter(t => t.id !== templateId);
            localStorage.setItem('customEmailTemplates', JSON.stringify(customTemplates));
            updateTemplateDropdown();
            showMessage('Custom template deleted!', 'success');
        }
    );
}

function replaceTemplatePlaceholders() {
    const contactId = document.getElementById('emailContact').value;
    let subject = document.getElementById('emailSubject').value;
    let body = document.getElementById('emailBody').value;
    
    if (contactId) {
        const contact = contacts.find(c => c.id == contactId);
        if (contact) {
            // Replace placeholders with actual contact data
            const replacements = {
                '[Contact Name]': contact.name,
                '[Company]': contact.company || '[Company]',
                '[Position]': contact.position || '[Position]'
            };
            
            Object.keys(replacements).forEach(placeholder => {
                subject = subject.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
                body = body.replace(new RegExp(placeholder, 'g'), replacements[placeholder]);
            });
            
            document.getElementById('emailSubject').value = subject;
            document.getElementById('emailBody').value = body;
        }
    }
}

function initializeTemplates() {
    populateEmailContacts();
    updateTemplateDropdown();
    
    // Add event listener for contact selection
    document.getElementById('emailContact').addEventListener('change', replaceTemplatePlaceholders);
}

// Email tracking (optional enhancement)
function trackEmailSent(contactId, subject, type) {
    const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
    
    emailLog.push({
        id: Date.now(),
        contactId: contactId,
        subject: subject,
        type: type,
        dateSent: new Date().toISOString()
    });
    
    localStorage.setItem('emailLog', JSON.stringify(emailLog));
    
    // Update contact's last contact date if applicable
    if (contactId) {
        const contactIndex = contacts.findIndex(c => c.id == contactId);
        if (contactIndex !== -1) {
            contacts[contactIndex].lastContactDate = new Date().toISOString().split('T')[0];
            contacts[contactIndex].status = 'Reached Out';
            localStorage.setItem('jobContacts', JSON.stringify(contacts));
        }
    }
}

// Bulk email functionality (for multiple contacts)
function sendBulkEmail() {
    const selectedContacts = Array.from(document.querySelectorAll('.contact-checkbox:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedContacts.length === 0) {
        showMessage('Please select at least one contact', 'error');
        return;
    }
    
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    
    if (!subject || !body) {
        showMessage('Please enter subject and body text', 'error');
        return;
    }
    
    let emailAddresses = [];
    selectedContacts.forEach(contactId => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact && contact.email) {
            emailAddresses.push(contact.email);
        }
    });
    
    if (emailAddresses.length === 0) {
        showMessage('No email addresses found for selected contacts', 'error');
        return;
    }
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    const mailtoLink = `mailto:${emailAddresses.join(',')}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoLink);
    
    // Track emails
    selectedContacts.forEach(contactId => {
        trackEmailSent(contactId, subject, 'bulk');
    });
    
    showMessage(`Email opened for ${emailAddresses.length} contacts!`, 'success');
}

// Auto-suggest functionality for common email scenarios
function getEmailSuggestions(applicationData) {
    const suggestions = [];
    
    // Suggest follow-up emails based on application status and timing
    applications.forEach(app => {
        const daysSinceApplication = Math.floor((new Date() - new Date(app.applicationDate)) / (1000 * 60 * 60 * 24));
        
        if (app.status === 'Applied' && daysSinceApplication >= 7) {
            suggestions.push({
                type: 'follow-up',
                title: `Follow up on ${app.jobTitle} at ${app.company}`,
                description: `It's been ${daysSinceApplication} days since you applied`,
                applicationId: app.id
            });
        }
        
        if (app.status === 'Interview Scheduled') {
            suggestions.push({
                type: 'thank-you',
                title: `Prepare thank you email for ${app.company}`,
                description: 'Have a thank you email ready for after your interview',
                applicationId: app.id
            });
        }
    });
    
    return suggestions;
}