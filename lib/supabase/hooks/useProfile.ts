import { useCallback, useState, useEffect } from 'react'
import { createClient } from '../client'
import { Database } from '../../types/supabase'

type Profile = Database['public']['Tables']['user_profiles']['Row']
export type UpdateProfileData = Partial<Pick<Profile, 'full_name'>>

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const supabase = createClient()

  // Get user profile
  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const profileData = data as Profile
      setProfile(profileData)
      return profileData
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to fetch profile'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Update user profile
  const updateProfile = useCallback(async (updates: UpdateProfileData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setProfile(data as Profile)
      return true
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to update profile'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  // Subscribe to realtime profile changes
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`public:user_profiles:user_id=eq.${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setProfile(null)
          } else {
            setProfile(payload.new as Profile)
          }
        }
      )

    channel.subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, supabase])

  // Load profile on mount
  useEffect(() => {
    if (userId) {
      getProfile()
    }
  }, [userId, getProfile])

  return {
    profile,
    getProfile,
    updateProfile,
    isLoading,
    error,
  }
} 