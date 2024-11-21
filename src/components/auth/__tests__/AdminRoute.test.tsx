import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../../contexts/AuthContext';
import { AdminRoute } from '../AdminRoute';

describe('AdminRoute', () => {
  const mockAuthContext: AuthContextType = {
    isAuthenticated: false,
    loading: false,
    isLoading: false,
    token: null,
    error: null,
    getToken: () => null,
    user: null,
    login: async () => {},
    logout: () => {},
    register: async () => {},
  };

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    const loadingContext = {
      ...mockAuthContext,
      loading: true,
      isLoading: true,
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={loadingContext}>
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children for admin user', () => {
    const adminContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      loading: false,
      isLoading: false,
      token: 'mock-token',
      error: null,
      getToken: () => 'mock-token',
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
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={adminContext}>
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects non-admin users', () => {
    const userContext = {
      ...mockAuthContext,
      isAuthenticated: true,
      loading: false,
      isLoading: false,
      token: 'mock-token',
      error: null,
      getToken: () => 'mock-token',
      user: {
        id: '123',
        email: 'user@example.com',
        username: 'user',
        name: 'Regular User',
        role: 'user',
        preferences: {
          theme: 'light' as const,
          emailNotifications: true,
          language: 'en',
        },
      },
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={userContext}>
          <AdminRoute>
            <div>Protected Content</div>
          </AdminRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
