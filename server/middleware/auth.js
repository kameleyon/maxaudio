const requireAuth = (req, res, next) => {
  // Mock authentication for development with valid MongoDB ObjectId format
  req.user = {
    id: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
    email: 'test@example.com',
    role: 'user'
  };
  next();
};

const requireAdmin = (req, res, next) => {
  // Mock admin authentication for development with valid MongoDB ObjectId format
  req.user = {
    id: '507f1f77bcf86cd799439012', // Valid MongoDB ObjectId format
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
