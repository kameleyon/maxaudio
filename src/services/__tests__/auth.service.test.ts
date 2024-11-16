import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { authService } from '../auth.service';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AuthService', () => {
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
    });

    it('throws error with invalid credentials', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      await expect(authService.login('wrong@example.com', 'wrongpass')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('successfully registers a new user', async () => {
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
      });

      expect(response).toEqual(mockResponse);
    });

    it('throws error with invalid registration data', async () => {
      server.use(
        http.post('/api/auth/register', () => {
          return new HttpResponse(null, { status: 400 });
        })
      );

      await expect(
        authService.register({
          email: 'invalid-email',
          password: '123',
          username: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('successfully validates a valid token', async () => {
      const mockUser = {
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
      };

      server.use(
        http.get('/api/auth/validate', () => {
          return HttpResponse.json(mockUser);
        })
      );

      const response = await authService.validateToken('valid-token');
      expect(response).toEqual(mockUser);
    });

    it('throws error with invalid token', async () => {
      server.use(
        http.get('/api/auth/validate', () => {
          return new HttpResponse(null, { status: 401 });
        })
      );

      await expect(authService.validateToken('invalid-token')).rejects.toThrow();
    });
  });
});
