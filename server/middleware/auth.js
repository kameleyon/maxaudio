import clerk from '../config/clerk.js';

const auth = async (req, res, next) => {
  try {
    // Get the session token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'UNAUTHORIZED',
        details: 'Authentication token is required'
      });
    }

    try {
      // Verify the session token with Clerk
      const session = await clerk.sessions.verifySession(token);
      
      // Get the user data
      const user = await clerk.users.getUser(session.userId);
      
      // Add user ID, session info, and user data to request object
      req.auth = {
        userId: session.userId,
        sessionId: session.id,
        session,
        user
      };

      next();
    } catch (verifyError) {
      console.error('Session verification error:', verifyError);
      return res.status(401).json({ 
        error: 'Invalid session',
        code: 'UNAUTHORIZED',
        details: 'Session verification failed'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      code: 'UNAUTHORIZED',
      details: 'An error occurred during authentication'
    });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // First run the basic auth check
    await auth(req, res, async () => {
      const { user } = req.auth;
      
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          code: 'UNAUTHORIZED',
          details: 'No user information available'
        });
      }

      const metadata = user.publicMetadata;

      // Verify admin role
      if (metadata?.role !== 'admin') {
        return res.status(403).json({
          error: 'Admin role required',
          code: 'UNAUTHORIZED',
          details: 'User does not have admin privileges'
        });
      }

      // Verify team membership
      if (!metadata?.teamId) {
        return res.status(403).json({
          error: 'Team membership required',
          code: 'UNAUTHORIZED',
          details: 'User is not associated with any team'
        });
      }

      // Verify admin permissions
      const userPermissions = metadata?.permissions || [];
      if (!Array.isArray(userPermissions) || !userPermissions.includes('admin:access')) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'UNAUTHORIZED',
          details: 'User lacks required admin permissions'
        });
      }

      // Add admin metadata to request object
      req.admin = {
        role: metadata.role,
        accessLevel: metadata.accessLevel || 'basic',
        teamId: metadata.teamId,
        permissions: userPermissions
      };

      next();
    });
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({
      error: 'Admin authorization failed',
      code: 'SERVER_ERROR',
      details: 'An error occurred during admin authorization'
    });
  }
};

const requireAccessLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      // First check admin status
      await requireAdmin(req, res, () => {
        const accessLevels = {
          basic: 0,
          moderate: 1,
          full: 2
        };

        const userLevel = req.admin.accessLevel || 'basic';

        if (accessLevels[userLevel] < accessLevels[requiredLevel]) {
          return res.status(403).json({
            error: 'Insufficient access level',
            code: 'UNAUTHORIZED',
            details: `Required access level: ${requiredLevel}`
          });
        }

        next();
      });
    } catch (error) {
      console.error('Access level verification error:', error);
      res.status(500).json({
        error: 'Access level verification failed',
        code: 'SERVER_ERROR',
        details: 'An error occurred during access level verification'
      });
    }
  };
};

// Export both named and default for flexibility
export { auth, requireAdmin, requireAccessLevel };
export default auth;
