import { Router } from 'express';
import { ttsRoutes } from './tts.routes.js';
import { authRoutes } from './auth.routes.js';
import { audioRoutes } from './audio.routes.js';
import { publishRoutes } from './publish.routes.js';

export const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/tts', ttsRoutes);
router.use('/api/audio', audioRoutes);
router.use('/api/publish', publishRoutes);
