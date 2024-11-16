const jwt = require('jsonwebtoken');
const { userService } = require('../services/user.service');

const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Try to get token from cookie
      const token = req.cookies?.refreshToken;
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // Verify refresh token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId
      };
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID to request
    req.user = {
      userId: decoded.userId
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

    // Get user to check role
    const user = await userService.getUser(req.user.userId);
    if (user.role !== 'admin') {
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

    req.user = {
      userId: decoded.userId
    };

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
