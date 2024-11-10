import Stripe from 'stripe';
import { buffer } from 'micro';
import { clerkClient } from '@clerk/clerk-sdk-node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Helper function to update user metadata
async function updateUserSubscription(userId, subscriptionData) {
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        subscriptionId: subscriptionData.id,
        subscriptionStatus: subscriptionData.status,
        subscriptionPlan: subscriptionData.items.data[0].price.lookup_key,
        subscriptionPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toISOString()
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
  } catch (error) {
    console.error('Error handling subscription change:', error);
    throw error;
  }
}

export async function stripeWebhookMiddleware(req, res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  try {
    // Get the raw body as a buffer
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(event.data.object);
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
        if (failedInvoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
          await handleSubscriptionChange({
            ...subscription,
            status: 'past_due'
          });
        }
        break;

      case 'customer.created':
      case 'customer.updated':
        // Handle customer updates if needed
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Attach the verified event to the request for use in route handlers
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

    // Attach subscription data to request for use in route handlers
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

    // TODO: Implement actual usage tracking and checking
    // For now, just attach the limits to the request
    req.subscriptionLimits = limits;
    next();
  } catch (error) {
    console.error('Error checking subscription limits:', error);
    return res.status(500).json({ error: 'Failed to check subscription limits' });
  }
}
