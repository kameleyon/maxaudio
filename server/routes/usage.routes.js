import { Router } from 'express';
import { usageService } from '../services/usage.service.js';
import { auth } from '../middleware/auth.js';
import { verifySubscription } from '../middleware/stripe-webhook.js';

const router = Router();

// Get usage statistics
router.get('/stats', auth, verifySubscription, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await usageService.getUsageStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Track character usage
router.post('/track/characters', auth, verifySubscription, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const { characterCount } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof characterCount !== 'number' || characterCount <= 0) {
      return res.status(400).json({ error: 'Invalid character count' });
    }

    const result = await usageService.trackCharacters(userId, characterCount);
    res.json(result);
  } catch (error) {
    console.error('Error tracking character usage:', error);
    res.status(500).json({ error: 'Failed to track character usage' });
  }
});

// Track voice clone usage
router.post('/track/voice-clone', auth, verifySubscription, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await usageService.trackVoiceClone(userId);
    res.json(result);
  } catch (error) {
    console.error('Error tracking voice clone:', error);
    res.status(500).json({ error: 'Failed to track voice clone' });
  }
});

// Get usage trends
router.get('/trends', auth, verifySubscription, async (req, res) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await usageService.getUsageTrends(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching usage trends:', error);
    res.status(500).json({ error: 'Failed to fetch usage trends' });
  }
});

export const usageRoutes = router;
