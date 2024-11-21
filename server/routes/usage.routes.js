const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { usageService } = require('../services/usage.service');

// Get usage stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userStats = await usageService.getUserUsageStats(userId);
    res.json(userStats);
  } catch (error) {
    console.error('Error getting usage stats:', error);
    // Return default stats if there's an error
    const defaultStats = {
      current: {
        charactersUsed: 0,
        requestsThisMinute: 0,
        voiceClones: 0
      },
      limits: {
        charactersPerMonth: 6000, // Free tier limits
        requestsPerMinute: 2,
        voiceClones: 0
      },
      remaining: {
        charactersPerMonth: 6000,
        requestsPerMinute: 2,
        voiceClones: 0
      },
      history: [],
      lastUpdated: new Date().toISOString()
    };
    res.json(defaultStats);
  }
});

// Update usage stats
router.post('/update', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, amount } = req.body;

    if (!type || amount === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: type or amount'
      });
    }

    const updatedStats = await usageService.updateUserUsage(userId, { [type]: amount });
    res.json(updatedStats);
  } catch (error) {
    console.error('Error updating usage stats:', error);
    res.status(500).json({
      error: 'Failed to update usage statistics',
      message: error.message
    });
  }
});

// Get detailed usage history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const history = await usageService.getUsageHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get current quota status
router.get('/quota', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await usageService.getUserUsageStats(userId);
    res.json({
      requestsUsed: stats.current.requestsThisMinute,
      requestsLimit: stats.limits.requestsPerMinute,
      storageUsed: stats.current.charactersUsed,
      storageLimit: stats.limits.charactersPerMonth,
      resetDate: new Date(new Date().setDate(1)).toISOString() // First day of next month
    });
  } catch (error) {
    console.error('Error getting quota status:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Track usage event
router.post('/track', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { eventType, metadata } = req.body;
    const stats = await usageService.getUserUsageStats(userId);
    res.json({
      tracked: true,
      timestamp: new Date().toLocaleString(),
      eventType,
      metadata,
      currentUsage: stats.current
    });
  } catch (error) {
    console.error('Error tracking usage event:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
