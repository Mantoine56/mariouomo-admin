import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../client'
import { useDispatch } from 'react-redux'
import { AuthError } from '@supabase/supabase-js'

// Types
export type SignInCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = SignInCredentials & {
  options: {
    data: {
      full_name: string
    }
    emailRedirectTo: string
  }
}

export type AuthResponse = {
  success: boolean
  error: string | null
}

export const useAuth = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Helper to handle auth errors
  const handleAuthError = (error: AuthError | Error): string => {
    // Common auth error messages
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email address',
      'User already registered': 'An account with this email already exists',
    }

    return errorMessages[error.message] || error.message
  }

  // Sign in with email and password
  const signIn = useCallback(async ({ email, password }: SignInCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // TODO: Dispatch to Redux store
      // dispatch(setUser({ ...data.user, profile }))

      router.push('/dashboard')
      return { success: true, error: null }
    } catch (e) {
      const errorMessage = handleAuthError(e as AuthError)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase.auth])

  // Sign up with email and password
  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp(credentials)

      if (error) {
        const errorMessage = handleAuthError(error)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      if (data?.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            full_name: credentials.options.data.full_name,
          })

        if (profileError) {
          const errorMessage = handleAuthError(profileError)
          setError(errorMessage)
          return { success: false, error: errorMessage }
        }

        // Redirect to verification page
        router.push('/auth/verify-email')
        return { success: true, error: null }
      }

      return { success: false, error: 'Failed to create user' }
    } catch (e: any) {
      const errorMessage = handleAuthError(e)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase])

  // Sign out
  const signOut = useCallback(async (): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // TODO: Clear Redux store
      // dispatch(clearUser())
      
      router.push('/')
      return { success: true, error: null }
    } catch (e) {
      const errorMessage = handleAuthError(e as AuthError)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [router, supabase.auth])

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      
      if (error) throw error
      
      return { success: true, error: null }
    } catch (e) {
      const errorMessage = handleAuthError(e as AuthError)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      return { success: true, error: null }
    } catch (e) {
      const errorMessage = handleAuthError(e as AuthError)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [supabase.auth])

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    isLoading,
    error,
  }
} 