import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminRoute } from '../AdminRoute';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('AdminRoute', () => {
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
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to home when user is not authenticated', () => {
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
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to home when user is not an admin', () => {
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
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is an admin', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '123',
        email: 'admin@example.com',
        username: 'admin',
        name: 'Admin User',
        role: 'admin',
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
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
