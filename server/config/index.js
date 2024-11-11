export const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    projectId: process.env.GOOGLE_PROJECT_ID
  },
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
