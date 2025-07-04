// Common utilities module - Shared functions across the application

(function() {
  'use strict';
  
  const Utils = {
    // Message display functions
    showMessage(message, type = 'info', duration = 4000) {
      const messageEl = document.getElementById('message') || this.createMessageElement();
      
      messageEl.textContent = message;
      messageEl.className = `message ${type}`;
      messageEl.style.display = 'block';
      
      // Auto-hide after duration
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, duration);
    },

    showSuccessMessage(message, duration = 4000) {
      this.showMessage(message, 'success', duration);
    },

    showErrorMessage(message, duration = 6000) {
      this.showMessage(message, 'error', duration);
    },

    showWarningMessage(message, duration = 5000) {
      this.showMessage(message, 'warning', duration);
    },

    showInfoMessage(message, duration = 4000) {
      this.showMessage(message, 'info', duration);
    },

    createMessageElement() {
      let messageEl = document.getElementById('message');
      if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        messageEl.className = 'message';
        messageEl.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          z-index: 10000;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          display: none;
        `;
        document.body.appendChild(messageEl);
      }
      return messageEl;
    },

    // Date utilities
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatDateTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    getDaysAgo(date) {
      if (!date) return 0;
      const now = new Date();
      const past = new Date(date);
      const diffTime = Math.abs(now - past);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },

    // Validation utilities
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validateURL(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },

    validateRequired(value) {
      return value && value.toString().trim().length > 0;
    },

    // String utilities
    truncateText(text, maxLength = 100) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    capitalizeFirst(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    sanitizeString(str) {
      if (!str) return '';
      return str.replace(/[<>\"'&]/g, '');
    },

    // Array utilities
    sortByDate(array, dateField = 'dateAdded', ascending = false) {
      return array.sort((a, b) => {
        const dateA = new Date(a[dateField] || 0);
        const dateB = new Date(b[dateField] || 0);
        return ascending ? dateA - dateB : dateB - dateA;
      });
    },

    filterBySearchTerm(array, searchTerm, fields = []) {
      if (!searchTerm) return array;
      const term = searchTerm.toLowerCase();
      
      return array.filter(item => 
        fields.some(field => 
          item[field] && item[field].toString().toLowerCase().includes(term)
        )
      );
    },

    // DOM utilities
    createElement(tag, className = '', attributes = {}) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
      
      return element;
    },

    clearElement(element) {
      if (element) {
        element.innerHTML = '';
      }
    },

    toggleElementVisibility(element, show = null) {
      if (!element) return;
      
      if (show === null) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
      } else {
        element.style.display = show ? 'block' : 'none';
      }
    },

    // Loading states
    showLoadingState(element, message = 'Loading...') {
      if (!element) return;
      
      element.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>${message}</p>
        </div>
      `;
    },

    hideLoadingState(element) {
      if (!element) return;
      
      const loadingState = element.querySelector('.loading-state');
      if (loadingState) {
        loadingState.remove();
      }
    },

    // Local storage utilities
    saveToLocalStorage(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
      }
    },

    loadFromLocalStorage(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
      }
    },

    removeFromLocalStorage(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
      }
    },

    // Generate unique ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce(func, wait, immediate = false) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          timeout = null;
          if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
      };
    },

    // Throttle function
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // Global exports for backward compatibility
  window.showMessage = Utils.showMessage.bind(Utils);
  window.showSuccessMessage = Utils.showSuccessMessage.bind(Utils);
  window.showErrorMessage = Utils.showErrorMessage.bind(Utils);
  window.showWarningMessage = Utils.showWarningMessage.bind(Utils);
  window.showInfoMessage = Utils.showInfoMessage.bind(Utils);
  
  // Export the full Utils object
  window.Utils = Utils;
  
  console.log('🔧 Utils module loaded');
})();