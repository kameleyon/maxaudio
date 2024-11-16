import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when authentication is loading', () => {
    const mockAuthContext = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    const mockAuthContext = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '123',
        email: 'user@example.com',
        username: 'testuser',
        name: 'Test User',
        role: 'user',
        preferences: {
          theme: 'light' as const,
          emailNotifications: true,
          language: 'en',
        },
      },
      login: async () => {},
      logout: () => {},
      register: async () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
