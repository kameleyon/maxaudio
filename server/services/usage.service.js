const { userService } = require('./user.service.js');
const { Usage } = require('../models/usage.model.js');
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
    // Initialize Redis or other caching mechanism if needed
    this.cleanupInterval = setInterval(() => this.cleanupCache(), 60000);
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

  async getCurrentUsage(userId, type) {
    try {
      const usage = await Usage.findOne({ userId });
      if (!usage) return 0;
      
      if (type === 'api_request') {
        return usage.current.requestsThisMinute;
      } else if (type === 'characters') {
        return usage.current.charactersUsed;
      } else if (type === 'voice_clones') {
        return usage.current.voiceClones;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return 0;
    }
  }

  async getUsageHistory(userId) {
    try {
      const usage = await Usage.findOne({ userId });
      return usage?.history || [];
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  async getUserUsageStats(userId) {
    try {
      const user = await userService.getUser(userId);
      const tier = user.role || 'free';
      const limits = this.getTierLimits(tier);

      // Get or create usage record
      let usage = await Usage.findOne({ userId });
      if (!usage) {
        usage = new Usage({
          userId,
          current: {
            charactersUsed: 0,
            requestsThisMinute: 0,
            voiceClones: 0
          },
          history: []
        });
        await usage.save();
      }

      // Calculate remaining
      const remaining = {
        charactersPerMonth: Math.max(0, limits.charactersPerMonth - usage.current.charactersUsed),
        requestsPerMinute: Math.max(0, limits.requestsPerMinute - usage.current.requestsThisMinute),
        voiceClones: Math.max(0, limits.voiceClones - usage.current.voiceClones)
      };

      return {
        current: usage.current,
        limits,
        remaining,
        history: usage.history,
        lastUpdated: usage.lastUpdated
      };
    } catch (error) {
      console.error('Error getting user usage stats:', error);
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
        lastUpdated: new Date()
      };
    }
  }

  async updateUserUsage(userId, updates) {
    try {
      let usage = await Usage.findOne({ userId });
      if (!usage) {
        usage = new Usage({ userId });
      }

      // Update usage values
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'api_request') {
          usage.current.requestsThisMinute = value;
        } else if (key === 'characters') {
          usage.current.charactersUsed = value;
        } else if (key === 'voice_clones') {
          usage.current.voiceClones = value;
        }
      }

      // Update history
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const historyIndex = usage.history.findIndex(h => 
        h.date.getTime() === today.getTime()
      );

      if (historyIndex === -1) {
        usage.history.push({
          date: today,
          requests: usage.current.requestsThisMinute,
          storage: usage.current.charactersUsed
        });
      } else {
        usage.history[historyIndex] = {
          date: today,
          requests: usage.current.requestsThisMinute,
          storage: usage.current.charactersUsed
        };
      }

      usage.lastUpdated = new Date();
      await usage.save();
      return usage;
    } catch (error) {
      console.error('Error updating user usage:', error);
      throw error;
    }
  }

  async cleanupCache() {
    try {
      // Get all usage records
      const usages = await Usage.find({});
      
      // Reset requestsThisMinute for all users
      for (const usage of usages) {
        usage.current.requestsThisMinute = 0;
        await usage.save();
      }
    } catch (error) {
      console.error('Error cleaning up usage cache:', error);
    }
  }
}

const usageService = new UsageService();

module.exports = {
  usageService
};
