import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import authService from '../auth.service';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          name: 'Test User',
          role: 'user',
          preferences: {
            theme: 'light' as const,
            emailNotifications: true,
            language: 'en',
          },
        },
        token: 'mock-jwt-token',
      };

      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const response = await authService.login('test@example.com', 'password123');
      expect(response).toEqual(mockResponse);
      expect(authService.getToken()).toBe(mockResponse.token);
    });

    it('throws error with invalid credentials', async () => {
      server.use(
        http.post('/api/auth/login', () => {
        return new HttpResponse(null, { status: 401 });
      })
      );

      await expect(authService.login('test@example.com', 'wrong-password')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('successfully registers new user', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'new@example.com',
          username: 'newuser',
          name: 'New User',
          role: 'user',
          preferences: {
            theme: 'light' as const,
            emailNotifications: true,
            language: 'en',
          },
        },
        token: 'mock-jwt-token',
      };

      server.use(
        http.post('/api/auth/register', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const response = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        username: 'newuser',
        name: 'New User'
      });
      expect(response).toEqual(mockResponse);
      expect(authService.getToken()).toBe(mockResponse.token);
    });

    it('throws error with invalid registration data', async () => {
      server.use(
        http.post('/api/auth/register', () => {
          return new HttpResponse(null, { status: 400 });
        })
      );

      await expect(authService.register({
        email: 'invalid-email',
        password: 'password',
        username: 'testuser',
        name: 'Test User'
      })).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('successfully validates token', async () => {
      server.use(
        http.post('/api/auth/validate', () => {
          return HttpResponse.json({ valid: true });
        })
      );

      await expect(authService.validateToken()).resolves.not.toThrow();
    });

    it('throws error with invalid token', async () => {
      server.use(
        http.post('/api/auth/validate', () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      await expect(authService.validateToken()).rejects.toThrow();
    });
  });

  it('should manage token in localStorage', () => {
    const token = 'test-token';
    
    // Initially no token
    expect(authService.getToken()).toBeNull();
    
    // Set token
    authService.setToken(token);
    expect(authService.getToken()).toBe(token);
    expect(localStorage.getItem('token')).toBe(token);
    
    // Clear token
    authService.clearToken();
    expect(authService.getToken()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle authentication state', () => {
    expect(authService.isAuthenticated()).toBe(false);
    
    authService.setToken('test-token');
    expect(authService.isAuthenticated()).toBe(true);
    
    authService.clearToken();
    expect(authService.isAuthenticated()).toBe(false);
  });
});
