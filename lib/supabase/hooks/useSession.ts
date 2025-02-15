import { useEffect, useState } from 'react'
import { createClient } from '../client'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export type SessionState = {
  session: Session | null
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useSession = () => {
  const router = useRouter()
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAuthenticated: !!session,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isAuthenticated: !!session,
      })

      // Handle auth state changes
      if (!session) {
        // Session expired or user signed out
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  // Utility function to check if user has specific role
  const hasRole = (role: string): boolean => {
    if (!state.user) return false
    return state.user.user_metadata?.role === role
  }

  // Utility function to check if session is expired
  const isSessionExpired = (): boolean => {
    if (!state.session) return true
    const expiresAt = state.session.expires_at
    if (!expiresAt) return false
    return Date.now() > expiresAt * 1000
  }

  return {
    ...state,
    hasRole,
    isSessionExpired,
  }
} 