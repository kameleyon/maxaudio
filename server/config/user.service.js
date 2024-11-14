const User = require('../models/user.model');

class UserService {
  async getUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        metadata: {
          usage: {
            charactersUsed: user.usage?.charactersUsed || 0,
            requestsThisMinute: user.usage?.requestsThisMinute || 0,
            voiceClones: user.usage?.voiceClones || 0,
            lastUpdated: user.usage?.lastUpdated || new Date().toISOString()
          },
          preferences: user.preferences || {},
          subscription: user.subscription || { tier: 'free' }
        }
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async updateUser(userId, data) {
    try {
      const updateData = {};

      // Handle usage updates
      if (data.usage) {
        updateData['usage'] = {
          ...data.usage,
          lastUpdated: new Date().toISOString()
        };
      }

      // Handle preference updates
      if (data.preferences) {
        updateData['preferences'] = data.preferences;
      }

      // Handle subscription updates
      if (data.subscription) {
        updateData['subscription'] = data.subscription;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        metadata: {
          usage: user.usage,
          preferences: user.preferences,
          subscription: user.subscription
        }
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUsage(userId, usageData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get current usage
      const currentUsage = user.usage || {
        charactersUsed: 0,
        requestsThisMinute: 0,
        voiceClones: 0,
        lastUpdated: new Date().toISOString()
      };

      // Update usage data
      const newUsage = {
        charactersUsed: (currentUsage.charactersUsed || 0) + (usageData.charactersUsed || 0),
        requestsThisMinute: usageData.requestsThisMinute || currentUsage.requestsThisMinute || 0,
        voiceClones: (currentUsage.voiceClones || 0) + (usageData.voiceClones || 0),
        lastUpdated: new Date().toISOString()
      };

      // Update user with new usage data
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { usage: newUsage } },
        { new: true }
      );

      return {
        id: updatedUser._id,
        usage: updatedUser.usage
      };
    } catch (error) {
      console.error('Error updating usage:', error);
      throw error;
    }
  }

  async resetRequestCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Reset requests per minute count
      const usage = user.usage || {};
      usage.requestsThisMinute = 0;
      usage.lastUpdated = new Date().toISOString();

      await User.findByIdAndUpdate(
        userId,
        { $set: { usage } },
        { new: true }
      );

      return true;
    } catch (error) {
      console.error('Error resetting request count:', error);
      throw error;
    }
  }

  async checkUsageLimits(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const usage = user.usage || {
        charactersUsed: 0,
        requestsThisMinute: 0,
        voiceClones: 0
      };

      const subscription = user.subscription || { tier: 'free' };
      const limits = this.getTierLimits(subscription.tier);

      return {
        withinLimits: {
          characters: usage.charactersUsed < limits.charactersPerMonth,
          requests: usage.requestsThisMinute < limits.requestsPerMinute,
          voiceClones: usage.voiceClones < limits.voiceClones
        },
        usage,
        limits
      };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      throw error;
    }
  }

  getTierLimits(tier) {
    const limits = {
      free: {
        charactersPerMonth: 100000,
        requestsPerMinute: 10,
        voiceClones: 3
      },
      pro: {
        charactersPerMonth: 1000000,
        requestsPerMinute: 30,
        voiceClones: 10
      },
      premium: {
        charactersPerMonth: -1, // unlimited
        requestsPerMinute: 100,
        voiceClones: -1 // unlimited
      }
    };

    return limits[tier] || limits.free;
  }
}

module.exports = new UserService();
