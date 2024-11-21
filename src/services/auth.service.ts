import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    language: string;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

class AuthService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      this.setToken(token);
      return { token, user };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Login failed');
      }
      throw new Error('Network error occurred');
    }
  }

  async register(email: string, password: string, username: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        username
      });

      const { token, user } = response.data;
      this.setToken(token);
      return { token, user };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Registration failed');
      }
      throw new Error('Network error occurred');
    }
  }

  logout() {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async validateToken(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/auth/check-username/${username}`);
      return response.data.available;
    } catch (error) {
      return false;
    }
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/auth/check-email/${email}`);
      return response.data.available;
    } catch (error) {
      return false;
    }
  }

  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/preferences`,
        { preferences },
        {
          headers: { Authorization: `Bearer ${this.getToken()}` }
        }
      );
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to update preferences');
      }
      throw new Error('Network error occurred');
    }
  }
}

export default new AuthService();
