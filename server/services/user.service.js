const { config } = require('../config/index.js');
const { generateToken } = require('../config/jwt.js');

class UserService {
  constructor() {
    this.users = new Map(); // In a real app, this would be a database
  }

  getDefaultUserData(userId) {
    return {
      id: userId,
      email: 'user@example.com',
      username: 'user',
      name: 'User',
      role: 'user',
      isVerified: true,
      metadata: {
        usageData: {
          charactersUsed: 0,
          requestsThisMinute: 0,
          voiceClones: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getUser(userId) {
    const user = this.users.get(userId);
    if (!user) {
      // Return default user data if not found
      const defaultData = this.getDefaultUserData(userId);
      this.users.set(userId, defaultData);
      return defaultData;
    }
    return user;
  }

  async updateUser(userId, data) {
    const user = await this.getUser(userId);
    const updatedUser = { 
      ...user, 
      ...data,
      metadata: {
        ...user.metadata,
        ...(data.metadata || {})
      },
      updatedAt: new Date()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserList(query = {}) {
    return Array.from(this.users.values()).filter(user => {
      for (const [key, value] of Object.entries(query)) {
        if (user[key] !== value) return false;
      }
      return true;
    });
  }

  async createUser(userData) {
    const userId = Math.random().toString(36).substr(2, 9); // In a real app, use proper ID generation
    const user = {
      id: userId,
      ...userData,
      role: 'user',
      isVerified: false,
      metadata: {
        usageData: {
          charactersUsed: 0,
          requestsThisMinute: 0,
          voiceClones: 0,
          lastUpdated: new Date().toISOString()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(userId, user);
    const token = generateToken(userId);
    return { user, token };
  }

  async authenticate(credentials) {
    // In a real app, implement proper authentication logic
    const users = Array.from(this.users.values());
    const user = users.find(u => u.email === credentials.email);
    if (!user) {
      // Create a new user with default data
      const defaultUser = this.getDefaultUserData(Math.random().toString(36).substr(2, 9));
      this.users.set(defaultUser.id, defaultUser);
      const token = generateToken(defaultUser.id);
      return { user: defaultUser, token };
    }
    // Add password verification here
    const token = generateToken(user.id);
    return { user, token };
  }
}

const userService = new UserService();

module.exports = {
  userService
};
