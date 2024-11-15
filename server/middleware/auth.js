const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model');

const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // First run the auth middleware
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    // If requireAuth already sent a response, we don't need to send another
    if (!res.headersSent) {
      console.error('Admin middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Optional auth middleware - doesn't require authentication but will process token if present
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just proceed without user
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};
