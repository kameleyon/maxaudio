import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import { subscriptionService } from '../services/subscription.service.js';
import { usageService } from '../services/usage.service.js';
import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

// Initialize Stripe with a function to ensure environment variables are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const subscriptionRoutes = Router();

// Rate limiting middleware for subscription endpoints
const subscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all subscription routes
subscriptionRoutes.use(subscriptionLimiter);

// Get current subscription
subscriptionRoutes.get('/current', auth, async (req, res) => {
  try {
    const subscription = await subscriptionService.getCurrentSubscription(req.auth.userId);
    const usage = await subscriptionService.getSubscriptionUsage(req.auth.userId);
    
    res.json({
      ...subscription,
      usage
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

// Get usage statistics
subscriptionRoutes.get('/usage', auth, async (req, res) => {
  try {
    const usage = await usageService.getUsageStats(req.auth.userId);
    res.json(usage);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Change subscription plan
subscriptionRoutes.post('/change-plan', auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    const subscription = await subscriptionService.createOrUpdateSubscription(
      req.auth.userId,
      priceId
    );
    res.json(subscription);
  } catch (error) {
    console.error('Error changing subscription:', error);
    res.status(500).json({ error: 'Failed to change subscription plan' });
  }
});

// Cancel subscription
subscriptionRoutes.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.auth.userId);
    res.json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
subscriptionRoutes.post('/reactivate', auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    const subscription = await subscriptionService.createOrUpdateSubscription(
      req.auth.userId,
      priceId
    );
    res.json(subscription);
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Update payment method
subscriptionRoutes.post('/update-payment', auth, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const stripe = getStripe();
    const user = await clerkClient.users.getUser(req.auth.userId);
    const customerId = user.publicMetadata.stripeCustomerId;

    if (!customerId) {
      throw new Error('No Stripe customer found');
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Get invoices
subscriptionRoutes.get('/invoices', auth, async (req, res) => {
  try {
    const { limit = 10, starting_after } = req.query;
    const stripe = getStripe();
    const user = await clerkClient.users.getUser(req.auth.userId);
    const customerId = user.publicMetadata.stripeCustomerId;

    if (!customerId) {
      return res.json([]);
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: Number(limit),
      starting_after: starting_after || undefined,
    });

    res.json(invoices.data);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create checkout session
subscriptionRoutes.post('/create-checkout', auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    const stripe = getStripe();
    const user = await clerkClient.users.getUser(req.auth.userId);
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.emailAddresses[0].emailAddress,
      client_reference_id: req.auth.userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
subscriptionRoutes.post('/create-portal', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const user = await clerkClient.users.getUser(req.auth.userId);
    const customerId = user.publicMetadata.stripeCustomerId;

    if (!customerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/settings`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Track usage
subscriptionRoutes.post('/track-usage', auth, async (req, res) => {
  try {
    const { characters, voiceClone } = req.body;
    let result;

    if (characters) {
      result = await usageService.trackCharacters(req.auth.userId, characters);
    }

    if (voiceClone) {
      result = await usageService.trackVoiceClone(req.auth.userId);
    }

    res.json(result);
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});
