import { usageService } from '../services/usage.service.js';
import { subscriptionService } from '../services/subscription.service.js';

// Middleware to validate subscription status
export async function validateSubscription(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await subscriptionService.getCurrentSubscription(userId);
    if (!subscription) {
      return res.status(403).json({
        error: 'No active subscription',
        details: 'Please subscribe to access this feature',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    if (subscription.status === 'past_due') {
      return res.status(402).json({
        error: 'Subscription payment required',
        details: 'Your subscription payment is past due',
        code: 'PAYMENT_REQUIRED'
      });
    }

    // Attach subscription info to request
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error validating subscription:', error);
    return res.status(500).json({
      error: 'Failed to validate subscription',
      details: error.message,
      code: 'SUBSCRIPTION_ERROR'
    });
  }
}

// Middleware to track and enforce API request limits
export async function trackApiUsage(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usage = await usageService.trackRequest(userId);
    
    if (!usage.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: `Limited to ${usage.limit} requests per minute. Please try again in ${Math.ceil(60 - (Date.now() / 1000 % 60))} seconds.`,
        code: 'RATE_LIMIT_EXCEEDED',
        limit: usage.limit,
        current: usage.current,
        remaining: usage.remaining,
        resetIn: 60 - (Date.now() / 1000 % 60) // Seconds until next minute
      });
    }

    // Attach usage info to request for logging
    req.usage = usage;
    next();
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return res.status(500).json({
      error: 'Failed to track API usage',
      details: error.message,
      code: 'USAGE_TRACKING_ERROR'
    });
  }
}

// Middleware to track and enforce character usage
export async function trackCharacterUsage(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const characterCount = req.body.text?.length || 0;
    const usage = await usageService.trackCharacters(userId, characterCount);
    
    if (!usage.allowed) {
      const upgradeInfo = await subscriptionService.getUpgradeOptions(userId);
      return res.status(429).json({
        error: 'Monthly character limit exceeded',
        details: `You've used ${usage.current.toLocaleString()} of ${usage.limit.toLocaleString()} characters this month.`,
        code: 'CHARACTER_LIMIT_EXCEEDED',
        limit: usage.limit,
        current: usage.current,
        remaining: usage.remaining,
        upgradeOptions: upgradeInfo
      });
    }

    // Attach usage info to request for logging
    req.characterUsage = usage;
    next();
  } catch (error) {
    console.error('Error tracking character usage:', error);
    return res.status(500).json({
      error: 'Failed to track character usage',
      details: error.message,
      code: 'CHARACTER_TRACKING_ERROR'
    });
  }
}

// Middleware to track and enforce voice clone usage
export async function trackVoiceCloneUsage(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const usage = await usageService.trackVoiceClone(userId);
    
    if (!usage.allowed) {
      const upgradeInfo = await subscriptionService.getUpgradeOptions(userId);
      return res.status(429).json({
        error: 'Voice clone limit exceeded',
        details: `You've used ${usage.current} of ${usage.limit} voice clones.`,
        code: 'VOICE_CLONE_LIMIT_EXCEEDED',
        limit: usage.limit,
        current: usage.current,
        remaining: usage.remaining,
        upgradeOptions: upgradeInfo
      });
    }

    // Attach usage info to request for logging
    req.voiceCloneUsage = usage;
    next();
  } catch (error) {
    console.error('Error tracking voice clone usage:', error);
    return res.status(500).json({
      error: 'Failed to track voice clone usage',
      details: error.message,
      code: 'VOICE_CLONE_TRACKING_ERROR'
    });
  }
}

// Middleware to check feature access
export async function checkFeatureAccess(featureName) {
  return async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const subscription = req.subscription || await subscriptionService.getCurrentSubscription(userId);
      const hasAccess = subscription.features.some(f => f.name === featureName && f.included);

      if (!hasAccess) {
        const upgradeInfo = await subscriptionService.getUpgradeOptions(userId);
        return res.status(403).json({
          error: 'Feature not available',
          details: `The ${featureName} feature is not included in your current plan.`,
          code: 'FEATURE_NOT_AVAILABLE',
          feature: featureName,
          upgradeOptions: upgradeInfo
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      return res.status(500).json({
        error: 'Failed to check feature access',
        details: error.message,
        code: 'FEATURE_CHECK_ERROR'
      });
    }
  };
}

// Middleware to check overall usage statistics
export async function attachUsageStats(req, res, next) {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await usageService.getUsageStats(userId);
    
    // Attach usage stats to request
    req.usageStats = stats;
    next();
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return res.status(500).json({
      error: 'Failed to get usage statistics',
      details: error.message,
      code: 'USAGE_STATS_ERROR'
    });
  }
}

// Helper middleware to handle usage errors
export function handleUsageError(error, req, res, next) {
  if (error.type === 'usage_limit_exceeded') {
    return res.status(429).json({
      error: error.message,
      details: error.details || 'Usage limit exceeded',
      code: error.code || 'USAGE_LIMIT_EXCEEDED',
      limit: error.limit,
      current: error.current,
      remaining: error.remaining,
      resetIn: error.resetIn,
      upgradeOptions: error.upgradeOptions
    });
  }
  next(error);
}
