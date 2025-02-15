import { renderHook, act } from '@testing-library/react'
import { useProfile } from '../useProfile'
import { createClient } from '../../client'
import { createWrapper } from './test-utils'

// Mock dependencies
jest.mock('../../client')

const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  role: 'staff',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('useProfile', () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue(Promise.resolve({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn().mockReturnValue(Promise.resolve())
    })),
    unsubscribe: jest.fn().mockReturnValue(Promise.resolve())
  }

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnValue(mockChannel)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  describe('getProfile', () => {
    it('should fetch profile successfully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      })

      const { result } = renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      // Wait for initial state update
      await act(async () => {
        await result.current.getProfile()
        // Wait for all state updates to complete
        await Promise.resolve()
      })

      expect(result.current.profile).toEqual(mockProfile)
      expect(result.current.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id')
    })

    it('should handle fetch error', async () => {
      const errorMessage = 'Failed to fetch profile'
      mockSupabase.single.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      // Wait for initial state update
      await act(async () => {
        await result.current.getProfile()
        // Wait for all state updates to complete
        await Promise.resolve()
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.profile).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updates = { full_name: 'Updated Name' }
      mockSupabase.single.mockResolvedValue({
        data: { ...mockProfile, ...updates },
        error: null,
      })

      const { result } = renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      let success
      await act(async () => {
        success = await result.current.updateProfile(updates)
      })

      expect(success).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.profile).toEqual({ ...mockProfile, ...updates })
    })

    it('should handle update error', async () => {
      const updates = { full_name: 'Updated Name' }
      const errorMessage = 'Failed to update profile'
      mockSupabase.single.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      let success
      await act(async () => {
        success = await result.current.updateProfile(updates)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('realtime updates', () => {
    it('should subscribe to profile changes', async () => {
      renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      expect(mockSupabase.channel).toHaveBeenCalledWith('public:user_profiles:user_id=eq.test-user-id')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: 'user_id=eq.test-user-id',
        },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })

    it('should cleanup subscription on unmount', async () => {
      const { unmount } = renderHook(() => useProfile('test-user-id'), {
        wrapper: createWrapper({ supabase: mockSupabase })
      })

      unmount()

      expect(mockChannel.unsubscribe).toHaveBeenCalled()
    })

    it('should update profile on realtime changes', async () => {
      const { result } = renderHook(() => useProfile('test-user-id'))

      // Get the callback function that was passed to .on()
      const onChangeCallback = mockChannel.on.mock.calls[0][2]

      // Simulate a realtime update
      await act(async () => {
        onChangeCallback({
          eventType: 'UPDATE',
          new: { ...mockProfile, full_name: 'Updated via Realtime' },
        })
      })

      expect(result.current.profile).toEqual({
        ...mockProfile,
        full_name: 'Updated via Realtime',
      })
    })

    it('should handle profile deletion', async () => {
      const { result } = renderHook(() => useProfile('test-user-id'))

      // Get the callback function that was passed to .on()
      const onChangeCallback = mockChannel.on.mock.calls[0][2]

      // Simulate a realtime delete
      await act(async () => {
        onChangeCallback({
          eventType: 'DELETE',
          old: mockProfile,
        })
      })

      expect(result.current.profile).toBeNull()
    })
  })
}) 