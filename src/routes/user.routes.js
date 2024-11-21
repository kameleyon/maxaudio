import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

export const userRoutes = Router();

userRoutes.get('/profile', requireAuth, (req, res) => {
  res.json({ message: 'Profile route' });
});