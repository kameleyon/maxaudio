import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useUser, useSession } from '@clerk/clerk-react'
import { AdminRoute } from '../AdminRoute'

// Mock Clerk hooks
jest.mock('@clerk/clerk-react', () => ({
  useUser: jest.fn(),
  useSession: jest.fn()
}))

const mockUseUser = useUser as jest.Mock
const mockUseSession = useSession as jest.Mock

describe('AdminRoute', () => {
  const TestComponent = () => <div>Protected Admin Content</div>

  beforeEach(() => {
    // Reset mocks before each test
    mockUseUser.mockReset()
    mockUseSession.mockReset()
  })

  it('shows loading state when clerk is not loaded', () => {
    mockUseUser.mockReturnValue({
      isLoaded: false,
      user: null,
      isSignedIn: false
    })

    mockUseSession.mockReturnValue({
      session: null,
      isLoaded: false
    })

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects to home when user is not an admin', () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        publicMetadata: {
          role: 'user'
        }
      },
      isSignedIn: true
    })

    mockUseSession.mockReturnValue({
      session: {
        getToken: jest.fn()
      },
      isLoaded: true
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <AdminRoute>
              <TestComponent />
            </AdminRoute>
          } />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(container).toHaveTextContent('Home Page')
  })

  it('renders protected content for admin users', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        publicMetadata: {
          role: 'admin',
          accessLevel: 'full',
          teamId: 'team_123',
          permissions: ['admin:access']
        }
      },
      isSignedIn: true
    })

    mockUseSession.mockReturnValue({
      session: {
        getToken: jest.fn().mockResolvedValue('mock-token')
      },
      isLoaded: true
    })

    render(
      <MemoryRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Admin Content')).toBeInTheDocument()
    })
  })

  it('shows error state when verification fails', async () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        publicMetadata: {
          role: 'admin',
          accessLevel: 'basic'
        }
      },
      isSignedIn: true
    })

    mockUseSession.mockReturnValue({
      session: {
        getToken: jest.fn().mockResolvedValue('mock-token')
      },
      isLoaded: true
    })

    render(
      <MemoryRouter>
        <AdminRoute requiredAccessLevel="full">
          <TestComponent />
        </AdminRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/insufficient access level/i)).toBeInTheDocument()
    })
  })
})
