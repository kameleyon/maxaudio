import Stripe from 'stripe';
import { buffer } from 'micro';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { updateUserUsage } from '../services/usage.service.js';

// Initialize Stripe with a function to ensure environment variables are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Helper function to update user metadata
async function updateUserSubscription(userId, subscriptionData) {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        subscriptionId: subscriptionData.id,
        subscriptionStatus: subscriptionData.status,
        subscriptionPlan: subscriptionData.items.data[0].price.lookup_key,
        subscriptionPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toISOString(),
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw error;
  }
}

// Helper function to handle subscription status changes
async function handleSubscriptionChange(subscription) {
  const clientReferenceId = subscription.client_reference_id || subscription.customer_email;
  
  if (!clientReferenceId) {
    console.error('No client reference ID found for subscription:', subscription.id);
    return;
  }

  try {
    await updateUserSubscription(clientReferenceId, subscription);

    // Reset usage metrics on subscription renewal
    if (subscription.status === 'active' && subscription.current_period_start * 1000 > Date.now() - 300000) {
      await updateUserUsage(clientReferenceId, {
        requestsThisMinute: 0,
        charactersThisMonth: 0,
        lastResetDate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

// Helper function to handle customer updates
async function handleCustomerUpdate(customer) {
  try {
    const user = await clerkClient.users.getUserList({
      emailAddress: [customer.email]
    });

    if (user && user.length > 0) {
      await clerkClient.users.updateUser(user[0].id, {
        publicMetadata: {
          stripeCustomerId: customer.id,
          paymentMethod: customer.invoice_settings?.default_payment_method,
          lastCustomerUpdate: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error handling customer update:', error);
    throw error;
  }
}

// Helper function to handle failed payments
async function handleFailedPayment(invoice) {
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.retrieve(invoice.customer);
    const user = await clerkClient.users.getUserList({
      emailAddress: [customer.email]
    });

    if (user && user.length > 0) {
      await clerkClient.users.updateUser(user[0].id, {
        publicMetadata: {
          paymentStatus: 'failed',
          lastFailedPayment: new Date().toISOString(),
          paymentErrorMessage: invoice.last_payment_error?.message || 'Payment failed'
        }
      });
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

// Retry mechanism for webhook handlers
async function retryOperation(operation, maxAttempts = MAX_RETRY_ATTEMPTS) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }
  
  throw lastError;
}

export async function stripeWebhookMiddleware(req, res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  try {
    const stripe = getStripe();
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types with retry mechanism
    await retryOperation(async () => {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await handleSubscriptionChange(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          const trialEndSubscription = event.data.object;
          await handleSubscriptionChange({
            ...trialEndSubscription,
            status: 'trial_ending'
          });
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            await handleSubscriptionChange(subscription);
          }
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          await handleFailedPayment(failedInvoice);
          if (failedInvoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
            await handleSubscriptionChange({
              ...subscription,
              status: 'past_due'
            });
          }
          break;

        case 'payment_intent.succeeded':
          // Update payment status in user metadata
          const successfulPayment = event.data.object;
          const customer = await stripe.customers.retrieve(successfulPayment.customer);
          await handleCustomerUpdate(customer);
          break;

        case 'payment_intent.payment_failed':
          // Handle failed payment intent
          const failedPayment = event.data.object;
          await handleFailedPayment({
            customer: failedPayment.customer,
            last_payment_error: failedPayment.last_payment_error
          });
          break;

        case 'customer.created':
        case 'customer.updated':
          await handleCustomerUpdate(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    });

    req.stripeEvent = event;
    next();
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).json({
      error: {
        message: 'Webhook error',
        details: error.message
      }
    });
  }
}

// Middleware to verify subscription status
export async function verifySubscription(req, res, next) {
  try {
    const stripe = getStripe();
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await clerkClient.users.getUser(userId);
    const subscriptionId = user.publicMetadata.subscriptionId;

    if (!subscriptionId) {
      return res.status(403).json({ error: 'No active subscription' });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return res.status(403).json({ error: 'Subscription is not active' });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return res.status(500).json({ error: 'Failed to verify subscription' });
  }
}

// Middleware to check rate limits based on subscription tier
export async function checkSubscriptionLimits(req, res, next) {
  try {
    const userId = req.auth?.userId;
    const subscription = req.subscription;
    
    if (!subscription) {
      return res.status(403).json({ error: 'No subscription found' });
    }

    const price = subscription.items.data[0].price;
    const tierLimits = {
      'pro': {
        requestsPerMinute: 15,
        charactersPerMonth: 1000000,
        voiceClones: 3
      },
      'premium': {
        requestsPerMinute: 30,
        charactersPerMonth: 3000000,
        voiceClones: 10
      }
    };

    const tier = price.lookup_key;
    const limits = tierLimits[tier];

    if (!limits) {
      return res.status(403).json({ error: 'Invalid subscription tier' });
    }

    // Get current usage from user metadata
    const user = await clerkClient.users.getUser(userId);
    const usage = user.publicMetadata.usage || {
      requestsThisMinute: 0,
      charactersThisMonth: 0,
      lastRequestTime: null
    };

    // Check if we need to reset the per-minute counter
    const now = new Date();
    if (!usage.lastRequestTime || now - new Date(usage.lastRequestTime) >= 60000) {
      usage.requestsThisMinute = 0;
    }

    // Check if we need to reset the monthly counter
    const lastResetDate = new Date(usage.lastResetDate || 0);
    if (now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
      usage.charactersThisMonth = 0;
      usage.lastResetDate = now.toISOString();
    }

    // Check limits
    if (usage.requestsThisMinute >= limits.requestsPerMinute) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (usage.charactersThisMonth >= limits.charactersPerMonth) {
      return res.status(429).json({ error: 'Monthly character limit exceeded' });
    }

    // Update usage
    usage.requestsThisMinute++;
    usage.lastRequestTime = now.toISOString();

    // Attach usage and limits to request for use in route handlers
    req.subscriptionLimits = limits;
    req.currentUsage = usage;

    // Update user metadata with new usage
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        usage
      }
    });

    next();
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    return res.status(500).json({ error: 'Failed to check subscription limits' });
  }
}
