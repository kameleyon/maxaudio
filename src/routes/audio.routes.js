import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const audioRoutes = Router();

audioRoutes.post('/generate', requireAuth, (req, res) => {
  res.json({ message: 'Audio generation endpoint' });
});