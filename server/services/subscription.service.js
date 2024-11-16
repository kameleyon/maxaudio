const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const { User } = require('../models/user.model');
const Payment = require('../models/payment.model');
const notificationService = require('./notification.service');

class SubscriptionService {
  /**
   * Get user
   */
  async getUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  /**
   * Update user subscription status
   */
  async updateSubscription(userId, subscription) {
    try {
      const planId = subscription.items.data[0].price.id;
      const status = subscription.status;
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;

      // Get plan details
      const price = await stripe.prices.retrieve(planId, {
        expand: ['product']
      });

      // Parse features from product metadata
      const features = price.product.metadata.features ? 
        JSON.parse(price.product.metadata.features) : {};

      // Update user subscription
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'subscription.planId': planId,
            'subscription.status': status,
            'subscription.currentPeriodEnd': currentPeriodEnd,
            'subscription.cancelAtPeriodEnd': cancelAtPeriodEnd,
            'subscription.features': features,
            'subscription.updatedAt': new Date()
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Send notification
      await notificationService.sendSubscriptionNotification(
        userId,
        subscription.status === 'active' ? 'subscription_created' : 'subscription_updated',
        {
          planName: price.product.name,
          currentPeriodEnd
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleCancellation(userId, subscription) {
    try {
      const endDate = new Date(subscription.current_period_end * 1000);

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'subscription.status': 'canceled',
            'subscription.canceledAt': new Date(),
            'subscription.endDate': endDate,
            'subscription.updatedAt': new Date()
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Send notification
      await notificationService.sendSubscriptionNotification(
        userId,
        'subscription_canceled',
        { endDate }
      );

      return { success: true };
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
      throw error;
    }
  }

  /**
   * Handle addon purchase
   */
  async handleAddonPurchase(userId, addonType, quantity) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let update = {};
      let notificationType = '';
      let notificationData = {};

      switch (addonType) {
        case 'tokens':
          const tokensToAdd = quantity * 500000; // 500K chars per token
          update = {
            $inc: { 'usage.charactersRemaining': tokensToAdd }
          };
          notificationType = 'tokens_purchased';
          notificationData = {
            amount: tokensToAdd,
            total: (user.usage?.charactersRemaining || 0) + tokensToAdd
          };
          break;

        case 'voice_clone':
          update = {
            $inc: { 'subscription.voiceClones.available': quantity }
          };
          notificationType = 'voice_clones_purchased';
          notificationData = {
            amount: quantity,
            total: (user.subscription?.voiceClones?.available || 0) + quantity
          };
          break;

        default:
          throw new Error('Invalid addon type');
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        update,
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      // Send notification
      await notificationService.sendSubscriptionNotification(
        userId,
        notificationType,
        notificationData
      );

      return { success: true };
    } catch (error) {
      console.error('Error handling addon purchase:', error);
      throw error;
    }
  }

  /**
   * Record payment
   */
  async recordPayment(userId, invoice) {
    try {
      // Get payment method details if available
      let paymentMethod;
      if (invoice.payment_intent?.payment_method) {
        paymentMethod = await stripe.paymentMethods.retrieve(
          invoice.payment_intent.payment_method
        );
      }

      const payment = new Payment({
        userId,
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        description: invoice.description,
        hostedUrl: invoice.hosted_invoice_url,
        pdfUrl: invoice.invoice_pdf,
        subscription: invoice.subscription ? {
          id: invoice.subscription.id,
          status: invoice.subscription.status,
          interval: invoice.subscription.items.data[0].price.recurring.interval
        } : undefined,
        paymentIntent: invoice.payment_intent ? {
          id: invoice.payment_intent.id,
          status: invoice.payment_intent.status
        } : undefined,
        paymentMethod: paymentMethod ? {
          id: paymentMethod.id,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        } : undefined,
        billingDetails: invoice.customer_address ? {
          name: invoice.customer_name,
          email: invoice.customer_email,
          address: invoice.customer_address
        } : undefined,
        metadata: invoice.metadata
      });

      await payment.save();

      // Send notification
      await notificationService.sendSubscriptionNotification(
        userId,
        'payment_succeeded',
        {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          hostedUrl: invoice.hosted_invoice_url
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(userId, invoice) {
    try {
      // Record failed payment
      await this.recordPayment(userId, invoice);

      // Update subscription status
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'subscription.status': 'past_due',
            'subscription.updatedAt': new Date()
          }
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Send notification
      await notificationService.sendSubscriptionNotification(
        userId,
        'payment_failed',
        {
          amount: invoice.amount_due,
          currency: invoice.currency
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error handling failed payment:', error);
      throw error;
    }
  }

  /**
   * Update customer payment method
   */
  async updatePaymentMethod(userId, paymentMethodId, isDefault = false) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.stripeCustomerId) {
        throw new Error('User has no Stripe customer ID');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId
      });

      if (isDefault) {
        // Set as default payment method
        await stripe.customers.update(user.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(userId, paymentMethodId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.stripeCustomerId) {
        throw new Error('User has no Stripe customer ID');
      }

      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      if (paymentMethod.customer !== user.stripeCustomerId) {
        throw new Error('Payment method does not belong to user');
      }

      await stripe.paymentMethods.detach(paymentMethodId);

      return { success: true };
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  /**
   * Get subscription
   */
  async getSubscription(userId) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.stripeCustomerId) {
        return null;
      }

      // Get latest subscription from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
        status: 'active'
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      const price = await stripe.prices.retrieve(subscription.items.data[0].price.id, {
        expand: ['product']
      });

      return {
        id: subscription.id,
        status: subscription.status,
        planId: price.id,
        planName: price.product.name,
        interval: price.recurring.interval,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        features: price.product.metadata.features ? 
          JSON.parse(price.product.metadata.features) : {},
        metadata: subscription.metadata
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(userId) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.stripeCustomerId) {
        return [];
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card'
      });

      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

      return paymentMethods.data.map(method => ({
        id: method.id,
        brand: method.card.brand,
        last4: method.card.last4,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        isDefault: method.id === defaultPaymentMethodId,
        billingDetails: method.billing_details
      }));
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(userId, options = {}) {
    try {
      const payments = await Payment.findByUserId(userId, {
        status: options.status,
        startDate: options.startDate,
        endDate: options.endDate,
        sort: { date: -1 },
        limit: options.limit || 24
      });

      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  /**
   * Update customer ID
   */
  async updateCustomerId(userId, stripeCustomerId) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { stripeCustomerId } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating customer ID:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
