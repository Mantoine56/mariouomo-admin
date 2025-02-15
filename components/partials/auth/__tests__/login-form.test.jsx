import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import LoginForm from '../login-form'
import { useAuth } from '@/lib/supabase/hooks/useAuth'
import { toast } from 'react-toastify'

// Mock the dependencies
jest.mock('@/lib/supabase/hooks/useAuth')
jest.mock('react-toastify')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('LoginForm', () => {
  const mockSignIn = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockImplementation(() => ({
      signIn: mockSignIn,
      isLoading: false,
      error: null,
    }))
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/keep me signed in/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)
    })

    await act(async () => {
      fireEvent.submit(submitButton)
    })

    await waitFor(() => {
      const errorElement = screen.getByText((content, element) => {
        return element.textContent === 'Invalid email'
      })
      expect(errorElement).toBeInTheDocument()
    })
  })

  it('handles successful login', async () => {
    mockSignIn.mockResolvedValueOnce({ success: true, error: null })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.blur(emailInput)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.blur(passwordInput)
    })

    await act(async () => {
      fireEvent.submit(submitButton)
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully logged in!',
        expect.any(Object)
      )
    })
  })

  it('handles login error', async () => {
    const errorMessage = 'Invalid credentials'
    mockSignIn.mockResolvedValueOnce({ success: false, error: errorMessage })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.blur(emailInput)
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.blur(passwordInput)
    })

    await act(async () => {
      fireEvent.submit(submitButton)
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      expect(toast.error).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object)
      )
    })
  })

  it('shows loading state during submission', async () => {
    useAuth.mockImplementation(() => ({
      signIn: mockSignIn,
      isLoading: true,
      error: null,
    }))
    
    render(<LoginForm />)
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('toggles remember me checkbox', () => {
    render(<LoginForm />)
    
    const checkbox = screen.getByRole('checkbox', { name: /keep me signed in/i })
    
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
}) 