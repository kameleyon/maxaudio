const { userService } = require('./user.service.js');
const Stripe = require('stripe');

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

  getTierLimits(tier) {
    const limits = {
      free: {
        charactersPerMonth: 6000,
        requestsPerMinute: 2,
        voiceClones: 0
      },
      pro: {
        charactersPerMonth: 100000,
        requestsPerMinute: 10,
        voiceClones: 3
      },
      premium: {
        charactersPerMonth: 500000,
        requestsPerMinute: 30,
        voiceClones: 10
      }
    };

    return limits[tier] || limits.free;
  }

  getCurrentUsage(userId, type) {
    const key = this.getUsageKey(userId, type);
    return this.usageCache.get(key)?.amount || 0;
  }

  getUsageHistory(userId) {
    return this.usageHistory.get(userId) || [];
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
    const now = Date.now();
    const currentMinute = this.getCurrentMinute();

    // Clean up minute-based cache
    for (const [key, value] of this.usageCache.entries()) {
      const [, , minute] = key.split(':');
      if (Number(minute) < currentMinute) {
        this.usageCache.delete(key);
      }
    }

    // Clean up history older than 30 days
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    for (const [userId, history] of this.usageHistory.entries()) {
      const filteredHistory = history.filter(entry => 
        new Date(entry.date).getTime() > thirtyDaysAgo
      );
      if (filteredHistory.length === 0) {
        this.usageHistory.delete(userId);
      } else {
        this.usageHistory.set(userId, filteredHistory);
      }
    }
  }

  async getUserUsageStats(userId) {
    try {
      const user = await userService.getUser(userId);
      const tier = user.role || 'free';
      const limits = this.getTierLimits(tier);

      // Get current usage
      const currentUsage = {
        charactersUsed: Number(user.metadata?.usageData?.charactersUsed || 0),
        requestsThisMinute: this.getCurrentUsage(userId, 'api_request'),
        voiceClones: Number(user.metadata?.usageData?.voiceClones || 0)
      };

      // Calculate remaining
      const remaining = {
        charactersPerMonth: Math.max(0, limits.charactersPerMonth - currentUsage.charactersUsed),
        requestsPerMinute: Math.max(0, limits.requestsPerMinute - currentUsage.requestsThisMinute),
        voiceClones: Math.max(0, limits.voiceClones - currentUsage.voiceClones)
      };

      // Get usage history
      const history = this.getUsageHistory(userId);

      return {
        current: currentUsage,
        limits,
        remaining,
        history,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user usage stats:', error);
      // Return default stats if there's an error
      const limits = this.getTierLimits('free');
      return {
        current: {
          charactersUsed: 0,
          requestsThisMinute: 0,
          voiceClones: 0
        },
        limits,
        remaining: {
          charactersPerMonth: limits.charactersPerMonth,
          requestsPerMinute: limits.requestsPerMinute,
          voiceClones: limits.voiceClones
        },
        history: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async updateUserUsage(userId, usageData) {
    try {
      const user = await userService.getUser(userId);

      // Update cache for minute-based metrics
      if (usageData.requestsThisMinute) {
        const key = this.getUsageKey(userId, 'api_request');
        const currentAmount = this.getCurrentUsage(userId, 'api_request');
        this.usageCache.set(key, {
          amount: currentAmount + usageData.requestsThisMinute,
          timestamp: Date.now()
        });
      }

      // Update persistent usage data
      const currentUsage = user.metadata?.usageData || {};
      const updatedUsage = {
        ...currentUsage,
        charactersUsed: (currentUsage.charactersUsed || 0) + (usageData.charactersUsed || 0),
        voiceClones: (currentUsage.voiceClones || 0) + (usageData.voiceClones || 0),
        lastUpdated: new Date().toISOString()
      };

      await userService.updateUser(userId, {
        metadata: {
          ...user.metadata,
          usageData: updatedUsage
        }
      });

      // Update history
      const history = this.getUsageHistory(userId);
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = history.find(entry => entry.date === today);

      if (todayEntry) {
        Object.entries(usageData).forEach(([type, amount]) => {
          todayEntry[type] = (todayEntry[type] || 0) + amount;
        });
      } else {
        history.unshift({
          date: today,
          ...usageData
        });
      }

      this.usageHistory.set(userId, history.slice(0, 30)); // Keep last 30 days

      return this.getUserUsageStats(userId);
    } catch (error) {
      console.error('Error updating user usage:', error);
      throw error;
    }
  }
}

const usageService = new UsageService();

module.exports = {
  usageService
};
