import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import RegForm from '../reg-from';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { useRouter } from 'next/navigation';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/supabase/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('RegForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSignUp = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mocks
    useRouter.mockReturnValue(mockRouter);
    useAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      error: null,
    });
  });

  it('renders the registration form', () => {
    render(<RegForm />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create an account/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<RegForm />);
    
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
    expect(await screen.findByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<RegForm />);
    
    const emailInput = screen.getByLabelText(/email/i);

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('shows validation error for weak password', async () => {
    render(<RegForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.blur(passwordInput);
    });

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows validation error for mismatched passwords', async () => {
    render(<RegForm />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
      fireEvent.blur(confirmPasswordInput);
    });

    expect(await screen.findByText(/passwords must match/i)).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    mockSignUp.mockResolvedValueOnce({ success: true });
    
    render(<RegForm />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    await act(async () => {
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.blur(fullNameInput);
    });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.blur(emailInput);
    });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.blur(passwordInput);
    });

    await act(async () => {
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.blur(confirmPasswordInput);
    });

    await act(async () => {
      fireEvent.click(termsCheckbox);
    });

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'StrongPass123!',
        options: {
          data: {
            full_name: 'John Doe',
          },
          emailRedirectTo: expect.any(String),
        },
      });
    });

    expect(toast.success).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/auth/verify-email');
  });

  it('handles registration error', async () => {
    const errorMessage = 'Email already exists';
    mockSignUp.mockResolvedValueOnce({ success: false, error: errorMessage });
    
    render(<RegForm />);
    
    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const termsCheckbox = screen.getByRole('checkbox');
    const submitButton = screen.getByRole('button', { name: /create an account/i });

    await act(async () => {
      fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
      fireEvent.blur(fullNameInput);
    });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.blur(emailInput);
    });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.blur(passwordInput);
    });

    await act(async () => {
      fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPass123!' } });
      fireEvent.blur(confirmPasswordInput);
    });

    await act(async () => {
      fireEvent.click(termsCheckbox);
    });

    await act(async () => {
      fireEvent.submit(submitButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });
  });

  it('shows loading state during submission', async () => {
    useAuth.mockReturnValue({
      signUp: mockSignUp,
      isLoading: true,
      error: null,
    });

    render(<RegForm />);
    
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  });
}); 