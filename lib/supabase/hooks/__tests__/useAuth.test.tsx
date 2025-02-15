import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { createClient } from '../../client'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

// Mock dependencies
jest.mock('../../client')
jest.mock('react-redux')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock types
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
}

const mockProfile = {
  id: mockUser.id,
  full_name: 'Test User',
  role: 'staff',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('useAuth', () => {
  // Setup mocks
  const mockRouter = {
    push: jest.fn(),
  }
  const mockDispatch = jest.fn()
  const mockSupabase = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  describe('signIn', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should successfully sign in a user', async () => {
      // Mock successful auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      // Mock successful profile fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: mockProfile,
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.signIn(credentials)
      })

      expect(response).toEqual({ success: true, error: null })
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    it('should handle sign in errors', async () => {
      // Mock auth error
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: new Error('Invalid login credentials'),
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.signIn(credentials)
      })

      expect(response).toEqual({
        success: false,
        error: 'Invalid email or password',
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('signUp', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User'
        },
        emailRedirectTo: 'http://localhost:3000/auth/verify-email'
      }
    }

    it('should successfully sign up a user', async () => {
      // Mock successful signup
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })

      // Mock successful profile creation
      mockSupabase.insert.mockResolvedValueOnce({
        data: { user_id: mockUser.id, full_name: credentials.options.data.full_name },
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.signUp(credentials)
      })

      expect(response).toEqual({ success: true, error: null })
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(credentials)
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        full_name: credentials.options.data.full_name,
      })
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email')
    })

    it('should handle sign up errors', async () => {
      // Mock signup error
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: new Error('User already registered'),
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.signUp(credentials)
      })

      expect(response).toEqual({
        success: false,
        error: 'An account with this email already exists',
      })
      expect(mockRouter.push).not.toHaveBeenCalled()
    })
  })

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.signOut()
      })

      expect(response).toEqual({ success: true, error: null })
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })

  describe('resetPassword', () => {
    it('should successfully initiate password reset', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.resetPassword('test@example.com')
      })

      expect(response).toEqual({ success: true, error: null })
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValueOnce({
        error: null,
      })

      const { result } = renderHook(() => useAuth())

      let response
      await act(async () => {
        response = await result.current.updatePassword('newpassword123')
      })

      expect(response).toEqual({ success: true, error: null })
    })
  })
}) 