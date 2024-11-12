const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Get user profile
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        usage: true,
        updates: true
      },
      defaultVoice: 'voice_1',
      defaultSettings: {
        pitch: 1.0,
        speed: 1.0,
        volume: 1.0
      }
    },
    subscription: {
      plan: 'pro',
      status: 'active',
      features: {
        maxStorage: 1024 * 1024 * 1024 * 10,
        maxRequests: 10000,
        maxAudioLength: 300
      }
    },
    usage: {
      storage: 1024 * 1024 * 100,
      requests: 150,
      audioGenerated: 50
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastLogin: new Date()
  });
});

// Update user profile
router.patch('/profile', requireAuth, (req, res) => {
  const updates = req.body;
  res.json({
    ...updates,
    id: '123',
    updatedAt: new Date()
  });
});

// Update preferences
router.patch('/preferences', requireAuth, (req, res) => {
  const { preferences } = req.body;
  res.json({
    preferences,
    updatedAt: new Date()
  });
});

// Get user activity
router.get('/activity', requireAuth, (req, res) => {
  res.json([
    {
      id: 'act_1',
      type: 'audio_generation',
      details: {
        text: 'Sample text',
        voice: 'Sarah',
        duration: 30
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'act_2',
      type: 'voice_creation',
      details: {
        name: 'Custom Voice 1',
        status: 'completed'
      },
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ]);
});

// Get user settings
router.get('/settings', requireAuth, (req, res) => {
  res.json({
    theme: 'dark',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      usage: true,
      updates: true
    },
    audio: {
      defaultVoice: 'voice_1',
      defaultQuality: 'high',
      autoPlay: true,
      defaultFormat: 'mp3'
    },
    interface: {
      sidebarCollapsed: false,
      denseMode: false,
      previewLength: 30
    }
  });
});

// Update user settings
router.patch('/settings', requireAuth, (req, res) => {
  const { settings } = req.body;
  res.json({
    settings,
    updatedAt: new Date()
  });
});

// Delete account
router.delete('/account', requireAuth, (req, res) => {
  res.status(200).json({
    message: 'Account deleted successfully',
    deletedAt: new Date()
  });
});

// Export user data
router.get('/export', requireAuth, (req, res) => {
  res.json({
    id: 'export_1',
    status: 'processing',
    url: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
});

module.exports = router;
