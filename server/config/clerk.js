// Mock Clerk for development
const mockClerk = {
  users: {
    getUser: async (userId) => ({
      id: userId,
      publicMetadata: {
        usage: {
          charactersUsed: 0,
          requestsThisMinute: 0,
          voiceClones: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }),
    updateUser: async (userId, data) => ({
      id: userId,
      ...data
    })
  }
};

module.exports = mockClerk;
