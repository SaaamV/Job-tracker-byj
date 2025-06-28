// contacts.js - Enhanced contact management

function addContact() {
  const contact = {
    id: Date.now(),
    name: document.getElementById('contactName').value.trim(),
    company: document.getElementById('contactCompany').value.trim(),
    position: document.getElementById('contactPosition').value.trim(),
    linkedinUrl: document.getElementById('linkedinUrl').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    relationship: document.getElementById('relationship').value,
    status: document.getElementById('contactStatus').value,
    lastContactDate: document.getElementById('lastContactDate').value,
    nextFollowUpDate: document.getElementById('nextFollowUpDate').value,
    tags: document.getElementById('contactTags').value.trim(),
    notes: document.getElementById('contactNotes').value.trim(),
    dateAdded: new Date().toISOString()
  };

  if (!contact.name) {
    showMessage('Please enter contact name', 'error');
    return;
  }

  // Check for potential duplicates
  const duplicate = contacts.find(c => 
    c.name.toLowerCase() === contact.name.toLowerCase() &&
    c.email === contact.email
  );

  if (duplicate && contact.email) {
    if (!confirm('A contact with this name and email already exists. Do you want to add anyway?')) {
      return;
    }
  }

  contacts.push(contact);
  localStorage.setItem('jobContacts', JSON.stringify(contacts));
  
  clearContactForm();
  renderContacts();
  populateEmailContacts();
  
  showMessage('Contact added successfully!', 'success');
}

function renderContacts() {
  const contactsList = document.getElementById('contactsList');
  contactsList.innerHTML = '';

  let filteredContacts = getFilteredContacts();

  if (filteredContacts.length === 0) {
    contactsList.innerHTML = '<p>No contacts found matching your filters.</p>';
    return;
  }

  filteredContacts.forEach(contact => {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <h4>${contact.name} ${contact.position ? `- ${contact.position}` : ''}</h4>
          <p><strong>Company:</strong> ${contact.company || 'Not specified'}</p>
          <p><strong>Relationship:</strong> ${contact.relationship}</p>
          <p><strong>Status:</strong> <span class="status-${contact.status.toLowerCase().replace(' ', '-')}">${contact.status}</span></p>
          
          <div style="margin: 10px 0;">
            ${contact.linkedinUrl ? `<a href="${contact.linkedinUrl}" target="_blank" class="btn" style="margin: 2px; padding: 5px 10px; font-size: 12px;">LinkedIn</a>` : ''}
            ${contact.email ? `<a href="mailto:${contact.email}" class="btn btn-success" style="margin: 2px; padding: 5px 10px; font-size: 12px;">Email</a>` : ''}
            ${contact.phone ? `<a href="tel:${contact.phone}" class="btn" style="margin: 2px; padding: 5px 10px; font-size: 12px;">Call</a>` : ''}
          </div>
          
          ${contact.lastContactDate ? `<p><strong>Last Contact:</strong> ${formatDate(contact.lastContactDate)}</p>` : ''}
          ${contact.nextFollowUpDate ? `<p><strong>Next Follow-up:</strong> ${getFollowUpStatus(contact.nextFollowUpDate)}</p>` : ''}
          
          ${contact.tags ? `
            <div class="contact-tags">
              ${contact.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
            </div>
          ` : ''}
          
          ${contact.notes ? `<p><strong>Notes:</strong> ${contact.notes}</p>` : ''}
          <p><small>Added: ${formatDate(contact.dateAdded)}</small></p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 5px;">
          <button class="btn" onclick="editContact(${contact.id})" title="Edit Contact">✏️</button>
          <button class="btn btn-success" onclick="composeEmailToContact(${contact.id})" title="Send Email">📧</button>
          <button class="btn btn-warning" onclick="updateContactStatus(${contact.id})" title="Update Status">🔄</button>
          <button class="btn btn-danger" onclick="deleteContact(${contact.id})" title="Delete Contact">🗑️</button>
        </div>
      </div>
    `;
    contactsList.appendChild(card);
  });
}

function getFilteredContacts() {
  let filtered = [...contacts];
  
  // Filter by company
  const companyFilter = document.getElementById('contactCompanyFilter')?.value?.toLowerCase();
  if (companyFilter) {
    filtered = filtered.filter(contact => 
      (contact.company || '').toLowerCase().includes(companyFilter)
    );
  }
  
  // Filter by status
  const statusFilter = document.getElementById('contactStatusFilter')?.value;
  if (statusFilter) {
    filtered = filtered.filter(contact => contact.status === statusFilter);
  }
  
  // Filter by relationship
  const relationshipFilter = document.getElementById('relationshipFilter')?.value;
  if (relationshipFilter) {
    filtered = filtered.filter(contact => contact.relationship === relationshipFilter);
  }
  
  // Sort by most recently added
  filtered.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  
  return filtered;
}

function filterContacts() {
  renderContacts();
}

function deleteContact(id) {
  if (confirm('Are you sure you want to delete this contact?')) {
    contacts = contacts.filter(contact => contact.id !== id);
    localStorage.setItem('jobContacts', JSON.stringify(contacts));
    renderContacts();
    populateEmailContacts();
    showMessage('Contact deleted successfully!', 'success');
  }
}

// Make all contact functions globally available
window.addContact = addContact;
window.renderContacts = renderContacts;
window.filterContacts = filterContacts;
window.deleteContact = deleteContact;
window.editContact = editContact;
window.updateContactStatus = updateContactStatus;
window.composeEmailToContact = composeEmailToContact;
window.clearContactForm = clearContactForm;
window.importContacts = importContacts;
window.exportContacts = exportContacts;
window.selectAllContacts = selectAllContacts;
window.bulkUpdateContactStatus = bulkUpdateContactStatus;
window.getNetworkingSuggestions = getNetworkingSuggestions;
window.getPopularTags = getPopularTags;
window.addTagToContact = addTagToContact;

console.log('Contacts module loaded and functions exposed globally');

function editContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact) return;

  // Populate form with contact data
  document.getElementById('contactName').value = contact.name || '';
  document.getElementById('contactCompany').value = contact.company || '';
  document.getElementById('contactPosition').value = contact.position || '';
  document.getElementById('linkedinUrl').value = contact.linkedinUrl || '';
  document.getElementById('contactEmail').value = contact.email || '';
  document.getElementById('contactPhone').value = contact.phone || '';
  document.getElementById('relationship').value = contact.relationship || 'Network Contact';
  document.getElementById('contactStatus').value = contact.status || 'Not Contacted';
  document.getElementById('lastContactDate').value = contact.lastContactDate || '';
  document.getElementById('nextFollowUpDate').value = contact.nextFollowUpDate || '';
  document.getElementById('contactTags').value = contact.tags || '';
  document.getElementById('contactNotes').value = contact.notes || '';

  // Remove the contact temporarily
  contacts = contacts.filter(c => c.id !== id);
  localStorage.setItem('jobContacts', JSON.stringify(contacts));
  renderContacts();
  populateEmailContacts();
  
  // Scroll to form
  document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
  showMessage('Contact loaded for editing. Make changes and click "Add Contact" to save.', 'info');
}

function updateContactStatus(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact) return;

  const statusOptions = [
    'Not Contacted',
    'Reached Out',
    'Responded',
    'Meeting Scheduled',
    'Referred',
    'Cold Contact'
  ];

  const currentIndex = statusOptions.indexOf(contact.status);
  const nextIndex = (currentIndex + 1) % statusOptions.length;
  const newStatus = statusOptions[nextIndex];

  contact.status = newStatus;
  contact.lastContactDate = new Date().toISOString().split('T')[0];

  localStorage.setItem('jobContacts', JSON.stringify(contacts));
  renderContacts();
  showMessage(`Contact status updated to: ${newStatus}`, 'success');
}

function composeEmailToContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (!contact || !contact.email) {
    showMessage('No email address found for this contact', 'error');
    return;
  }

  // Switch to templates tab and pre-fill contact
  switchTab('templates', document.querySelector('[onclick*="templates"]'));
  
  setTimeout(() => {
    const contactSelect = document.getElementById('emailContact');
    if (contactSelect) {
      contactSelect.value = id;
      replaceTemplatePlaceholders();
    }
  }, 100);
}

function clearContactForm() {
  document.getElementById('contactName').value = '';
  document.getElementById('contactCompany').value = '';
  document.getElementById('contactPosition').value = '';
  document.getElementById('linkedinUrl').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactPhone').value = '';
  document.getElementById('relationship').value = 'Potential Referral';
  document.getElementById('contactStatus').value = 'Not Contacted';
  document.getElementById('lastContactDate').value = '';
  document.getElementById('nextFollowUpDate').value = '';
  document.getElementById('contactTags').value = '';
  document.getElementById('contactNotes').value = '';
}

// Contact insights and recommendations
function getContactInsights() {
  const insights = [];
  const today = new Date();
  
  // Check for contacts that need follow-up
  const needFollowUp = contacts.filter(contact => {
    if (!contact.nextFollowUpDate) return false;
    return new Date(contact.nextFollowUpDate) <= today;
  });
  
  if (needFollowUp.length > 0) {
    insights.push(`${needFollowUp.length} contact(s) need follow-up today or are overdue.`);
  }
  
  // Check for inactive contacts
  const inactiveContacts = contacts.filter(contact => {
    if (contact.status === 'Not Contacted') return true;
    if (!contact.lastContactDate) return false;
    
    const daysSinceContact = Math.floor(
      (today - new Date(contact.lastContactDate)) / (1000 * 60 * 60 * 24)
    );
    return daysSinceContact > 30;
  });
  
  if (inactiveContacts.length > 5) {
    insights.push(`You have ${inactiveContacts.length} contacts you haven't reached out to recently. Consider reconnecting.`);
  }
  
  // Check for networking opportunities
  const referralContacts = contacts.filter(contact => 
    contact.relationship === 'Potential Referral' && 
    contact.status === 'Not Contacted'
  );
  
  if (referralContacts.length > 0) {
    insights.push(`You have ${referralContacts.length} potential referral contacts you haven't reached out to yet.`);
  }
  
  return insights;
}

// Import contacts from LinkedIn CSV or other sources
function importContacts() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.json';
  
  input.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        let importedContacts = [];
        
        if (file.name.endsWith('.json')) {
          importedContacts = JSON.parse(e.target.result);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing (you might want to use a library like Papa Parse)
          const lines = e.target.result.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
              const contact = {
                id: Date.now() + i,
                dateAdded: new Date().toISOString(),
                relationship: 'Network Contact',
                status: 'Not Contacted'
              };
              
              headers.forEach((header, index) => {
                const normalizedHeader = header.toLowerCase();
                if (normalizedHeader.includes('name')) contact.name = values[index] || '';
                else if (normalizedHeader.includes('company')) contact.company = values[index] || '';
                else if (normalizedHeader.includes('email')) contact.email = values[index] || '';
                else if (normalizedHeader.includes('position') || normalizedHeader.includes('title')) contact.position = values[index] || '';
              });
              
              if (contact.name) importedContacts.push(contact);
            }
          }
        }
        
        if (importedContacts.length > 0) {
          // Merge with existing contacts, avoiding duplicates
          let added = 0;
          importedContacts.forEach(importedContact => {
            const exists = contacts.some(contact => 
              contact.name.toLowerCase() === importedContact.name.toLowerCase() &&
              contact.email === importedContact.email
            );
            
            if (!exists) {
              contacts.push(importedContact);
              added++;
            }
          });
          
          localStorage.setItem('jobContacts', JSON.stringify(contacts));
          renderContacts();
          populateEmailContacts();
          showMessage(`Imported ${added} new contact(s)!`, 'success');
        } else {
          showMessage('No valid contacts found in the file', 'error');
        }
        
      } catch (error) {
        console.error('Import failed:', error);
        showMessage('Failed to import contacts. Please check the file format.', 'error');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Export contacts
function exportContacts() {
  if (contacts.length === 0) {
    showMessage('No contacts to export', 'error');
    return;
  }
  
  const csvContent = convertContactsToCSV();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  showMessage('Contacts exported successfully!', 'success');
}

function convertContactsToCSV() {
  const headers = [
    'Name', 'Company', 'Position', 'Email', 'Phone', 'LinkedIn URL',
    'Relationship', 'Status', 'Last Contact Date', 'Next Follow-up Date',
    'Tags', 'Notes', 'Date Added'
  ];
  
  const rows = contacts.map(contact => [
    contact.name || '',
    contact.company || '',
    contact.position || '',
    contact.email || '',
    contact.phone || '',
    contact.linkedinUrl || '',
    contact.relationship || '',
    contact.status || '',
    contact.lastContactDate || '',
    contact.nextFollowUpDate || '',
    contact.tags || '',
    contact.notes || '',
    formatDate(contact.dateAdded)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csvContent;
}

// Bulk operations for contacts
function selectAllContacts() {
  const checkboxes = document.querySelectorAll('.contact-checkbox');
  checkboxes.forEach(cb => cb.checked = true);
}

function bulkUpdateContactStatus() {
  const selectedIds = Array.from(document.querySelectorAll('.contact-checkbox:checked'))
    .map(cb => parseInt(cb.value));
  
  if (selectedIds.length === 0) {
    showMessage('Please select contacts to update', 'error');
    return;
  }
  
  const newStatus = prompt('Enter new status for selected contacts:');
  if (!newStatus) return;
  
  let updated = 0;
  contacts.forEach(contact => {
    if (selectedIds.includes(contact.id)) {
      contact.status = newStatus;
      contact.lastContactDate = new Date().toISOString().split('T')[0];
      updated++;
    }
  });
  
  localStorage.setItem('jobContacts', JSON.stringify(contacts));
  renderContacts();
  showMessage(`Updated ${updated} contact(s)`, 'success');
}

// Contact networking suggestions
function getNetworkingSuggestions() {
  const suggestions = [];
  
  // Suggest reaching out to contacts at companies where you've applied
  const appliedCompanies = [...new Set(applications.map(app => app.company.toLowerCase()))];
  
  contacts.forEach(contact => {
    if (contact.company && appliedCompanies.includes(contact.company.toLowerCase())) {
      if (contact.status === 'Not Contacted' || contact.status === 'Cold Contact') {
        suggestions.push({
          type: 'referral_opportunity',
          contact: contact,
          reason: `You've applied to ${contact.company}. Consider reaching out for insights or referral.`
        });
      }
    }
  });
  
  // Suggest following up with contacts who responded
  const needFollowUp = contacts.filter(contact => {
    if (contact.status !== 'Responded') return false;
    if (!contact.lastContactDate) return true;
    
    const daysSince = Math.floor(
      (new Date() - new Date(contact.lastContactDate)) / (1000 * 60 * 60 * 24)
    );
    return daysSince >= 7;
  });
  
  needFollowUp.forEach(contact => {
    suggestions.push({
      type: 'follow_up',
      contact: contact,
      reason: 'Has responded to your outreach. Consider following up.'
    });
  });
  
  return suggestions;
}

// Tag management
function getPopularTags() {
  const tagCount = {};
  
  contacts.forEach(contact => {
    if (contact.tags) {
      contact.tags.split(',').forEach(tag => {
        const trimmedTag = tag.trim().toLowerCase();
        tagCount[trimmedTag] = (tagCount[trimmedTag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(tagCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);
}

function addTagToContact(contactId, tag) {
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  const currentTags = contact.tags ? contact.tags.split(',').map(t => t.trim()) : [];
  if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    contact.tags = currentTags.join(', ');
    localStorage.setItem('jobContacts', JSON.stringify(contacts));
    renderContacts();
  }
}