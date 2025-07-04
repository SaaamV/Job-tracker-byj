// Payments Feature Module - Stripe Integration
// Manages subscription plans, payments, and billing

(function() {
  'use strict';
  
  console.log('💳 Loading Payments Module...');
  
  // Module state
  let currentSubscription = null;
  let availablePlans = [];
  let paymentHistory = [];
  let usage = null;
  let isInitialized = false;
  
  // Mock user ID (in production, get from authentication)
  const currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
  
  // Initialize the module
  async function initialize() {
    if (isInitialized) {
      console.log('✅ Payments module already initialized');
      return;
    }
    
    try {
      await loadSubscriptionData();
      setupEventListeners();
      
      isInitialized = true;
      console.log('💳 Payments module initialized');
    } catch (error) {
      console.error('❌ Failed to initialize payments module:', error);
      showErrorMessage('Failed to load subscription data.');
    }
  }
  
  // Load subscription data
  async function loadSubscriptionData() {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      // Load all subscription data in parallel
      const [plansResponse, subscriptionResponse, historyResponse, usageResponse] = await Promise.all([
        window.apiService.getSubscriptionPlans(),
        window.apiService.getUserSubscription(currentUserId),
        window.apiService.getPaymentHistory(currentUserId),
        window.apiService.getUsageAnalytics(currentUserId)
      ]);
      
      availablePlans = plansResponse.plans || [];
      currentSubscription = subscriptionResponse.subscription || null;
      paymentHistory = historyResponse.payments || [];
      usage = usageResponse;
      
      // Update UI
      renderPricingPlans();
      renderSubscriptionStatus();
      renderPaymentHistory();
      renderUsageAnalytics();
      
    } catch (error) {
      console.error('❌ Error loading subscription data:', error);
      // Show free plan as fallback
      currentSubscription = {
        plan: 'free',
        status: 'active',
        features: ['Up to 50 applications', 'Basic analytics', 'CSV export'],
        limits: { applications: 50, contacts: 25 }
      };
      renderSubscriptionStatus();
    }
  }
  
  // Render pricing plans
  function renderPricingPlans() {
    const pricingContainer = document.getElementById('pricingPlans');
    if (!pricingContainer) return;
    
    pricingContainer.innerHTML = '';
    
    availablePlans.forEach(plan => {
      const isCurrentPlan = currentSubscription && currentSubscription.plan === plan.id;
      const planCard = document.createElement('div');
      planCard.className = `pricing-card ${isCurrentPlan ? 'current-plan' : ''}`;
      
      planCard.innerHTML = `
        <div class="plan-header">
          <h3>${plan.name}</h3>
          <div class="plan-price">
            ${plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)}/month`}
          </div>
          ${isCurrentPlan ? '<span class="current-badge">Current Plan</span>' : ''}
        </div>
        
        <div class="plan-features">
          <ul>
            ${plan.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
          </ul>
        </div>
        
        <div class="plan-actions">
          ${renderPlanButton(plan, isCurrentPlan)}
        </div>
      `;
      
      pricingContainer.appendChild(planCard);
    });
  }
  
  // Render plan button based on current state
  function renderPlanButton(plan, isCurrentPlan) {
    if (plan.id === 'free') {
      return isCurrentPlan ? 
        '<button class="btn btn-secondary" disabled>Current Plan</button>' :
        `<button class="btn btn-outline" onclick="window.PaymentsModule.downgradeToPlan('free')">Downgrade</button>`;
    }
    
    if (isCurrentPlan) {
      return `
        <button class="btn btn-secondary" disabled>Current Plan</button>
        <button class="btn btn-outline btn-danger" onclick="window.PaymentsModule.cancelSubscription()">Cancel</button>
      `;
    }
    
    const currentPlan = currentSubscription?.plan || 'free';
    const isUpgrade = getPlanLevel(plan.id) > getPlanLevel(currentPlan);
    
    return `
      <button class="btn btn-primary" onclick="window.PaymentsModule.subscribeToPlan('${plan.id}')">
        ${isUpgrade ? 'Upgrade' : 'Switch'} to ${plan.name}
      </button>
    `;
  }
  
  // Get plan level for comparison
  function getPlanLevel(planId) {
    const levels = { 'free': 0, 'pro': 1, 'enterprise': 2 };
    return levels[planId] || 0;
  }
  
  // Render current subscription status
  function renderSubscriptionStatus() {
    const statusContainer = document.getElementById('subscriptionStatus');
    if (!statusContainer) return;
    
    if (!currentSubscription) {
      statusContainer.innerHTML = '<p>Loading subscription status...</p>';
      return;
    }
    
    const plan = availablePlans.find(p => p.id === currentSubscription.plan) || 
                 { name: 'Free Plan', price: 0 };
    
    statusContainer.innerHTML = `
      <div class="subscription-status">
        <div class="status-header">
          <h3>Current Subscription</h3>
          <span class="status-badge status-${currentSubscription.status}">${currentSubscription.status}</span>
        </div>
        
        <div class="subscription-details">
          <div class="detail-item">
            <label>Plan:</label>
            <span>${plan.name}</span>
          </div>
          <div class="detail-item">
            <label>Price:</label>
            <span>${plan.price === 0 ? 'Free' : `$${(plan.price / 100).toFixed(2)}/month`}</span>
          </div>
          ${currentSubscription.cancelAtPeriodEnd ? `
            <div class="detail-item">
              <label>Status:</label>
              <span class="text-warning">Canceling at period end</span>
            </div>
          ` : ''}
        </div>
        
        <div class="subscription-actions">
          ${renderSubscriptionActions()}
        </div>
      </div>
    `;
  }
  
  // Render subscription action buttons
  function renderSubscriptionActions() {
    if (!currentSubscription || currentSubscription.plan === 'free') {
      return '<button class="btn btn-primary" onclick="window.PaymentsModule.showPricingPlans()">Upgrade Plan</button>';
    }
    
    if (currentSubscription.cancelAtPeriodEnd) {
      return '<button class="btn btn-primary" onclick="window.PaymentsModule.reactivateSubscription()">Reactivate</button>';
    }
    
    return `
      <button class="btn btn-outline" onclick="window.PaymentsModule.showPricingPlans()">Change Plan</button>
      <button class="btn btn-outline btn-danger" onclick="window.PaymentsModule.cancelSubscription()">Cancel Subscription</button>
    `;
  }
  
  // Render payment history
  function renderPaymentHistory() {
    const historyContainer = document.getElementById('paymentHistory');
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (paymentHistory.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state">
          <p>No payment history available</p>
        </div>
      `;
      return;
    }
    
    const historyTable = document.createElement('table');
    historyTable.className = 'payment-history-table';
    historyTable.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${paymentHistory.map(payment => `
          <tr>
            <td>${formatDate(payment.date)}</td>
            <td>${payment.description}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    historyContainer.appendChild(historyTable);
  }
  
  // Render usage analytics
  function renderUsageAnalytics() {
    const usageContainer = document.getElementById('usageAnalytics');
    if (!usageContainer || !usage) return;
    
    usageContainer.innerHTML = `
      <div class="usage-analytics">
        <h3>Usage Analytics</h3>
        
        <div class="usage-metrics">
          <div class="usage-metric">
            <label>Applications</label>
            <div class="usage-bar">
              <div class="usage-progress" style="width: ${usage.utilizationPercent.applications}%"></div>
            </div>
            <span>${usage.usage.applications} ${usage.limits.applications === -1 ? '' : `/ ${usage.limits.applications}`}</span>
          </div>
          
          <div class="usage-metric">
            <label>Contacts</label>
            <div class="usage-bar">
              <div class="usage-progress" style="width: ${usage.utilizationPercent.contacts}%"></div>
            </div>
            <span>${usage.usage.contacts} ${usage.limits.contacts === -1 ? '' : `/ ${usage.limits.contacts}`}</span>
          </div>
          
          <div class="usage-metric">
            <label>Storage</label>
            <span>${usage.usage.storage} MB</span>
          </div>
          
          <div class="usage-metric">
            <label>API Calls</label>
            <span>${usage.usage.apiCalls}</span>
          </div>
        </div>
        
        ${usage.utilizationPercent.applications > 80 || usage.utilizationPercent.contacts > 80 ? `
          <div class="usage-warning">
            <p>⚠️ You're approaching your plan limits. Consider upgrading for unlimited access.</p>
            <button class="btn btn-primary btn-sm" onclick="window.PaymentsModule.showPricingPlans()">Upgrade Now</button>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Subscribe to a plan
  async function subscribeToPlan(planId) {
    try {
      if (!window.apiService) {
        throw new Error('API service not available');
      }
      
      showLoadingMessage('Creating checkout session...');
      
      const userEmail = prompt('Please enter your email address:');
      if (!userEmail) {
        hideLoadingMessage();
        return;
      }
      
      const response = await window.apiService.createCheckoutSession(planId, currentUserId, userEmail);
      
      if (response.success && response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
    } catch (error) {
      hideLoadingMessage();
      console.error('❌ Error subscribing to plan:', error);
      showErrorMessage('Failed to start subscription process: ' + error.message);
    }
  }
  
  // Cancel subscription
  async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return;
    }
    
    try {
      showLoadingMessage('Canceling subscription...');
      
      const response = await window.apiService.manageSubscription(currentUserId, 'cancel');
      
      if (response.success) {
        currentSubscription = response.subscription;
        renderSubscriptionStatus();
        showSuccessMessage('Subscription canceled successfully. You will have access until the end of your billing period.');
      } else {
        throw new Error('Failed to cancel subscription');
      }
      
    } catch (error) {
      console.error('❌ Error canceling subscription:', error);
      showErrorMessage('Failed to cancel subscription: ' + error.message);
    } finally {
      hideLoadingMessage();
    }
  }
  
  // Reactivate subscription
  async function reactivateSubscription() {
    try {
      showLoadingMessage('Reactivating subscription...');
      
      const response = await window.apiService.manageSubscription(currentUserId, 'reactivate');
      
      if (response.success) {
        currentSubscription = response.subscription;
        renderSubscriptionStatus();
        showSuccessMessage('Subscription reactivated successfully!');
      } else {
        throw new Error('Failed to reactivate subscription');
      }
      
    } catch (error) {
      console.error('❌ Error reactivating subscription:', error);
      showErrorMessage('Failed to reactivate subscription: ' + error.message);
    } finally {
      hideLoadingMessage();
    }
  }
  
  // Show pricing plans
  function showPricingPlans() {
    // Navigate to pricing section or show modal
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Downgrade to free plan
  async function downgradeToPlan(planId) {
    if (planId !== 'free') return;
    
    if (!confirm('Are you sure you want to downgrade to the free plan? This will limit your access to features.')) {
      return;
    }
    
    try {
      showLoadingMessage('Updating subscription...');
      
      const response = await window.apiService.manageSubscription(currentUserId, 'update', planId);
      
      if (response.success) {
        currentSubscription = response.subscription;
        renderSubscriptionStatus();
        renderPricingPlans();
        showSuccessMessage('Successfully downgraded to free plan.');
      } else {
        throw new Error('Failed to downgrade subscription');
      }
      
    } catch (error) {
      console.error('❌ Error downgrading subscription:', error);
      showErrorMessage('Failed to downgrade subscription: ' + error.message);
    } finally {
      hideLoadingMessage();
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Add any global event listeners here
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isInitialized) {
        // Refresh data when page becomes visible
        loadSubscriptionData();
      }
    });
  }
  
  // Utility functions
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function showSuccessMessage(message) {
    if (window.showSuccessMessage) {
      window.showSuccessMessage(message);
    } else {
      console.log('✅', message);
      alert(message);
    }
  }
  
  function showErrorMessage(message) {
    if (window.showErrorMessage) {
      window.showErrorMessage(message);
    } else {
      console.error('❌', message);
      alert('Error: ' + message);
    }
  }
  
  function showLoadingMessage(message) {
    if (window.showLoadingMessage) {
      window.showLoadingMessage(message);
    } else {
      console.log('⏳', message);
    }
  }
  
  function hideLoadingMessage() {
    if (window.hideLoadingMessage) {
      window.hideLoadingMessage();
    }
  }
  
  // Public API
  window.PaymentsModule = {
    initialize,
    loadSubscriptionData,
    subscribeToPlan,
    cancelSubscription,
    reactivateSubscription,
    showPricingPlans,
    downgradeToPlan,
    renderPricingPlans,
    renderSubscriptionStatus,
    renderPaymentHistory,
    renderUsageAnalytics
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  console.log('💳 Payments module loaded successfully');
  
})();