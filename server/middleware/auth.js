import { clerkClient } from '@clerk/clerk-sdk-node';

export const auth = async (req, res, next) => {
  try {
    // Get the session token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the session token
    const session = await clerkClient.sessions.verifySession(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Add user ID to request object
    req.auth = {
      userId: session.userId,
      sessionId: session.id
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Export auth as requireAuth for backward compatibility
export const requireAuth = auth;
