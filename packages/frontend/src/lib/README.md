# Authentication System Documentation

This documentation covers the comprehensive authentication system implemented with Axios, Zustand, and automatic token refresh functionality.

## Overview

The authentication system includes:
- Automatic token refresh on 401 errors
- Request queuing during token refresh
- Comprehensive error handling
- Secure token storage with Zustand persist
- TypeScript support
- React hooks for easy integration
- Route protection components

## Files Structure

```
src/
├── lib/
│   ├── api.ts              # Axios configuration with interceptors
│   └── auth.ts             # Authentication service methods
├── store/
│   └── authStore.ts        # Zustand store for auth state
├── hooks/
│   └── useAuth.ts          # React hook for auth operations
└── components/
    └── auth/
        └── ProtectedRoute.tsx # Route protection components
```

## Core Components

### 1. API Configuration (`lib/api.ts`)

**Features:**
- Environment-based base URL configuration
- Request timeout (10 seconds)
- Automatic token attachment
- Token refresh on 401 errors
- Request queuing during refresh
- Comprehensive error handling
- Automatic logout on refresh failure

**Key Features:**
```typescript
// Environment configuration
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Request queuing during token refresh
let isRefreshing = false;
let failedQueue: Array<{...}> = [];

// Automatic retry with new token
originalRequest.headers.Authorization = `Bearer ${accessToken}`;
return api(originalRequest);
```

### 2. Auth Store (`store/authStore.ts`)

**Features:**
- Persistent storage with localStorage
- TypeScript interfaces
- Multiple token management
- User data storage
- Authentication state tracking

**Available Methods:**
```typescript
setTokens(accessToken: string, refreshToken?: string)
setToken(token: string)
setUser(user: any)
logout()
clearTokens()
```

### 3. Auth Service (`lib/auth.ts`)

**Available Methods:**
- `login(credentials)` - User authentication
- `logout()` - User logout with server cleanup
- `register(userData)` - User registration
- `refreshToken()` - Manual token refresh
- `getCurrentUser()` - Fetch current user data
- `updateProfile(userData)` - Update user profile
- `changePassword(passwordData)` - Change user password
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password
- `isAuthenticated()` - Check auth status
- `getAccessToken()` - Get current token
- `getCurrentUserFromStore()` - Get user from store

### 4. Auth Hook (`hooks/useAuth.ts`)

**Features:**
- Automatic user data initialization
- Error handling wrappers
- Loading states
- Easy component integration

**Usage Example:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();

const handleLogin = async () => {
  const result = await login({ email, password });
  if (result.success) {
    // Handle success
  } else {
    // Handle error: result.error
  }
};
```

### 5. Route Protection (`components/auth/ProtectedRoute.tsx`)

**Components:**
- `ProtectedRoute` - Requires authentication
- `GuestRoute` - Only for unauthenticated users

**Usage Examples:**
```typescript
// Protected route
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Guest route (login/register)
<GuestRoute>
  <LoginPage />
</GuestRoute>
```

## Environment Variables

Add to your `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend Requirements

Your backend should implement these endpoints:

### Authentication Endpoints
```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
GET  /auth/me
PUT  /auth/profile
PUT  /auth/change-password
POST /auth/forgot-password
POST /auth/reset-password
```

### Expected Response Formats

**Login/Register Response:**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token", // optional if using cookies
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Refresh Token Response:**
```json
{
  "accessToken": "new_jwt_access_token"
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Security Best Practices

### 1. Token Storage
- Access tokens stored in memory (Zustand)
- Refresh tokens can be stored in httpOnly cookies (recommended)
- Persistent storage only for non-sensitive data

### 2. Token Refresh
- Automatic refresh on 401 errors
- Request queuing prevents multiple refresh attempts
- Automatic logout on refresh failure

### 3. HTTPS Only
- Always use HTTPS in production
- Set secure cookie flags for refresh tokens

### 4. Environment Configuration
- Use environment variables for API URLs
- Different configurations for dev/staging/production

## Usage Examples

### 1. Login Component
```typescript
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(credentials);
    
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### 2. Protected Page
```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.name}</h1>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
};
```

### 3. API Calls
```typescript
import api from '@/lib/api';

// API calls automatically include auth headers
const fetchUserData = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    // Error handling (401s are automatically handled)
    console.error('Failed to fetch user data:', error);
  }
};
```

## Error Handling

The system handles various error scenarios:

- **401 Unauthorized**: Automatic token refresh
- **403 Forbidden**: Permission denied (logged)
- **500+ Server Errors**: Server issues (logged)
- **Network Errors**: Connection issues (logged)
- **Timeout Errors**: Request timeout (logged)

## Troubleshooting

### Common Issues

1. **Token not being sent**
   - Check if token exists in store
   - Verify API base URL configuration

2. **Infinite refresh loops**
   - Check refresh endpoint implementation
   - Verify refresh token validity

3. **CORS issues**
   - Configure backend CORS settings
   - Check withCredentials configuration

4. **Persistent login issues**
   - Clear localStorage/sessionStorage
   - Check token expiration times

### Debug Mode

Add console logs to track token refresh:
```typescript
// In api.ts interceptor
console.log('Token refresh attempt:', { isRefreshing, queueLength: failedQueue.length });
```

## Migration Guide

If upgrading from a basic auth setup:

1. Update auth store structure
2. Replace direct API calls with auth service methods
3. Wrap components with ProtectedRoute
4. Update backend to handle refresh tokens
5. Test token refresh scenarios

## Performance Considerations

- Request queuing prevents duplicate refresh calls
- Minimal re-renders with Zustand
- Lazy loading of user data
- Efficient error handling

This authentication system provides a robust, secure, and user-friendly foundation for your application's authentication needs.