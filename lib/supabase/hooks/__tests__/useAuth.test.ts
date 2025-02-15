import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { createClient } from '../../client'
import { createWrapper } from './test-utils'

// Mock dependencies
jest.mock('../../client')

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
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('signIn', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    }

    it('should sign in successfully', async () => {
      // Mock successful auth response
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let response
      await act(async () => {
        response = await result.current.signIn(credentials)
      })

      expect(response).toEqual({ success: true, error: null })
    })

    it('should handle sign in error', async () => {
      // Mock auth error
      const errorMessage = 'Invalid email or password'
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let response
      await act(async () => {
        response = await result.current.signIn(credentials)
      })

      expect(response).toEqual({
        success: false,
        error: 'Invalid email or password',
      })
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
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { 
          user: mockUser,
          session: null
        },
        error: null,
      })

      // Mock successful profile creation
      mockSupabase.insert.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

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
    })

    it('should handle sign up errors', async () => {
      // Mock signup error
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      let response
      await act(async () => {
        response = await result.current.signUp(credentials)
      })

      expect(response).toEqual({
        success: false,
        error: 'An account with this email already exists',
      })
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out error', async () => {
      const errorMessage = 'Failed to sign out'
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      const email = 'test@example.com'
      const options = { redirectTo: 'http://localhost/auth/update-password' }

      await act(async () => {
        await result.current.resetPassword(email)
      })

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, options)
    })

    it('should handle reset password error', async () => {
      const errorMessage = 'Email not found'
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      const email = 'invalid@example.com'
      const options = { redirectTo: 'http://localhost/auth/update-password' }

      await act(async () => {
        await result.current.resetPassword(email)
      })

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, options)
    })
  })

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      const newPassword = 'new-password'

      await act(async () => {
        await result.current.updatePassword(newPassword)
      })

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: newPassword })
    })

    it('should handle update password error', async () => {
      const errorMessage = 'Invalid password'
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: errorMessage },
      })

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
      const newPassword = 'invalid-password'

      await act(async () => {
        await result.current.updatePassword(newPassword)
      })

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: newPassword })
    })
  })
}) 