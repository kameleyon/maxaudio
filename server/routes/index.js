
import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { audioRoutes } from './audio.routes.js';

export const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/audio', audioRoutes);
