const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const subscriptionService = require('../services/subscription.service');

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product'],
      lookup_keys: ['pro_monthly', 'pro_yearly', 'premium_monthly', 'premium_yearly']
    });

    const plans = prices.data.map(price => ({
      id: price.id,
      name: price.product.name,
      priceId: price.id,
      price: price.unit_amount / 100,
      interval: price.recurring.interval,
      features: price.product.metadata.features ? 
        JSON.parse(price.product.metadata.features) : [],
      description: price.product.description,
      metadata: price.product.metadata
    }));

    res.json(plans);
  } catch (error) {
    console.error('Error getting plans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods
router.get('/payment-methods', requireAuth, async (req, res) => {
  try {
    const methods = await subscriptionService.getPaymentMethods(req.user.id);
    res.json(methods);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoices
router.get('/invoices', requireAuth, async (req, res) => {
  try {
    const payments = await subscriptionService.getPaymentHistory(req.user.id, {
      limit: 24,
      sort: { date: -1 }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create checkout session for subscription
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { priceId, isAddon } = req.body;

    // Create or get customer
    let customer;
    if (req.user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id
        }
      });
      // Update user with stripeCustomerId
      await subscriptionService.updateCustomerId(req.user.id, customer.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isAddon ? 'payment' : 'subscription',
      success_url: `${process.env.CLIENT_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
      metadata: {
        userId: req.user.id,
        isAddon: isAddon ? 'true' : 'false'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create checkout session for add-ons
router.post('/create-addon-checkout-session', requireAuth, async (req, res) => {
  try {
    const { addonType, quantity } = req.body;

    // Get the appropriate price ID based on the user's subscription tier and addon type
    let priceId;
    if (addonType === 'tokens') {
      switch (req.user.subscription?.plan) {
        case 'free':
          priceId = process.env.STRIPE_PRICE_ID_TOKENS_FREE;
          break;
        case 'professional':
          priceId = process.env.STRIPE_PRICE_ID_TOKENS_PRO;
          break;
        case 'premium':
        case 'enterprise':
          priceId = process.env.STRIPE_PRICE_ID_TOKENS_PREMIUM;
          break;
        default:
          throw new Error('Invalid subscription plan');
      }
    } else if (addonType === 'voice_clone') {
      priceId = process.env.STRIPE_PRICE_ID_VOICE_CLONE;
    } else {
      throw new Error('Invalid addon type');
    }

    const session = await stripe.checkout.sessions.create({
      customer: req.user.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/settings?addon_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
      metadata: {
        userId: req.user.id,
        addonType,
        quantity: quantity || 1
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating addon checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create portal session
router.post('/create-portal-session', requireAuth, async (req, res) => {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
      flow_data: {
        type: 'subscription_cancel',
        subscription_cancel: {
          subscription: req.body.subscriptionId
        }
      }
    });

    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create setup intent
router.post('/create-setup-intent', requireAuth, async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: req.user.stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove payment method
router.delete('/payment-methods/:methodId', requireAuth, async (req, res) => {
  try {
    await subscriptionService.removePaymentMethod(req.user.id, req.params.methodId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set default payment method
router.post('/payment-methods/:methodId/default', requireAuth, async (req, res) => {
  try {
    await subscriptionService.updatePaymentMethod(
      req.user.id,
      req.params.methodId,
      true
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify session
router.post('/verify-session', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (session.metadata.userId !== req.user.id) {
      return res.status(403).json({ error: 'Session does not belong to user' });
    }

    if (session.metadata.isAddon === 'true') {
      // Handle addon purchase completion
      await subscriptionService.handleAddonPurchase(
        req.user.id,
        session.metadata.addonType,
        session.metadata.quantity
      );
    } else {
      // Handle subscription update
      await subscriptionService.updateSubscription(req.user.id, session.subscription);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    const { userId } = event.data.object.metadata;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await subscriptionService.updateSubscription(userId, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await subscriptionService.handleCancellation(userId, event.data.object);
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        if (session.metadata.isAddon === 'true') {
          await subscriptionService.handleAddonPurchase(
            session.metadata.userId,
            session.metadata.addonType,
            session.metadata.quantity
          );
        }
        break;

      case 'invoice.payment_succeeded':
        await subscriptionService.recordPayment(userId, event.data.object);
        break;

      case 'invoice.payment_failed':
        await subscriptionService.handleFailedPayment(userId, event.data.object);
        break;

      case 'setup_intent.succeeded':
        const setupIntent = event.data.object;
        await subscriptionService.updatePaymentMethod(
          userId,
          setupIntent.payment_method,
          true
        );
        break;
    }

    res.json({received: true});
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
