require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Raw body parser for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser for other routes
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true, methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.urlencoded({ extended: true }));

// In-memory store for subscriptions (in production, use a database)
let subscriptions = [];
let paymentHistory = [];

// Subscription plans
const PLANS = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: ['Up to 50 applications', 'Basic analytics', 'CSV export'],
    limits: { applications: 50, contacts: 25 }
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 999, // $9.99 in cents
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: ['Unlimited applications', 'Advanced analytics', 'All export formats', 'Premium templates', 'Priority support'],
    limits: { applications: -1, contacts: -1 }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 2999, // $29.99 in cents
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    features: ['Everything in Pro', 'Team collaboration', 'API access', 'Custom integrations', 'Dedicated support'],
    limits: { applications: -1, contacts: -1, teamMembers: 10 }
  }
};

// GET subscription plans
app.get('/api/payments/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.values(PLANS)
  });
});

// GET current user subscription
app.get('/api/payments/subscription/:userId', (req, res) => {
  const { userId } = req.params;
  
  const subscription = subscriptions.find(sub => sub.userId === userId);
  
  if (!subscription) {
    return res.json({
      success: true,
      subscription: {
        userId,
        plan: 'free',
        status: 'active',
        features: PLANS.free.features,
        limits: PLANS.free.limits
      }
    });
  }
  
  res.json({
    success: true,
    subscription
  });
});

// POST create checkout session
app.post('/api/payments/create-checkout-session', async (req, res) => {
  try {
    const { planId, userId, userEmail, successUrl, cancelUrl } = req.body;
    
    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID and User ID are required'
      });
    }
    
    const plan = PLANS[planId];
    if (!plan || planId === 'free') {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/pricing`,
      customer_email: userEmail,
      metadata: {
        userId,
        planId
      },
      subscription_data: {
        metadata: {
          userId,
          planId
        }
      }
    });
    
    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// POST create payment intent (for one-time payments)
app.post('/api/payments/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', userId, description } = req.body;
    
    if (!amount || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Amount and User ID are required'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId,
        description: description || 'Job Tracker Payment'
      }
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// POST manage subscription (cancel, update, etc.)
app.post('/api/payments/manage-subscription', async (req, res) => {
  try {
    const { userId, action, newPlanId } = req.body;
    
    if (!userId || !action) {
      return res.status(400).json({
        success: false,
        error: 'User ID and action are required'
      });
    }
    
    const subscription = subscriptions.find(sub => sub.userId === userId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }
    
    switch (action) {
      case 'cancel':
        if (subscription.stripeSubscriptionId) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true
          });
        }
        subscription.status = 'canceling';
        subscription.cancelAtPeriodEnd = true;
        break;
        
      case 'reactivate':
        if (subscription.stripeSubscriptionId) {
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: false
          });
        }
        subscription.status = 'active';
        subscription.cancelAtPeriodEnd = false;
        break;
        
      case 'update':
        if (!newPlanId || !PLANS[newPlanId]) {
          return res.status(400).json({
            success: false,
            error: 'Valid new plan ID required for update'
          });
        }
        
        if (subscription.stripeSubscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            items: [{
              id: stripeSubscription.items.data[0].id,
              price: PLANS[newPlanId].stripePriceId,
            }]
          });
        }
        
        subscription.planId = newPlanId;
        subscription.features = PLANS[newPlanId].features;
        subscription.limits = PLANS[newPlanId].limits;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
    
    res.json({
      success: true,
      subscription
    });
    
  } catch (error) {
    console.error('Error managing subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to manage subscription'
    });
  }
});

// GET payment history
app.get('/api/payments/history/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userPayments = paymentHistory
    .filter(payment => payment.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json({
    success: true,
    payments: userPayments
  });
});

// POST Stripe webhook
app.post('/api/payments/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'customer.subscription.created':
      handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      handleSubscriptionDeleted(event.data.object);
      break;
      
    case 'payment_intent.succeeded':
      handlePaymentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      handlePaymentFailed(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Webhook handlers
function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);
  
  const { userId, planId } = session.metadata;
  
  if (userId && planId) {
    const plan = PLANS[planId];
    
    // Create or update subscription
    let subscription = subscriptions.find(sub => sub.userId === userId);
    
    if (subscription) {
      subscription.planId = planId;
      subscription.status = 'active';
      subscription.stripeCustomerId = session.customer;
      subscription.stripeSubscriptionId = session.subscription;
      subscription.features = plan.features;
      subscription.limits = plan.limits;
      subscription.updatedAt = new Date().toISOString();
    } else {
      subscription = {
        userId,
        planId,
        status: 'active',
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        features: plan.features,
        limits: plan.limits,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      subscriptions.push(subscription);
    }
  }
}

function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  // Additional logic for subscription creation
}

function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  
  const { userId } = subscription.metadata;
  if (userId) {
    const userSub = subscriptions.find(sub => sub.stripeSubscriptionId === subscription.id);
    if (userSub) {
      userSub.status = subscription.status;
      userSub.updatedAt = new Date().toISOString();
    }
  }
}

function handleSubscriptionDeleted(subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const { userId } = subscription.metadata;
  if (userId) {
    const userSub = subscriptions.find(sub => sub.stripeSubscriptionId === subscription.id);
    if (userSub) {
      userSub.status = 'canceled';
      userSub.planId = 'free';
      userSub.features = PLANS.free.features;
      userSub.limits = PLANS.free.limits;
      userSub.updatedAt = new Date().toISOString();
    }
  }
}

function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  const { userId, description } = paymentIntent.metadata;
  
  if (userId) {
    paymentHistory.push({
      id: paymentIntent.id,
      userId,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'succeeded',
      description: description || 'Payment',
      date: new Date().toISOString()
    });
  }
}

function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  const { userId, description } = paymentIntent.metadata;
  
  if (userId) {
    paymentHistory.push({
      id: paymentIntent.id,
      userId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: 'failed',
      description: description || 'Payment',
      error: paymentIntent.last_payment_error?.message,
      date: new Date().toISOString()
    });
  }
}

// GET usage analytics
app.get('/api/payments/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, you'd fetch this from your applications and contacts services
    // For now, we'll return mock data
    const usage = {
      applications: 25,
      contacts: 12,
      storage: 45.2, // MB
      apiCalls: 156
    };
    
    const subscription = subscriptions.find(sub => sub.userId === userId) || {
      planId: 'free',
      limits: PLANS.free.limits
    };
    
    const plan = PLANS[subscription.planId];
    
    res.json({
      success: true,
      usage,
      limits: plan.limits,
      plan: plan.name,
      utilizationPercent: {
        applications: plan.limits.applications === -1 ? 0 : Math.round((usage.applications / plan.limits.applications) * 100),
        contacts: plan.limits.contacts === -1 ? 0 : Math.round((usage.contacts / plan.limits.contacts) * 100)
      }
    });
    
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage data'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    service: 'payments-service',
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Payments service error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 4008;
app.listen(PORT, () => {
  console.log(`Payments Service running on port ${PORT}`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not configured');
  }
});