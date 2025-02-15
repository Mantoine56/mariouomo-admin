import { renderHook, act } from '@testing-library/react'
import { useSession } from '../useSession'
import { createClient } from '../../client'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('../../client')

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    role: 'admin',
  },
}

const mockSession = {
  user: mockUser,
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
}

describe('useSession', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
      }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('should initialize with loading state', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
    })

    const { result } = renderHook(() => useSession())

    // Wait for initial state update
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should update state when session is available', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
    })

    const { result } = renderHook(() => useSession())

    // Wait for useEffect to complete
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle auth state changes', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
    })

    let authChangeCallback: (event: string, session: any) => void
    mockSupabase.auth.onAuthStateChange.mockImplementationOnce((callback) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }
    })

    const { result } = renderHook(() => useSession())

    // Wait for initial state
    await act(async () => {
      await Promise.resolve()
    })

    // Simulate auth state change
    await act(async () => {
      authChangeCallback!('SIGNED_OUT', null)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(useRouter().push).toHaveBeenCalledWith('/auth/login')
  })

  describe('hasRole', () => {
    it('should return true for matching role', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const { result } = renderHook(() => useSession())

      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve()
      })

      expect(result.current.hasRole('admin')).toBe(true)
    })

    it('should return false for non-matching role', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const { result } = renderHook(() => useSession())

      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve()
      })

      expect(result.current.hasRole('staff')).toBe(false)
    })
  })

  describe('isSessionExpired', () => {
    it('should return true when session is expired', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      }

      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: expiredSession },
      })

      const { result } = renderHook(() => useSession())

      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve()
      })

      expect(result.current.isSessionExpired()).toBe(true)
    })

    it('should return false when session is valid', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      })

      const { result } = renderHook(() => useSession())

      // Wait for useEffect to complete
      await act(async () => {
        await Promise.resolve()
      })

      expect(result.current.isSessionExpired()).toBe(false)
    })
  })

  it('should cleanup subscription on unmount', async () => {
    const unsubscribe = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValueOnce({
      data: {
        subscription: { unsubscribe },
      },
    })

    const { unmount } = renderHook(() => useSession())

    // Wait for initial setup
    await act(async () => {
      await Promise.resolve()
    })

    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
}) 