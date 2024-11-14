import { http, HttpResponse } from 'msw'

interface User {
  id: string
  email: string
  username: string
  name: string
  role: string
}

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  username: 'admin',
  name: 'Admin User',
  role: 'admin'
}

export const handlers = [
  // Mock login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as LoginRequest
    
    if (body.email && body.password) {
      const response: LoginResponse = {
        token: 'mock-jwt-token',
        user: mockUser
      }
      return HttpResponse.json(response)
    }

    return new HttpResponse(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401 }
    )
  }),

  // Mock getCurrentUser endpoint
  http.get('/api/auth/me', ({ request }) => {
    const hasValidToken = request.headers.get('Authorization')?.startsWith('Bearer ')
    
    if (!hasValidToken) {
      return new HttpResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    return HttpResponse.json(mockUser)
  }),

  // Mock verify-admin endpoint
  http.get('/api/verify-admin', ({ request }) => {
    const hasValidToken = request.headers.get('Authorization')?.startsWith('Bearer ')
    
    if (!hasValidToken) {
      return new HttpResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    return HttpResponse.json({
      verified: true,
      role: 'admin',
      accessLevel: 'full',
      teamId: 'team_123',
      permissions: ['admin:access']
    })
  }),

  // Mock user endpoint
  http.get('/api/admin/users', () => {
    return HttpResponse.json([
      {
        id: '1',
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: 'admin',
        status: 'active',
        lastLogin: new Date().toISOString(),
        subscription: {
          plan: 'pro',
          status: 'active'
        }
      }
    ])
  }),

  // Mock analytics endpoint
  http.get('/api/admin/analytics', () => {
    return HttpResponse.json({
      users: {
        total: 100,
        active: 50,
        newToday: 5,
        growth: 10
      },
      usage: {
        totalRequests: 1000,
        averageResponseTime: 200,
        errorRate: 0.5,
        peakHour: 14
      }
    })
  })
]
