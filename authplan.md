# Supabase Authentication Implementation Plan

## Phase 1: Initial Setup
- [x] Create Supabase project
  - [x] Note down project URL
  - [x] Save API keys securely
- [x] Install dependencies
  ```bash
  npm install @supabase/ssr
  ```
- [x] Configure environment variables
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

## Phase 2: Template Selection and Cleanup
- [x] Select and keep only version one of each auth template:
  - [x] Sign In (Version 1)
  - [x] Register (Version 1)
  - [x] Forgot Password (Version 1)
  - [x] Lock Screen (Version 1)
- [x] Remove unused template versions (2 and 3)
- [x] Update navigation and routing to point to version 1 templates

## Phase 3: Database Setup
- [x] Create user profiles table
  ```sql
  create table public.user_profiles (
    id uuid references auth.users on delete cascade not null primary key,
    full_name text,
    role text check (role in ('admin', 'manager', 'staff')) not null default 'staff',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );
  ```
- [x] Setup Row Level Security (RLS)
  - [x] Enable RLS on user_profiles table
  - [x] Create access policies:
    - [x] Users can view their own profile
    - [x] Users can update their own profile
    - [x] Admins can view all profiles
    - [x] Admins can update all profiles
- [x] Create initial admin user (test@example.com)
- [x] Test database access

## Phase 4: Authentication Components Integration
- [x] Create Supabase auth hooks
  ```typescript
  /lib/supabase/hooks/
    ├── useAuth.ts        # Main auth hook (✓)
    ├── useProfile.ts     # User profile management (✓)
    └── useSession.ts     # Session management (✓)
  ```
- [x] Write comprehensive tests
  - [x] useAuth tests
  - [x] useProfile tests
  - [x] useSession tests
  - [x] Test utilities
- [x] Update existing auth components
  - [x] Integrate Supabase with LoginForm (Version 1)
  - [ ] Update RegisterForm (Version 1)
  - [ ] Modify ForgotPassword (Version 1)
  - [ ] Update LockScreen (Version 1)

## Phase 5: State Management Integration
- [ ] Create Supabase auth slice in Redux
  ```typescript
  /store/
    ├── auth/
    │   ├── authSlice.ts
    │   ├── authActions.ts
    │   └── authSelectors.ts
  ```
- [ ] Implement auth actions:
  - [x] Login
  - [ ] Logout
  - [ ] Register
  - [ ] Password Reset
  - [ ] Session Management
- [ ] Connect Redux with Supabase auth state

## Phase 6: Protected Routes and Middleware
- [x] Configure middleware for auth checks
- [ ] Implement role-based access control
- [ ] Add route protection based on user roles
- [ ] Setup auth redirects and error handling

## Phase 7: Testing & Security
- [x] Write unit tests
  - [x] Auth utilities
  - [x] API endpoints
  - [x] Components
- [ ] Perform security audit
  - [ ] Check RLS policies
  - [ ] Verify JWT handling
  - [ ] Test role restrictions
- [ ] Add error handling
- [ ] Implement rate limiting

## Phase 8: Deployment
- [ ] Configure Vercel project
- [ ] Setup environment variables
- [ ] Deploy to staging
- [ ] Test production environment
- [ ] Monitor for issues

## Next Steps:
1. Update RegisterForm (Version 1)
   - Integrate with useAuth hook's signUp method
   - Add loading states
   - Handle validation errors
   - Implement redirect after successful registration
   - Add proper error messages
   - Test integration

2. Implement Redux Integration
   - Create auth slice
   - Connect with Supabase auth state
   - Update components to use Redux state
   - Add proper error handling
   - Test Redux integration

3. Update Remaining Auth Components
   - ForgotPassword form
   - LockScreen form
   - Add comprehensive tests for each

## Implementation Strategy: Hybrid Approach

We've chosen the hybrid approach for the following reasons:

1. **UI Components**
   - Keep version 1 of template auth UI components
   - Remove versions 2 and 3 to maintain consistency
   - Maintain existing design system integration

2. **Auth Logic**
   - Replace template auth with Supabase
   - Utilize Supabase's session management
   - Implement secure authentication flows

3. **State Management**
   - Keep existing Redux structure
   - Add Supabase-specific auth slice
   - Maintain UI state consistency

## Next Steps

1. Begin with Phase 2: Template Selection and Cleanup
2. Move to Phase 4: Authentication Components Integration
3. Proceed with Phase 5: State Management Integration

Each phase will be implemented incrementally, with testing at each step to ensure functionality.

## Files to Create/Modify

### 1. Authentication Utilities
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Middleware
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}
```

### 3. Auth Components
```typescript
// components/auth/LoginForm.tsx
// components/auth/RegisterForm.tsx
// components/auth/ResetPassword.tsx
// components/auth/AuthProvider.tsx
```

## Current Status
- [x] Phase 1: Completed
- [x] Phase 2: Completed
- [x] Phase 3: Completed
- [ ] Phase 4: In Progress (75% complete)
  - [x] Auth hooks created and tested
  - [x] LoginForm updated and tested
  - [ ] RegisterForm pending
  - [ ] ForgotPassword pending
  - [ ] LockScreen pending
- [ ] Phase 5: Not Started
- [ ] Phase 6: Not Started
- [ ] Phase 7: In Progress (50% complete)
  - [x] Unit tests for hooks
  - [x] Component tests
  - [ ] Security audit pending
  - [ ] Error handling implementation pending
- [ ] Phase 8: Not Started


## Audit Existing Auth-Related Code
1. Check /app/(auth) directory contents
2. Review Redux store for auth state
3. Look for existing middleware implementations

## Document Current Auth Flow
1. Login/logout process
2. Protected route mechanism
3. Session management

## Make Integration Decisions
1. Whether to replace or integrate with existing auth
2. How to handle state management conflicts
3. Migration strategy for existing users (if any)

## Next Steps

Before proceeding with the current plan, I recommend:

1. **Audit Request**
```markdown
Please provide:
- Contents of /app/(auth)/* directory
- Any existing auth-related Redux code
- Current middleware implementation
- Existing auth components
```

2. **Decision Points**
```markdown
Need to decide:
1. Keep or replace template auth system?
2. How to handle state management integration?
3. Migration strategy for existing data?
4. Component integration approach?
```

The current Supabase implementation plan is solid in isolation, but we need to understand the existing authentication system before proceeding. This will help avoid conflicts and ensure a smooth integration or replacement strategy.

Would you be able to share the contents of the `/app/(auth)` directory and any existing auth-related code? This would help us make more specific recommendations and possibly modify the implementation plan accordingly.

## Template Integration:
- How Supabase auth will coexist/replace template auth
- State management strategy (Redux + Supabase)
- Component integration/replacement strategy

## Migration Strategy:
- How to handle existing users (if any)
- Transition period management
- Data preservation plan 

## Required Code Audit
Before proceeding with any implementation, we need to examine:

1. **Template Auth Implementation**
   - /app/(auth)/* directory contents
   - Current auth flow and components
   - Existing middleware
   - Protected route implementation

2. **State Management**
   - Redux store structure
   - Auth-related reducers and actions
   - Existing auth hooks or utilities

3. **Template Dependencies**
   - Current auth-related packages
   - Potential conflicts with Supabase
   - Required template-specific features

## Decision Checklist
- [ ] Document current template auth implementation
- [ ] Identify if template uses JWT or session-based auth
- [ ] Map out existing protected route logic
- [ ] Review template's auth state management
- [ ] Assess impact of replacing/modifying template auth
- [ ] Evaluate template's auth component architecture

## Questions for Template Review
1. Does the template use:
   - Custom auth implementation?
   - Third-party auth provider?
   - Built-in auth components?
2. How are protected routes currently handled?
3. What auth state management exists?
4. Are there template-specific auth features we need to maintain?

## Implementation Options
1. **Full Template Auth**
   - Keep template's auth system
   - Integrate Supabase as data layer only
   
2. **Hybrid Approach**
   - Keep template's UI components
   - Replace auth logic with Supabase
   - Maintain template's state management pattern

3. **Full Supabase Implementation**
   - Replace template auth entirely
   - Rebuild auth UI with Supabase
   - New state management integration

Please provide access to the template's auth-related code to help make these decisions. 