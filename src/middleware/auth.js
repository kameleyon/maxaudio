import { verifyToken } from '../../server/config/jwt.js';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'No token provided'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired token'
        }
      });
    }

    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        message: 'Unauthorized access'
      }
    });
  }
};