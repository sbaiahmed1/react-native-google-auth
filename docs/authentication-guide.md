# Google Authentication Implementation Guide

Comprehensive guide for implementing Google Sign-In authentication flows in React Native applications using react-native-google-auth.

## Table of Contents

- [Authentication Overview](#authentication-overview)
- [Basic Authentication Flow](#basic-authentication-flow)
- [Advanced Authentication Patterns](#advanced-authentication-patterns)
- [One Tap Sign-In](#one-tap-sign-in)
- [Token Management](#token-management)
- [User Session Management](#user-session-management)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)
- [Production Considerations](#production-considerations)

## Authentication Overview

### Google Sign-In Flow Types

1. **One Tap Sign-In**: Seamless authentication with saved credentials
2. **Standard Sign-In**: Traditional Google OAuth flow
3. **Silent Sign-In**: Background authentication for returning users
4. **Server-Side Verification**: Secure token validation on your backend

### Supported Platforms

- **iOS**: Uses Google Sign-In SDK with iOS Keychain storage
- **Android**: Uses Credential Manager API with Android Keystore

## Basic Authentication Flow

### 1. Simple Sign-In Implementation

```typescript
import React, { useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { GoogleAuth, GoogleAuthError } from 'react-native-google-auth';

const BasicAuthExample = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await GoogleAuth.signIn();
      
      if (response.type === 'success') {
        setUser(response.data.user);
        Alert.alert('Success', `Welcome ${response.data.user.name}!`);
      } else if (response.type === 'cancelled') {
        Alert.alert('Cancelled', 'Sign-in was cancelled');
      } else {
        Alert.alert('Info', 'No saved credentials found');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {user ? (
        <View>
          <Text>Welcome, {user.name}!</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      ) : (
        <Button 
          title={isLoading ? "Signing In..." : "Sign In with Google"} 
          onPress={handleSignIn}
          disabled={isLoading}
        />
      )}
    </View>
  );
};

export default BasicAuthExample;
```

### 2. Configuration with Custom Scopes

```typescript
const configureWithScopes = async () => {
  await GoogleAuth.configure({
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    scopes: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive.readonly', // Google Drive access
      'https://www.googleapis.com/auth/calendar.readonly' // Calendar access
    ],
    offlineAccess: true, // Request refresh tokens
    hostedDomain: 'yourcompany.com' // Restrict to specific domain
  });
};
```

## Advanced Authentication Patterns

### 1. Context-Based Authentication

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuth } from 'react-native-google-auth';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Configure Google Auth
      await GoogleAuth.configure({
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID'
      });

      // Check if user is already signed in
      const currentUser = await GoogleAuth.getCurrentUser();
      if (currentUser) {
        // Check if token is expired
        const isExpired = await GoogleAuth.isTokenExpired();
        if (isExpired) {
          await GoogleAuth.refreshTokens();
        }
        setUser(currentUser);
      }
    } catch (error) {
      console.log('No user signed in or auth not configured');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    setIsLoading(true);
    try {
      const response = await GoogleAuth.signIn();
      if (response.type === 'success') {
        setUser(response.data.user);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const refreshTokens = async () => {
    try {
      await GoogleAuth.refreshTokens();
    } catch (error) {
      // If refresh fails, sign out user
      await signOut();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. Redux Integration

```typescript
// authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GoogleAuth } from 'react-native-google-auth';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
};

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const response = await GoogleAuth.signIn();
      if (response.type === 'success') {
        return response.data.user;
      } else {
        return rejectWithValue('Sign-in cancelled or failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await GoogleAuth.signOut();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
```

## One Tap Sign-In

### Implementation

```typescript
const OneTapSignInExample = () => {
  const [user, setUser] = useState(null);

  const handleOneTapSignIn = async () => {
    try {
      const response = await GoogleAuth.signIn();
      
      switch (response.type) {
        case 'success':
          setUser(response.data.user);
          console.log('One Tap Sign-In successful');
          break;
          
        case 'noSavedCredentialFound':
          console.log('No saved credentials, showing standard sign-in');
          // Fallback to standard sign-in flow
          break;
          
        case 'cancelled':
          console.log('User cancelled sign-in');
          break;
      }
    } catch (error) {
      console.error('One Tap Sign-In error:', error);
    }
  };

  useEffect(() => {
    // Attempt One Tap Sign-In on app start
    handleOneTapSignIn();
  }, []);

  return (
    <View>
      {user ? (
        <Text>Welcome back, {user.name}!</Text>
      ) : (
        <Button title="Sign In" onPress={handleOneTapSignIn} />
      )}
    </View>
  );
};
```

## Token Management

### 1. Automatic Token Refresh

```typescript
const useTokenManager = () => {
  const refreshTokenIfNeeded = async () => {
    try {
      const isExpired = await GoogleAuth.isTokenExpired();
      if (isExpired) {
        console.log('Token expired, refreshing...');
        await GoogleAuth.refreshTokens();
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Handle refresh failure (e.g., sign out user)
    }
  };

  const getValidTokens = async () => {
    await refreshTokenIfNeeded();
    return await GoogleAuth.getTokens();
  };

  return { refreshTokenIfNeeded, getValidTokens };
};
```

### 2. API Request with Token

```typescript
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    // Ensure token is valid
    const isExpired = await GoogleAuth.isTokenExpired();
    if (isExpired) {
      await GoogleAuth.refreshTokens();
    }

    // Get current tokens
    const tokens = await GoogleAuth.getTokens();
    
    // Make authenticated request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated request failed:', error);
    throw error;
  }
};
```

## User Session Management

### 1. Persistent Session

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'google_auth_session';

const saveSession = async (user: any) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

const loadSession = async () => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Failed to load session:', error);
    return null;
  }
};

const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};
```

### 2. Session Validation

```typescript
const validateSession = async () => {
  try {
    // Check if user is signed in
    const currentUser = await GoogleAuth.getCurrentUser();
    if (!currentUser) {
      return { valid: false, reason: 'No user signed in' };
    }

    // Check token expiration
    const isExpired = await GoogleAuth.isTokenExpired();
    if (isExpired) {
      try {
        await GoogleAuth.refreshTokens();
        return { valid: true, reason: 'Token refreshed' };
      } catch (refreshError) {
        return { valid: false, reason: 'Token refresh failed' };
      }
    }

    return { valid: true, reason: 'Session valid' };
  } catch (error) {
    return { valid: false, reason: error.message };
  }
};
```

## Error Handling

### Comprehensive Error Handler

```typescript
import { GoogleAuthErrorCodes } from 'react-native-google-auth';

const handleGoogleAuthError = (error: any) => {
  switch (error.code) {
    case GoogleAuthErrorCodes.SIGN_IN_CANCELLED:
      return 'Sign-in was cancelled by user';
      
    case GoogleAuthErrorCodes.IN_PROGRESS:
      return 'Sign-in already in progress';
      
    case GoogleAuthErrorCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return 'Google Play Services not available. Please update Google Play Services.';
      
    case GoogleAuthErrorCodes.TOKEN_EXPIRED:
      return 'Authentication token has expired. Please sign in again.';
      
    case GoogleAuthErrorCodes.NOT_SIGNED_IN:
      return 'No user is currently signed in';
      
    case GoogleAuthErrorCodes.NETWORK_ERROR:
      return 'Network error. Please check your internet connection.';
      
    case GoogleAuthErrorCodes.NOT_CONFIGURED:
      return 'Google Auth not configured. Please check your setup.';
      
    default:
      return error.message || 'An unexpected error occurred';
  }
};
```

## Security Best Practices

### 1. Server-Side Token Verification

```typescript
const verifyTokenOnServer = async (idToken: string) => {
  try {
    const response = await fetch('/api/auth/verify-google-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const result = await response.json();
    return result.valid;
  } catch (error) {
    console.error('Server verification failed:', error);
    return false;
  }
};
```

### 2. Secure Token Storage

```typescript
// Tokens are automatically stored securely:
// - iOS: iOS Keychain
// - Android: Android Keystore
// No additional configuration needed

const getSecureTokens = async () => {
  try {
    // Tokens are retrieved from secure storage
    const tokens = await GoogleAuth.getTokens();
    
    // Never log tokens in production
    if (__DEV__) {
      console.log('Tokens retrieved from secure storage');
    }
    
    return tokens;
  } catch (error) {
    console.error('Failed to get secure tokens:', error);
    throw error;
  }
};
```

## Production Considerations

### 1. Environment Configuration

```typescript
const getProductionConfig = () => {
  const config = {
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    scopes: ['email', 'profile'],
    offlineAccess: true
  };

  // Validate configuration
  if (!config.iosClientId || !config.androidClientId) {
    throw new Error('Missing required Google Auth configuration');
  }

  return config;
};
```

### 2. Performance Optimization

```typescript
// Lazy configuration
let isConfigured = false;

const ensureConfigured = async () => {
  if (!isConfigured) {
    await GoogleAuth.configure(getProductionConfig());
    isConfigured = true;
  }
};

// Optimized sign-in
const optimizedSignIn = async () => {
  await ensureConfigured();
  return await GoogleAuth.signIn();
};
```

### 3. Analytics Integration

```typescript
import analytics from '@react-native-firebase/analytics';

const trackAuthEvent = async (event: string, parameters?: any) => {
  try {
    await analytics().logEvent(event, parameters);
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};

const signInWithTracking = async () => {
  try {
    await trackAuthEvent('google_sign_in_attempt');
    const response = await GoogleAuth.signIn();
    
    if (response.type === 'success') {
      await trackAuthEvent('google_sign_in_success', {
        user_id: response.data.user.id
      });
    }
    
    return response;
  } catch (error) {
    await trackAuthEvent('google_sign_in_error', {
      error_code: error.code,
      error_message: error.message
    });
    throw error;
  }
};
```

---

**Next Steps:**
- [Token Management Guide](./token-management.md)
- [Error Handling Guide](./error-handling.md)
- [Production Deployment Guide](./production-guide.md)