import { clerkClient } from '@clerk/clerk-sdk-node';
import Stripe from 'stripe';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Initialize Stripe with a function to ensure environment variables are loaded
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

class UsageService {
  constructor() {
    // In-memory cache with TTL
    this.usageCache = new Map();
    this.usageHistory = new Map();
    // Clean up cache every minute
    setInterval(() => this.cleanupCache(), 60000);
  }

  // Retry mechanism for operations
  async retryOperation(operation, maxAttempts = MAX_RETRY_ATTEMPTS) {
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

    // Clean up history older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    for (const [key, value] of this.usageHistory.entries()) {
      if (value.timestamp < thirtyDaysAgo) {
        this.usageHistory.delete(key);
      }
    }
  }

  // Update user usage data
  async updateUserUsage(userId, usageData) {
    return this.retryOperation(async () => {
      const user = await clerkClient.users.getUser(userId);
      const currentUsage = user.publicMetadata.usage || {};
      
      const updatedUsage = {
        ...currentUsage,
        ...usageData,
        lastUpdated: new Date().toISOString()
      };

      await clerkClient.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          usage: updatedUsage
        }
      });

      // Store in history for trending
      const historyKey = `${userId}:${new Date().toISOString()}`;
      this.usageHistory.set(historyKey, {
        ...updatedUsage,
        timestamp: Date.now()
      });

      return updatedUsage;
    });
  }

  // Track API request with improved caching
  async trackRequest(userId) {
    return this.retryOperation(async () => {
      const key = this.getUsageKey(userId, 'api_request');
      const currentCount = this.usageCache.get(key) || 0;
      this.usageCache.set(key, currentCount + 1);
      
      const user = await clerkClient.users.getUser(userId);
      const subscriptionId = user.publicMetadata.subscriptionId;
      
      if (!subscriptionId) {
        throw new Error('No active subscription');
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const tier = subscription.items.data[0].price.lookup_key;
      
      const limits = {
        pro: 15,
        premium: 30
      };

      const limit = limits[tier] || 5;
      
      // Update usage history
      await this.updateUserUsage(userId, {
        requestsThisMinute: currentCount + 1,
        lastRequestTime: new Date().toISOString()
      });

      return {
        allowed: currentCount < limit,
        current: currentCount + 1,
        limit,
        remaining: Math.max(0, limit - (currentCount + 1))
      };
    });
  }

  // Track character usage with history
  async trackCharacters(userId, characterCount) {
    return this.retryOperation(async () => {
      const user = await clerkClient.users.getUser(userId);
      const currentUsage = Number(user.publicMetadata.charactersUsed || 0);
      const newUsage = currentUsage + characterCount;

      const subscriptionId = user.publicMetadata.subscriptionId;
      if (!subscriptionId) {
        throw new Error('No active subscription');
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const tier = subscription.items.data[0].price.lookup_key;
      
      const limits = {
        pro: 1000000,
        premium: 3000000
      };

      const limit = limits[tier] || 10000;

      // Update usage with history
      await this.updateUserUsage(userId, {
        charactersUsed: newUsage,
        lastCharacterUpdate: new Date().toISOString()
      });

      return {
        allowed: newUsage <= limit,
        current: newUsage,
        limit,
        remaining: Math.max(0, limit - newUsage)
      };
    });
  }

  // Track voice clone usage with history
  async trackVoiceClone(userId) {
    return this.retryOperation(async () => {
      const user = await clerkClient.users.getUser(userId);
      const currentClones = Number(user.publicMetadata.voiceClones || 0);
      const newCount = currentClones + 1;

      const subscriptionId = user.publicMetadata.subscriptionId;
      if (!subscriptionId) {
        throw new Error('No active subscription');
      }

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const tier = subscription.items.data[0].price.lookup_key;
      
      const limits = {
        pro: 3,
        premium: 10
      };

      const limit = limits[tier] || 0;

      // Update usage with history
      await this.updateUserUsage(userId, {
        voiceClones: newCount,
        lastCloneUpdate: new Date().toISOString()
      });

      return {
        allowed: newCount <= limit,
        current: newCount,
        limit,
        remaining: Math.max(0, limit - newCount)
      };
    });
  }

  // Reset monthly usage with history tracking
  async resetMonthlyUsage(userId) {
    return this.retryOperation(async () => {
      const user = await clerkClient.users.getUser(userId);
      const previousUsage = user.publicMetadata.usage || {};
      
      // Store previous usage in history before reset
      const historyKey = `${userId}:${new Date().toISOString()}:reset`;
      this.usageHistory.set(historyKey, {
        ...previousUsage,
        timestamp: Date.now(),
        type: 'reset'
      });

      await this.updateUserUsage(userId, {
        charactersUsed: 0,
        requestsThisMinute: 0,
        lastResetDate: new Date().toISOString()
      });
    });
  }

  // Get usage trends
  async getUsageTrends(userId) {
    const trends = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    };

    // Filter history entries for this user
    const userHistory = Array.from(this.usageHistory.entries())
      .filter(([key]) => key.startsWith(userId))
      .map(([, value]) => value)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate daily averages
    const dailyUsage = new Map();
    for (const entry of userHistory) {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!dailyUsage.has(date)) {
        dailyUsage.set(date, {
          charactersUsed: 0,
          requestCount: 0,
          voiceClones: 0
        });
      }
      const current = dailyUsage.get(date);
      dailyUsage.set(date, {
        charactersUsed: Math.max(current.charactersUsed, entry.charactersUsed || 0),
        requestCount: current.requestCount + (entry.requestsThisMinute || 0),
        voiceClones: Math.max(current.voiceClones, entry.voiceClones || 0)
      });
    }

    return {
      daily: Array.from(dailyUsage.entries()).map(([date, usage]) => ({
        date,
        ...usage
      })),
      averages: {
        charactersPerDay: Array.from(dailyUsage.values())
          .reduce((sum, day) => sum + day.charactersUsed, 0) / dailyUsage.size,
        requestsPerDay: Array.from(dailyUsage.values())
          .reduce((sum, day) => sum + day.requestCount, 0) / dailyUsage.size
      }
    };
  }

  // Get current usage statistics with trends
  async getUsageStats(userId) {
    return this.retryOperation(async () => {
      const user = await clerkClient.users.getUser(userId);
      const subscriptionId = user.publicMetadata.subscriptionId;
      
      if (!subscriptionId) {
        throw new Error('No active subscription');
      }

      const stripe = getStripe();
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
        charactersUsed: Number(user.publicMetadata.usage?.charactersUsed || 0),
        voiceClones: Number(user.publicMetadata.usage?.voiceClones || 0),
        requestsThisMinute: this.usageCache.get(this.getUsageKey(userId, 'api_request')) || 0
      };

      // Get usage trends
      const trends = await this.getUsageTrends(userId);

      return {
        current: currentUsage,
        limits: tierLimits,
        remaining: {
          charactersPerMonth: Math.max(0, tierLimits.charactersPerMonth - currentUsage.charactersUsed),
          voiceClones: Math.max(0, tierLimits.voiceClones - currentUsage.voiceClones),
          requestsPerMinute: Math.max(0, tierLimits.requestsPerMinute - currentUsage.requestsThisMinute)
        },
        trends,
        lastUpdated: new Date().toISOString()
      };
    });
  }
}

export const usageService = new UsageService();

// Export the updateUserUsage function for use in webhook middleware
export const updateUserUsage = (userId, usageData) => usageService.updateUserUsage(userId, usageData);
