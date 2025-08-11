#!/usr/bin/env node

/**
 * Stripe Webhook Server - Production Payment Processing
 * Handles payment confirmations, subscriptions, and customer management
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_live_YOUR_SECRET_KEY');
const cors = require('cors');

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Raw body parser for Stripe webhooks
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cors());

// Stripe webhook endpoint secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET';

// Simple in-memory storage (replace with real database in production)
const customers = new Map();
const subscriptions = new Map();

// Webhook handler
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.created':
      handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      handleSubscriptionUpdated(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      handlePaymentSucceeded(event.data.object);
      break;
    case 'customer.subscription.deleted':
      handleSubscriptionCanceled(event.data.object);
      break;
    default:
      console.log(`🔄 Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  console.log('🎉 Checkout completed:', session.id);
  
  const customerEmail = session.customer_details?.email;
  const service = session.metadata?.service || 'unknown';
  const amount = session.amount_total / 100; // Convert from cents
  
  // Store customer info
  if (customerEmail) {
    customers.set(session.customer, {
      email: customerEmail,
      service: service,
      amount: amount,
      sessionId: session.id,
      created: new Date().toISOString()
    });
  }
  
  // Service-specific fulfillment
  switch (service) {
    case 'MacAgent Pro Early Access':
      await fulfillMacAgentEarlyAccess(customerEmail, session);
      break;
    case 'VetSorcery Emergency Coverage':
      await fulfillVetSorceryEmergency(customerEmail, session);
      break;
  }
  
  // Send confirmation email (implement with your email service)
  await sendConfirmationEmail(customerEmail, service, amount, session.id);
}

// Handle subscription creation
function handleSubscriptionCreated(subscription) {
  console.log('📅 Subscription created:', subscription.id);
  
  subscriptions.set(subscription.id, {
    customerId: subscription.customer,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    priceId: subscription.items.data[0]?.price.id,
    created: new Date().toISOString()
  });
}

// Handle subscription updates
function handleSubscriptionUpdated(subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  const existing = subscriptions.get(subscription.id) || {};
  subscriptions.set(subscription.id, {
    ...existing,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    updated: new Date().toISOString()
  });
}

// Handle successful payment
function handlePaymentSucceeded(invoice) {
  console.log('💳 Payment succeeded:', invoice.id);
  
  // Update subscription billing
  if (invoice.subscription) {
    const subscription = subscriptions.get(invoice.subscription);
    if (subscription) {
      console.log(`✅ Billing successful for subscription ${invoice.subscription}`);
    }
  }
}

// Handle subscription cancellation
function handleSubscriptionCanceled(subscription) {
  console.log('❌ Subscription canceled:', subscription.id);
  
  const existing = subscriptions.get(subscription.id);
  if (existing) {
    subscriptions.set(subscription.id, {
      ...existing,
      status: 'canceled',
      canceledAt: new Date().toISOString()
    });
  }
}

// MacAgent Pro Early Access fulfillment
async function fulfillMacAgentEarlyAccess(email, session) {
  console.log(`🚀 Fulfilling MacAgent Pro Early Access for ${email}`);
  
  // TODO: Implement actual fulfillment
  // - Send download links
  // - Add to developer Discord
  // - Provide API keys
  // - Send onboarding sequence
  
  const fulfillmentData = {
    downloadUrl: 'https://releases.macagent.pro/v1.0.2/macagent-pro-early-access.dmg',
    discordInvite: 'https://discord.gg/macagent-dev',
    apiKey: `ma_${session.id.substr(-12)}`,
    documentation: 'https://docs.macagent.pro/early-access'
  };
  
  // Log for now (implement actual delivery)
  console.log('📦 MacAgent Pro fulfillment data:', fulfillmentData);
}

// VetSorcery Emergency Coverage fulfillment
async function fulfillVetSorceryEmergency(email, session) {
  console.log(`🏥 Fulfilling VetSorcery Emergency Coverage for ${email}`);
  
  // TODO: Implement actual fulfillment
  // - Schedule setup call
  // - Create clinic profile
  // - Provision phone number
  // - Start 7-day trial
  
  const fulfillmentData = {
    setupCallScheduled: true,
    trialStartDate: new Date().toISOString(),
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dashboardUrl: `https://dashboard.vetsorcery.com/clinic/${session.id}`,
    supportPhone: '(555) 123-4567'
  };
  
  // Log for now (implement actual delivery)
  console.log('🏥 VetSorcery fulfillment data:', fulfillmentData);
}

// Send confirmation email
async function sendConfirmationEmail(email, service, amount, sessionId) {
  console.log(`📧 Sending confirmation email to ${email} for ${service} ($${amount})`);
  
  // TODO: Implement with your email service (SendGrid, Postmark, etc.)
  const emailData = {
    to: email,
    subject: `Welcome to ${service}! Payment Confirmed`,
    amount: amount,
    sessionId: sessionId,
    service: service
  };
  
  console.log('📧 Email data:', emailData);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    customers: customers.size,
    subscriptions: subscriptions.size
  });
});

// Get customer info (for testing)
app.get('/customer/:customerId', (req, res) => {
  const customer = customers.get(req.params.customerId);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Get subscription info (for testing)
app.get('/subscription/:subscriptionId', (req, res) => {
  const subscription = subscriptions.get(req.params.subscriptionId);
  if (subscription) {
    res.json(subscription);
  } else {
    res.status(404).json({ error: 'Subscription not found' });
  }
});

// List all customers (for admin)
app.get('/admin/customers', (req, res) => {
  const customerList = Array.from(customers.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
  res.json({ customers: customerList });
});

// List all subscriptions (for admin)
app.get('/admin/subscriptions', (req, res) => {
  const subscriptionList = Array.from(subscriptions.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
  res.json({ subscriptions: subscriptionList });
});

// Start server
app.listen(PORT, () => {
  console.log('💳 Stripe Webhook Server Started');
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 Remember to set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET environment variables`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down webhook server...');
  process.exit(0);
});

module.exports = app;