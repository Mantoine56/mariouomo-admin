import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ReactNode } from 'react'
import { render } from '@testing-library/react'

// Create a mock store
const createMockStore = () => configureStore({
  reducer: {
    // Add your reducers here
    auth: (state = {}, action) => state,
  },
})

type WrapperProps = {
  supabase?: any
}

export const createWrapper = (props?: WrapperProps) => {
  const store = createMockStore()
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

// Tests
describe('Test Utilities', () => {
  describe('createWrapper', () => {
    it('should create a wrapper with Redux Provider', () => {
      const TestComponent = () => <div>Test Component</div>
      const Wrapper = createWrapper()
      const { container } = render(<TestComponent />, { wrapper: Wrapper })
      
      expect(container).toBeInTheDocument()
      expect(container.textContent).toBe('Test Component')
    })

    it('should create a wrapper with custom props', () => {
      const mockSupabase = { test: 'value' }
      const Wrapper = createWrapper({ supabase: mockSupabase })
      const TestComponent = () => <div>Test Component</div>
      const { container } = render(<TestComponent />, { wrapper: Wrapper })

      expect(container).toBeInTheDocument()
      expect(container.textContent).toBe('Test Component')
    })
  })

  describe('createMockStore', () => {
    it('should create a Redux store with default state', () => {
      const store = createMockStore()
      const state = store.getState()

      expect(state).toHaveProperty('auth')
      expect(typeof state.auth).toBe('object')
    })
  })
}) 