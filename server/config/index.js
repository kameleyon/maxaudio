const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    subscriptionTiers: {
      pro: {
        requestsPerMinute: 15,
        charactersPerMonth: 1000000,
        voiceClones: 3
      },
      premium: {
        requestsPerMinute: 30,
        charactersPerMonth: 3000000,
        voiceClones: 10
      }
    }
  },
  usage: {
    retryAttempts: 3,
    retryDelayMs: 1000,
    cacheCleanupInterval: 60000, // 1 minute
    historyRetentionDays: 30,
    defaultLimits: {
      requestsPerMinute: 5,
      charactersPerMonth: 10000,
      voiceClones: 0
    }
  }
};

module.exports = {
  config
};
