import { Router } from 'express';
import Stripe from 'stripe';
import { auth } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeRoutes = Router();

// Create a Stripe checkout session
stripeRoutes.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerId,
      clientReferenceId
    } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      client_reference_id: clientReferenceId,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create a Stripe customer portal session
stripeRoutes.post('/create-portal-session', auth, async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Update a subscription
stripeRoutes.post('/update-subscription', auth, async (req, res) => {
  try {
    const { subscriptionId, priceId, quantity } = req.body;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
        quantity: quantity || 1,
      }],
      proration_behavior: 'always_invoice',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel a subscription
stripeRoutes.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const { subscriptionId, cancelAtPeriodEnd } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Resume a subscription
stripeRoutes.post('/resume-subscription', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

// Get subscription details
stripeRoutes.get('/subscription/:subscriptionId', auth, async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    res.json(subscription);
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

// Get customer's payment methods
stripeRoutes.get('/payment-methods/:customerId', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    res.json(paymentMethods.data);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Update default payment method
stripeRoutes.post('/update-payment-method', auth, async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Get upcoming invoice
stripeRoutes.get('/upcoming-invoice', auth, async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.query;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer,
      subscription: subscriptionId,
      subscription_items: newPriceId ? [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }] : undefined,
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error getting upcoming invoice:', error);
    res.status(500).json({ error: 'Failed to get upcoming invoice' });
  }
});

// Webhook handler
stripeRoutes.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        // TODO: Update user's subscription status in database
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // TODO: Update user's payment status
        break;
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        // TODO: Handle failed payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});
