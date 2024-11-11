import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

// Initialize Stripe with a function to ensure environment variables are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

class SubscriptionService {
  // Get user's current subscription
  async getCurrentSubscription(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const subscriptionId = user.publicMetadata.subscriptionId;

      if (!subscriptionId) {
        return null;
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  // Get subscription tier limits
  getTierLimits(tier) {
    const limits = {
      pro: {
        requestsPerMinute: 15,
        charactersPerMonth: 1000000,
        voiceClones: 3
      },
      premium: {
        requestsPerMinute: 30,
        charactersPerMonth: 3000000,
        voiceClones: 10
      },
      free: {
        requestsPerMinute: 5,
        charactersPerMonth: 10000,
        voiceClones: 0
      }
    };

    return limits[tier] || limits.free;
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId) {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      return subscription?.status === 'active' || subscription?.status === 'trialing';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Get user's subscription tier
  async getUserTier(userId) {
    try {
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription) {
        return 'free';
      }

      const price = subscription.items.data[0].price;
      return price.lookup_key || 'free';
    } catch (error) {
      console.error('Error getting user tier:', error);
      return 'free';
    }
  }

  // Create or update subscription
  async createOrUpdateSubscription(userId, priceId) {
    try {
      const stripe = getStripe();
      const user = await clerkClient.users.getUser(userId);
      let customerId = user.publicMetadata.stripeCustomerId;

      // Create customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.emailAddresses[0].emailAddress,
          metadata: {
            userId: userId
          }
        });
        customerId = customer.id;

        // Update user metadata with customer ID
        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            stripeCustomerId: customerId
          }
        });
      }

      const currentSubscription = await this.getCurrentSubscription(userId);

      if (currentSubscription) {
        // Update existing subscription
        const subscription = await stripe.subscriptions.update(
          currentSubscription.id,
          {
            items: [{
              id: currentSubscription.items.data[0].id,
              price: priceId
            }],
            proration_behavior: 'create_prorations'
          }
        );
        return subscription;
      } else {
        // Create new subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          metadata: {
            userId: userId
          }
        });

        // Update user metadata with subscription ID
        await clerkClient.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            subscriptionId: subscription.id
          }
        });

        return subscription;
      }
    } catch (error) {
      console.error('Error creating/updating subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const stripe = getStripe();
      const subscription = await this.getCurrentSubscription(userId);
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      const canceledSubscription = await stripe.subscriptions.del(subscription.id);

      // Update user metadata
      const user = await clerkClient.users.getUser(userId);
      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          subscriptionId: null
        }
      });

      return canceledSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Get subscription usage
  async getSubscriptionUsage(userId) {
    try {
      const user = await clerkClient.users.getUser(userId);
      const tier = await this.getUserTier(userId);
      const limits = this.getTierLimits(tier);

      const usage = {
        charactersUsed: Number(user.publicMetadata.charactersUsed || 0),
        voiceClones: Number(user.publicMetadata.voiceClones || 0),
        requestsThisMinute: Number(user.publicMetadata.requestsThisMinute || 0),
        limits
      };

      return usage;
    } catch (error) {
      console.error('Error getting subscription usage:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
