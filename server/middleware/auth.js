const requireAuth = (req, res, next) => {
  // Mock authentication for development
  req.user = {
    id: '123',
    email: 'test@example.com',
    role: 'user'
  };
  next();
};

const requireAdmin = (req, res, next) => {
  // Mock admin authentication for development
  req.user = {
    id: '123',
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};
