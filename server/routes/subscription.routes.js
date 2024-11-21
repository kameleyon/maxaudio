const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const subscriptionService = require('../services/subscription.service');
const notificationService = require('../services/notification.service');

// Get subscription status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscription(req.user.id);
    res.json(subscription || {
      status: 'inactive',
      plan: 'free',
      features: {
        maxStorage: 1024 * 1024 * 100, // 100MB
        maxRequests: 100,
        maxAudioLength: 60, // 1 minute
        voiceCloning: false,
        customVoices: false,
        priority: false
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get payment methods
router.get('/payment-methods', requireAuth, async (req, res) => {
  try {
    const methods = await subscriptionService.getPaymentMethods(req.user.id);
    res.json(methods);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Get payment history
router.get('/payment-history', requireAuth, async (req, res) => {
  try {
    const { status, startDate, endDate, limit } = req.query;
    const payments = await subscriptionService.getPaymentHistory(req.user.id, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined
    });
    res.json(payments);
  } catch (error) {
    console.error('Error getting payment history:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Update payment method
router.post('/payment-methods', requireAuth, async (req, res) => {
  try {
    const { paymentMethodId, isDefault } = req.body;
    await subscriptionService.updatePaymentMethod(
      req.user.id,
      paymentMethodId,
      isDefault
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Remove payment method
router.delete('/payment-methods/:methodId', requireAuth, async (req, res) => {
  try {
    await subscriptionService.removePaymentMethod(req.user.id, req.params.methodId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: 'Failed to remove payment method' });
  }
});

// Get notification preferences
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const preferences = await notificationService.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ error: 'Failed to get notification preferences' });
  }
});

// Update notification preferences
router.put('/notifications', requireAuth, async (req, res) => {
  try {
    const { preferences } = req.body;
    await notificationService.updateNotificationPreferences(req.user.id, preferences);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Get usage statistics
router.get('/usage', requireAuth, async (req, res) => {
  try {
    const user = await subscriptionService.getUser(req.user.id);
    const subscription = await subscriptionService.getSubscription(req.user.id);

    const usage = {
      ...user.usage,
      limits: subscription?.features || {
        maxStorage: 1024 * 1024 * 100, // 100MB
        maxRequests: 100,
        maxAudioLength: 60 // 1 minute
      },
      percentages: {
        storage: (user.usage.storage / (subscription?.features?.maxStorage || 1024 * 1024 * 100)) * 100,
        requests: (user.usage.requests / (subscription?.features?.maxRequests || 100)) * 100
      }
    };

    // Check if we need to send usage warnings
    if (usage.percentages.storage >= 90) {
      await notificationService.sendUsageLimitWarning(
        req.user.id,
        'storage',
        user.usage.storage,
        subscription?.features?.maxStorage || 1024 * 1024 * 100
      );
    }

    if (usage.percentages.requests >= 90) {
      await notificationService.sendUsageLimitWarning(
        req.user.id,
        'requests',
        user.usage.requests,
        subscription?.features?.maxRequests || 100
      );
    }

    res.json(usage);
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Check feature access
router.get('/features/:feature', requireAuth, async (req, res) => {
  try {
    const user = await subscriptionService.getUser(req.user.id);
    const hasAccess = user.canAccess(req.params.feature);
    res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

// Check usage limits
router.get('/limits', requireAuth, async (req, res) => {
  try {
    const user = await subscriptionService.getUser(req.user.id);
    const withinLimits = user.withinUsageLimits();
    res.json({ withinLimits });
  } catch (error) {
    console.error('Error checking usage limits:', error);
    res.status(500).json({ error: 'Failed to check usage limits' });
  }
});

// Update usage
router.post('/usage/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { amount } = req.body;

    const user = await subscriptionService.getUser(req.user.id);
    await user.updateUsage(type, amount);

    // Check if we need to send a warning
    const subscription = await subscriptionService.getSubscription(req.user.id);
    const limit = subscription?.features?.[`max${type.charAt(0).toUpperCase() + type.slice(1)}`] || 
      (type === 'storage' ? 1024 * 1024 * 100 : 100);

    if ((user.usage[type] / limit) >= 0.9) {
      await notificationService.sendUsageLimitWarning(
        req.user.id,
        type,
        user.usage[type],
        limit
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating usage:', error);
    res.status(500).json({ error: 'Failed to update usage' });
  }
});

module.exports = router;
