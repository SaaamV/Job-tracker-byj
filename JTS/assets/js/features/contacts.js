// Contacts Feature Module - Cloud-Only MongoDB Integration
// Manages professional contacts with MongoDB cloud database

(function() {
  'use strict';
  
  console.log('👥 Loading Contacts Module (Cloud-Only)...');
  
  // Module state
  let contacts = [];
  let isInitialized = false;
  
  // Initialize the module
  async function initialize() {
    if (isInitialized) {
      console.log('✅ Contacts module already initialized');
      return;
    }
    
    try {
      await loadContacts();
      setupEventListeners();
      
      isInitialized = true;
      console.log(`👥 Contacts module initialized with ${contacts.length} contacts`);
    } catch (error) {
      console.error('❌ Failed to initialize contacts module:', error);
      showErrorMessage('Failed to load contacts. Please check your connection.');
    }
  }
  
  // Load contacts from cloud API
  async function loadContacts() {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      contacts = await window.apiService.getContacts();
      
      // Update global reference for backward compatibility
      window.contacts = contacts;
      window.jobTracker.contacts = contacts;
      
      renderContacts();
      
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      contacts = [];
      window.contacts = [];
      window.jobTracker.contacts = [];
      throw error;
    }
  }
  
  // Add new contact
  async function addContact(contactData) {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      // Validate required fields
      if (!contactData.name) {
        throw new Error('Contact name is required');
      }
      
      const savedContact = await window.apiService.saveContact(contactData);
      
      // Add to local state
      contacts.push(savedContact);
      window.contacts = contacts;
      window.jobTracker.contacts = contacts;
      
      // Update UI
      renderContacts();
      
      return savedContact;
      
    } catch (error) {
      console.error('❌ Error adding contact:', error);
      throw error;
    }
  }
  
  // Update existing contact
  async function updateContact(id, contactData) {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      const updatedContact = await window.apiService.updateContact(id, contactData);
      
      // Update local state
      const index = contacts.findIndex(contact => contact._id === id);
      if (index !== -1) {
        contacts[index] = { ...contacts[index], ...updatedContact };
        window.contacts = contacts;
        window.jobTracker.contacts = contacts;
      }
      
      // Update UI
      renderContacts();
      
      return updatedContact;
      
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      throw error;
    }
  }
  
  // Delete contact
  async function deleteContact(id) {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      await window.apiService.deleteContact(id);
      
      // Remove from local state
      contacts = contacts.filter(contact => contact._id !== id);
      window.contacts = contacts;
      window.jobTracker.contacts = contacts;
      
      // Update UI
      renderContacts();
      
    } catch (error) {
      console.error('❌ Error deleting contact:', error);
      throw error;
    }
  }
  
  // Filter contacts based on criteria
  function filterContacts() {
    const companyFilter = document.getElementById('contactCompanyFilter')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('contactStatusFilter')?.value || '';
    const relationshipFilter = document.getElementById('relationshipFilter')?.value || '';
    
    let filteredContacts = [...contacts];
    
    // Apply company filter
    if (companyFilter) {
      filteredContacts = filteredContacts.filter(contact => 
        contact.company && contact.company.toLowerCase().includes(companyFilter)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filteredContacts = filteredContacts.filter(contact => contact.contactStatus === statusFilter);
    }
    
    // Apply relationship filter
    if (relationshipFilter) {
      filteredContacts = filteredContacts.filter(contact => contact.relationship === relationshipFilter);
    }
    
    renderContactsList(filteredContacts);
  }
  
  // Render contacts list
  function renderContacts() {
    renderContactsList(contacts);
  }
  
  // Render contacts list with given data
  function renderContactsList(contactData) {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    contactsList.innerHTML = '';
    
    if (contactData.length === 0) {
      contactsList.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
          <h3>No contacts match your filters</h3>
          <p>Try adjusting your search criteria to find contacts.</p>
        </div>
      `;
      return;
    }
    
    contactData.forEach((contact, index) => {
      const contactCard = document.createElement('div');
      contactCard.className = 'contact-card';
      
      contactCard.innerHTML = `
        <h4>${escapeHtml(contact.name)}</h4>
        ${contact.company ? `<p><strong>Company:</strong> ${escapeHtml(contact.company)}</p>` : ''}
        ${contact.position ? `<p><strong>Position:</strong> ${escapeHtml(contact.position)}</p>` : ''}
        ${contact.email ? `<p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>` : ''}
        ${contact.phone ? `<p><strong>Phone:</strong> <a href="tel:${contact.phone}">${contact.phone}</a></p>` : ''}
        ${contact.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${contact.linkedinUrl}" target="_blank">View Profile</a></p>` : ''}
        <p><strong>Relationship:</strong> ${contact.relationship}</p>
        <p><strong>Status:</strong> <span class="status-badge">${contact.contactStatus}</span></p>
        ${contact.tags ? `<p><strong>Tags:</strong> ${escapeHtml(contact.tags)}</p>` : ''}
        ${contact.notes ? `<p><strong>Notes:</strong> ${escapeHtml(contact.notes)}</p>` : ''}
        
        <div class="contact-actions">
          <button class="btn btn-sm" onclick="window.ContactsModule.editContact('${contact._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="window.ContactsModule.confirmDeleteContact('${contact._id}')">Delete</button>
          ${contact.email ? `<button class="btn btn-sm btn-primary" onclick="window.ContactsModule.composeEmail('${contact.email}', '${contact.name}')">Email</button>` : ''}
        </div>
      `;
      
      contactsList.appendChild(contactCard);
    });
  }
  
  // Edit contact
  function editContact(id) {
    const contact = contacts.find(c => c._id === id);
    if (!contact) {
      console.error('Contact not found:', id);
      return;
    }
    
    // Populate form with contact data
    document.getElementById('contactName').value = contact.name || '';
    document.getElementById('contactCompany').value = contact.company || '';
    document.getElementById('contactPosition').value = contact.position || '';
    document.getElementById('contactEmail').value = contact.email || '';
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactLinkedin').value = contact.linkedinUrl || '';
    document.getElementById('contactRelationship').value = contact.relationship || '';
    document.getElementById('contactStatus').value = contact.contactStatus || '';
    document.getElementById('contactTags').value = contact.tags || '';
    document.getElementById('contactNotes').value = contact.notes || '';
    
    // Store the ID for updating
    document.getElementById('editingContactId').value = id;
    
    // Change the add button to update button
    const addButton = document.querySelector('#contacts .btn-primary');
    if (addButton) {
      addButton.textContent = 'Update Contact';
      addButton.onclick = () => window.ContactsModule.updateContactFromForm();
    }
  }
  
  // Update contact from form
  async function updateContactFromForm() {
    const id = document.getElementById('editingContactId').value;
    if (!id) {
      console.error('No contact ID found for updating');
      return;
    }
    
    const contactData = {
      name: document.getElementById('contactName').value.trim(),
      company: document.getElementById('contactCompany').value.trim(),
      position: document.getElementById('contactPosition').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      linkedinUrl: document.getElementById('contactLinkedin').value.trim(),
      relationship: document.getElementById('contactRelationship').value,
      contactStatus: document.getElementById('contactStatus').value,
      tags: document.getElementById('contactTags').value.trim(),
      notes: document.getElementById('contactNotes').value.trim()
    };
    
    try {
      await updateContact(id, contactData);
      showSuccessMessage('Contact updated successfully!');
      clearContactForm();
    } catch (error) {
      showErrorMessage('Failed to update contact: ' + error.message);
    }
  }
  
  // Confirm delete contact
  function confirmDeleteContact(id) {
    const contact = contacts.find(c => c._id === id);
    if (!contact) {
      console.error('Contact not found:', id);
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      deleteContactById(id);
    }
  }
  
  // Delete contact by ID
  async function deleteContactById(id) {
    try {
      await deleteContact(id);
      showSuccessMessage('Contact deleted successfully!');
    } catch (error) {
      showErrorMessage('Failed to delete contact: ' + error.message);
    }
  }
  
  // Clear contact form
  function clearContactForm() {
    const editingIdField = document.getElementById('editingContactId');
    if (editingIdField) {
      editingIdField.value = '';
    }
    
    // Reset form fields safely
    const inputs = document.querySelectorAll('#contacts input, #contacts select, #contacts textarea');
    inputs.forEach(input => {
      if (input && input.id) {
        if (input.id === 'contactRelationship') {
          input.value = 'Potential Referral';
        } else if (input.id === 'contactStatus') {
          input.value = 'Not Contacted';
        } else {
          input.value = '';
        }
      }
    });
    
    // Reset button to add mode
    const addButton = document.querySelector('#contacts .btn-success');
    if (addButton) {
      addButton.textContent = 'Add Contact';
      addButton.onclick = () => window.addContact();
    }
  }
  
  // Compose email to contact
  function composeEmail(email, name) {
    const subject = encodeURIComponent(`Following up - ${name}`);
    const body = encodeURIComponent(`Hi ${name},\\n\\nI hope this email finds you well.\\n\\nBest regards`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Add hidden field for editing contact ID
    if (!document.getElementById('editingContactId')) {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.id = 'editingContactId';
      hiddenInput.value = '';
      
      // Find the contacts form section and append to it
      const contactsSection = document.getElementById('contacts');
      if (contactsSection) {
        const formSection = contactsSection.querySelector('.form-section');
        if (formSection) {
          formSection.appendChild(hiddenInput);
        }
      }
    }
  }
  
  // Utility functions
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
  window.ContactsModule = {
    initialize,
    loadContacts,
    addContact,
    updateContact,
    deleteContact,
    editContact,
    confirmDeleteContact,
    updateContactFromForm,
    clearContactForm,
    composeEmail,
    renderContacts,
    filterContacts
  };
  
  // Global wrapper function for form submission
  async function addContactFromForm() {
    const contactData = {
      name: document.getElementById('contactName').value.trim(),
      company: document.getElementById('contactCompany').value.trim(),
      position: document.getElementById('contactPosition').value.trim(),
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      linkedinUrl: document.getElementById('contactLinkedin').value.trim(),
      relationship: document.getElementById('contactRelationship').value,
      contactStatus: document.getElementById('contactStatus').value,
      lastContactDate: document.getElementById('lastContactDate').value,
      nextFollowUpDate: document.getElementById('nextFollowUpDate').value,
      tags: document.getElementById('contactTags').value.trim(),
      notes: document.getElementById('contactNotes').value.trim()
    };
    
    try {
      await addContact(contactData);
      showSuccessMessage('Contact added successfully!');
      clearContactForm();
    } catch (error) {
      showErrorMessage('Failed to add contact: ' + error.message);
    }
  }
  
  // Export global functions for backward compatibility
  window.addContact = addContactFromForm;
  window.editContact = editContact;
  window.deleteContact = (id) => confirmDeleteContact(id);
  window.renderContacts = renderContacts;
  window.clearContactForm = clearContactForm;
  window.filterContacts = filterContacts;
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('👥 Contacts module loaded successfully (Cloud-Only)');
  
})();

// All API calls now routed to microservices via APIService
// Example: window.apiService.getContacts() -> http://localhost:4002/api/contacts
// Example: window.apiService.saveContact() -> http://localhost:4002/api/contacts