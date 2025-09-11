# Authentication System

## Overview

MiloMCP Studio Web uses NextAuth.js with a custom credentials provider for authentication. The system implements automatic token refresh and graceful logout when refresh tokens expire.

## Authentication Flow

### 1. Initial Login
1. User enters credentials on `/login` page
2. Frontend sends credentials to NextAuth
3. NextAuth calls MiloMCP backend `/api/login`
4. Backend returns `accessToken` and `refreshToken`
5. Tokens are stored in the NextAuth session

### 2. Token Management
- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Used to obtain new access tokens
- **Session**: Managed by NextAuth with JWT strategy

### 3. Automatic Token Refresh
When an access token expires:
1. NextAuth automatically calls the refresh function
2. Sends `refreshToken` to backend `/api/refresh`
3. Backend returns new `accessToken` (and optionally new `refreshToken`)
4. Session is updated with new tokens

### 4. Graceful Logout on Refresh Token Expiry
When refresh token expires:
1. Backend returns error on `/api/refresh` call
2. Frontend marks session with `RefreshAccessTokenError`
3. `AuthGuard` component detects error state
4. User is automatically redirected to login page
5. Session is cleared

## Components

### AuthGuard Component
```tsx
<AuthGuard requireAuth={true}>
  {/* Protected content */}
</AuthGuard>
```
- Wraps protected routes
- Monitors authentication state
- Automatically redirects on token expiry
- Shows loading states during auth checks

### API Client
- All API calls go through `/api/proxy`
- Automatically handles 401/403 responses
- Redirects to login on authentication errors

## Configuration

### Auth Options (`src/lib/auth.ts`)
- JWT strategy with 30-day max age
- Custom refresh token logic
- Error handling for expired tokens

### Session Types (`src/types/auth.ts`)
```typescript
interface Session {
  accessToken?: string
  refreshToken?: string
  error?: string
  user: {
    id: string
    role?: string
  }
}
```

## Usage

### Protecting Routes
Dashboard layout automatically wraps all routes with `AuthGuard`:

```tsx
// src/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard requireAuth={true}>
      {/* Dashboard UI */}
    </AuthGuard>
  )
}
```

### Accessing Session Data
```tsx
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>
  
  return <div>Welcome, {session.user.name}</div>
}
```

### Making Authenticated API Calls
```tsx
import { apiClient } from '@/lib/api'

// API client automatically handles authentication
const response = await apiClient.get('/api/tokens')
```

## Security Features

1. **Automatic Token Refresh**: No manual token management needed
2. **Graceful Logout**: Users are logged out when refresh tokens expire
3. **Protected Routes**: All dashboard routes require authentication
4. **Secure API Proxy**: Frontend never directly calls backend
5. **CORS Prevention**: All requests stay on same domain

## Error Handling

- **401 Unauthorized**: Automatic redirect to login
- **403 Forbidden**: Session expired, redirect to login
- **Refresh Token Expired**: Graceful logout and redirect
- **Network Errors**: Proper error messages to user

## Benefits

✅ **Elegant User Experience**: Automatic token refresh is invisible to users
✅ **Security**: Tokens are managed securely server-side
✅ **Reliability**: Graceful handling of all token expiry scenarios
✅ **Maintainability**: Centralized authentication logic
✅ **Scalability**: Works across all protected routes automatically