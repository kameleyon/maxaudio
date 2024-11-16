import { config } from '../config/index.js';
import { generateToken } from '../config/jwt.js';

class UserService {
  constructor() {
    this.users = new Map(); // In a real app, this would be a database
  }

  async getUser(userId) {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(userId, data) {
    const user = await this.getUser(userId);
    const updatedUser = { ...user, ...data };
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
      throw new Error('User not found');
    }
    // Add password verification here
    const token = generateToken(user.id);
    return { user, token };
  }
}

export const userService = new UserService();
