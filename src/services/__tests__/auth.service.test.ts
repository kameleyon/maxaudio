import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { checkGoogleAuth } from '../auth.service'

describe('auth.service', () => {
  describe('checkGoogleAuth', () => {
    it('returns successful authentication response', async () => {
      // Mock successful response
      server.use(
        http.get('/api/auth/google-token', () => {
          return HttpResponse.json({
            authenticated: true,
            message: 'Successfully authenticated with Google Cloud',
            voicesAvailable: 100
          })
        })
      )

      const result = await checkGoogleAuth()

      expect(result).toEqual({
        authenticated: true,
        message: 'Successfully authenticated with Google Cloud',
        voicesAvailable: 100
      })
    })

    it('returns failed authentication response', async () => {
      // Mock failed response
      server.use(
        http.get('/api/auth/google-token', () => {
          return HttpResponse.json({
            authenticated: false,
            message: 'Failed to authenticate with Google Cloud'
          })
        })
      )

      const result = await checkGoogleAuth()

      expect(result).toEqual({
        authenticated: false,
        message: 'Failed to authenticate with Google Cloud'
      })
    })

    it('handles network errors', async () => {
      // Mock network error
      server.use(
        http.get('/api/auth/google-token', () => {
          return HttpResponse.error()
        })
      )

      const result = await checkGoogleAuth()

      expect(result).toEqual({
        authenticated: false,
        message: expect.any(String)
      })
    })

    it('handles malformed responses', async () => {
      // Mock malformed response
      server.use(
        http.get('/api/auth/google-token', () => {
          return HttpResponse.json({
            authenticated: 'not-a-boolean', // Invalid type
            message: 123, // Invalid type
            voicesAvailable: 'not-a-number' // Invalid type
          })
        })
      )

      const result = await checkGoogleAuth()

      expect(result).toEqual({
        authenticated: false,
        message: expect.stringContaining(''),
        voicesAvailable: undefined
      })
    })

    it('handles missing data in response', async () => {
      // Mock response with missing fields
      server.use(
        http.get('/api/auth/google-token', () => {
          return HttpResponse.json({})
        })
      )

      const result = await checkGoogleAuth()

      expect(result).toEqual({
        authenticated: false,
        message: expect.stringContaining('')
      })
    })
  })
})
