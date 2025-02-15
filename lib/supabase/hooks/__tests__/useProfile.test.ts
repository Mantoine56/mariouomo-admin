import { renderHook, act } from '@testing-library/react'
import { useProfile } from '../useProfile'
import { createClient } from '../../client'

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
  let realtimeCallback: (payload: any) => void
  let mockChannel: any

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    channel: jest.fn().mockImplementation(() => {
      mockChannel = {
        on: jest.fn().mockImplementation((event, filter, callback) => {
          realtimeCallback = callback
          return mockChannel
        }),
        subscribe: jest.fn().mockReturnThis(),
        unsubscribe: jest.fn(),
      }
      return mockChannel
    }),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    mockSupabase.single.mockResolvedValue({
      data: mockProfile,
      error: null,
    })
  })

  it('should fetch profile data on mount', async () => {
    const userId = 'test-user-id'
    const { result } = renderHook(() => useProfile(userId))

    // Wait for initial fetch
    await act(async () => {
      await Promise.resolve()
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles')
    expect(mockSupabase.select).toHaveBeenCalled()
    expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId)
    expect(result.current.profile).toEqual(mockProfile)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch profile'
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    })

    const userId = 'test-user-id'
    const { result } = renderHook(() => useProfile(userId))

    // Wait for initial fetch
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.profile).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should handle real-time updates', async () => {
    const userId = 'test-user-id'
    const { result } = renderHook(() => useProfile(userId))

    // Wait for initial fetch
    await act(async () => {
      await Promise.resolve()
    })

    const updatedProfile = {
      ...mockProfile,
      full_name: 'Updated Name',
    }

    // Simulate real-time update
    await act(async () => {
      realtimeCallback({
        new: updatedProfile,
        eventType: 'UPDATE',
      })
    })

    expect(result.current.profile).toEqual(updatedProfile)
  })

  it('should handle real-time delete', async () => {
    const userId = 'test-user-id'
    const { result } = renderHook(() => useProfile(userId))

    // Wait for initial fetch
    await act(async () => {
      await Promise.resolve()
    })

    // Simulate real-time delete
    await act(async () => {
      realtimeCallback({
        old: mockProfile,
        eventType: 'DELETE',
      })
    })

    expect(result.current.profile).toBeNull()
  })

  it('should cleanup subscription on unmount', async () => {
    const userId = 'test-user-id'
    const { unmount } = renderHook(() => useProfile(userId))

    // Wait for initial setup
    await act(async () => {
      await Promise.resolve()
    })

    unmount()

    expect(mockChannel.unsubscribe).toHaveBeenCalled()
  })
}) 