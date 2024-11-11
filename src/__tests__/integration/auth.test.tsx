import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useUser, useSession } from '@clerk/clerk-react'
import { AdminRoute } from '../../components/auth/AdminRoute'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'

// Mock Clerk hooks
jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn(),
  useSession: jest.fn()
}))

const mockUseUser = useUser as jest.Mock
const mockUseSession = useSession as jest.Mock

describe('Authentication Flow', () => {
  const ProtectedContent = () => <div>Protected Content</div>
  const AdminContent = () => <div>Admin Content</div>
  const HomePage = () => <div>Home Page</div>

  const TestApp = () => (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/protected" element={
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminContent />
          </AdminRoute>
        } />
      </Routes>
    </MemoryRouter>
  )

  beforeEach(() => {
    mockUseUser.mockReset()
    mockUseSession.mockReset()
  })

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null
      })

      mockUseSession.mockReturnValue({
        session: null,
        isLoaded: true
      })
    })

    it('redirects to home when accessing protected route', async () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('redirects to home when accessing admin route', async () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={
              <AdminRoute>
                <AdminContent />
              </AdminRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated Regular User', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: {
            role: 'user'
          }
        }
      })

      mockUseSession.mockReturnValue({
        session: {
          getToken: jest.fn().mockResolvedValue('mock-token')
        },
        isLoaded: true
      })
    })

    it('can access protected routes', async () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('cannot access admin routes', async () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={
              <AdminRoute>
                <AdminContent />
              </AdminRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Home Page')).toBeInTheDocument()
      })
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated Admin User', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: {
            role: 'admin',
            accessLevel: 'full',
            teamId: 'team_123',
            permissions: ['admin:access']
          }
        }
      })

      mockUseSession.mockReturnValue({
        session: {
          getToken: jest.fn().mockResolvedValue('mock-token')
        },
        isLoaded: true
      })
    })

    it('can access protected routes', async () => {
      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('can access admin routes', async () => {
      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={
              <AdminRoute>
                <AdminContent />
              </AdminRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument()
      })
    })

    it('respects access level requirements', async () => {
      // Update user to have basic access level
      mockUseUser.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          publicMetadata: {
            role: 'admin',
            accessLevel: 'basic',
            teamId: 'team_123',
            permissions: ['admin:access']
          }
        }
      })

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={
              <AdminRoute requiredAccessLevel="full">
                <AdminContent />
              </AdminRoute>
            } />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
        expect(screen.getByText(/insufficient access level/i)).toBeInTheDocument()
      })
    })
  })
})
