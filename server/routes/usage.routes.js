const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { usageService } = require('../services/usage.service');

// Get usage stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // For development, return mock data since Clerk is not configured
    res.json({
      totalRequests: 100,
      audioGenerated: 50,
      storageUsed: 1024 * 1024 * 100, // 100MB
      lastRequest: new Date(),
      quotaRemaining: 1000,
      usageHistory: [
        {
          date: new Date(Date.now() - 86400000), // yesterday
          requests: 45,
          storage: 1024 * 1024 * 50
        },
        {
          date: new Date(Date.now() - 86400000 * 2), // 2 days ago
          requests: 35,
          storage: 1024 * 1024 * 40
        },
        {
          date: new Date(Date.now() - 86400000 * 3), // 3 days ago
          requests: 20,
          storage: 1024 * 1024 * 30
        }
      ],
      limits: {
        maxRequests: 1000,
        maxStorage: 1024 * 1024 * 1024, // 1GB
        maxAudioLength: 300, // 5 minutes
        maxFileSize: 1024 * 1024 * 50 // 50MB
      },
      subscription: {
        plan: 'pro',
        status: 'active',
        nextBilling: new Date(Date.now() + 86400000 * 30)
      }
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get detailed usage history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    // Mock response with detailed history
    res.json([
      {
        date: new Date(Date.now() - 86400000),
        requests: 45,
        storage: 1024 * 1024 * 50,
        audioGenerated: 20,
        averageAudioLength: 120,
        peakUsageTime: '14:00',
        errorRate: 0.02
      },
      {
        date: new Date(Date.now() - 86400000 * 2),
        requests: 35,
        storage: 1024 * 1024 * 40,
        audioGenerated: 15,
        averageAudioLength: 90,
        peakUsageTime: '15:30',
        errorRate: 0.01
      }
    ]);
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
    res.json({
      requestsUsed: 100,
      requestsLimit: 1000,
      storageUsed: 1024 * 1024 * 100,
      storageLimit: 1024 * 1024 * 1024,
      resetDate: new Date(Date.now() + 86400000 * 15)
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
    const { eventType, metadata } = req.body;
    // Mock response
    res.json({
      tracked: true,
      timestamp: new Date(),
      eventType,
      metadata
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
