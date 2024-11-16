export const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};