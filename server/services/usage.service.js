import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class UsageService {
  constructor() {
    // In-memory cache for rate limiting
    this.usageCache = new Map();
    // Clean up cache every minute
    setInterval(() => this.cleanupCache(), 60000);
  }

  // Get usage key for rate limiting
  getUsageKey(userId, type) {
    return `${userId}:${type}:${this.getCurrentMinute()}`;
  }

  // Get current minute for rate limiting
  getCurrentMinute() {
    return Math.floor(Date.now() / 60000);
  }

  // Clean up expired cache entries
  cleanupCache() {
    const currentMinute = this.getCurrentMinute();
    for (const [key, value] of this.usageCache.entries()) {
      const [, , minute] = key.split(':');
      if (Number(minute) < currentMinute) {
        this.usageCache.delete(key);
      }
    }
  }

  // Track API request
  async trackRequest(userId) {
    const key = this.getUsageKey(userId, 'api_request');
    const currentCount = this.usageCache.get(key) || 0;
    this.usageCache.set(key, currentCount + 1);
    
    // Get user's subscription limits
    const user = await clerkClient.users.getUser(userId);
    const subscriptionId = user.publicMetadata.subscriptionId;
    
    if (!subscriptionId) {
      throw new Error('No active subscription');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = subscription.items.data[0].price.lookup_key;
    
    const limits = {
      pro: 15,
      premium: 30
    };

    const limit = limits[tier] || 5;
    
    return {
      allowed: currentCount < limit,
      current: currentCount + 1,
      limit,
      remaining: Math.max(0, limit - (currentCount + 1))
    };
  }

  // Track character usage
  async trackCharacters(userId, characterCount) {
    const user = await clerkClient.users.getUser(userId);
    const currentUsage = Number(user.publicMetadata.charactersUsed || 0);
    const newUsage = currentUsage + characterCount;

    // Get subscription limits
    const subscriptionId = user.publicMetadata.subscriptionId;
    if (!subscriptionId) {
      throw new Error('No active subscription');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = subscription.items.data[0].price.lookup_key;
    
    const limits = {
      pro: 1000000,
      premium: 3000000
    };

    const limit = limits[tier] || 10000;

    // Update usage in user metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        charactersUsed: newUsage
      }
    });

    return {
      allowed: newUsage <= limit,
      current: newUsage,
      limit,
      remaining: Math.max(0, limit - newUsage)
    };
  }

  // Track voice clone usage
  async trackVoiceClone(userId) {
    const user = await clerkClient.users.getUser(userId);
    const currentClones = Number(user.publicMetadata.voiceClones || 0);
    const newCount = currentClones + 1;

    // Get subscription limits
    const subscriptionId = user.publicMetadata.subscriptionId;
    if (!subscriptionId) {
      throw new Error('No active subscription');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = subscription.items.data[0].price.lookup_key;
    
    const limits = {
      pro: 3,
      premium: 10
    };

    const limit = limits[tier] || 0;

    // Update usage in user metadata
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        voiceClones: newCount
      }
    });

    return {
      allowed: newCount <= limit,
      current: newCount,
      limit,
      remaining: Math.max(0, limit - newCount)
    };
  }

  // Reset monthly usage (called by webhook on billing cycle)
  async resetMonthlyUsage(userId) {
    const user = await clerkClient.users.getUser(userId);
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        charactersUsed: 0
      }
    });
  }

  // Get current usage statistics
  async getUsageStats(userId) {
    const user = await clerkClient.users.getUser(userId);
    const subscriptionId = user.publicMetadata.subscriptionId;
    
    if (!subscriptionId) {
      throw new Error('No active subscription');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const tier = subscription.items.data[0].price.lookup_key;
    
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
      }
    };

    const tierLimits = limits[tier] || {
      requestsPerMinute: 5,
      charactersPerMonth: 10000,
      voiceClones: 0
    };

    const currentUsage = {
      charactersUsed: Number(user.publicMetadata.charactersUsed || 0),
      voiceClones: Number(user.publicMetadata.voiceClones || 0),
      requestsThisMinute: this.usageCache.get(this.getUsageKey(userId, 'api_request')) || 0
    };

    return {
      current: currentUsage,
      limits: tierLimits,
      remaining: {
        charactersPerMonth: Math.max(0, tierLimits.charactersPerMonth - currentUsage.charactersUsed),
        voiceClones: Math.max(0, tierLimits.voiceClones - currentUsage.voiceClones),
        requestsPerMinute: Math.max(0, tierLimits.requestsPerMinute - currentUsage.requestsThisMinute)
      }
    };
  }
}

export const usageService = new UsageService();
