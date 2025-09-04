# React Native Google Authentication Library | Modern Google Sign-In SDK

[![npm version](https://badge.fury.io/js/react-native-google-auth.svg)](https://badge.fury.io/js/react-native-google-auth)
[![npm downloads](https://img.shields.io/npm/d18m/react-native-google-auth.svg)](https://img.shields.io/npm/d18m/react-native-google-auth.svg)
[![GitHub stars](https://img.shields.io/github/stars/sbaiahmed1/react-native-google-auth.svg)](https://github.com/sbaiahmed1/react-native-google-auth/stargazers)

> ⚠️ **Development Status**: This library is currently in active development. While core functionality is implemented and working, some features may still be under development or subject to change. Please use with caution in production environments.

**react-native-google-auth** is a comprehensive React Native Google Authentication library that provides seamless Google Sign-In integration for iOS and Android applications. Built with modern APIs including Google Sign-In SDK for iOS and Android Credential Manager, this library offers the most up-to-date Google authentication solution for React Native developers.

## Why Choose react-native-google-auth?

This React Native Google Sign-In library stands out from other Google authentication solutions by leveraging the latest Google APIs and providing a unified, type-safe interface for both iOS and Android platforms. Perfect for developers looking to implement Google OAuth, Google Login, or Google SSO in their React Native mobile applications.

## Key Features & Benefits

### 🚀 Modern Google Authentication APIs
- ✅ **Latest Google Sign-In SDK**: Uses Google Sign-In SDK for iOS and Android Credential Manager (not deprecated GoogleSignIn)
- ✅ **Google One Tap Sign-In**: Seamless authentication experience with saved credentials
- ✅ **OAuth 2.0 Compliant**: Full OAuth 2.0 and OpenID Connect support
- ✅ **Token Management**: Automatic token refresh and expiration handling

### 💻 Developer Experience
- ✅ **Full TypeScript Support**: Complete TypeScript definitions and IntelliSense
- ✅ **Cross-Platform Compatibility**: Works seamlessly on both iOS and Android
- ✅ **Zero Configuration**: Minimal setup required with sensible defaults
- ✅ **Comprehensive Documentation**: Detailed guides and API reference

### 🔒 Security & Reliability
- ✅ **Secure Token Storage**: Secure credential storage using platform keychain
- ✅ **Error Handling**: Comprehensive error codes and user-friendly messages
- ✅ **Production Ready**: Battle-tested authentication flows
- ✅ **Google Play Services**: Automatic Google Play Services availability checking

### 🍎 iOS Configuration Improvements (New!)
- ✅ **Automatic Client ID Detection**: Reads client ID from Info.plist when not provided
- ✅ **Configuration Validation**: Comprehensive validation for all configuration parameters
- ✅ **Enhanced Scope Management**: Support for additional OAuth scopes beyond default
- ✅ **Better Error Handling**: Detailed error messages for missing or invalid configuration

### 🤖 Android Configuration Improvements (New!)
- ✅ **Automatic Client ID Detection**: Reads client ID from google-services.json when not provided
- ✅ **Configuration Validation**: Comprehensive validation for all configuration parameters
- ✅ **Enhanced Scope Management**: Support for additional OAuth scopes beyond default
- ✅ **Better Error Handling**: Detailed error messages for missing or invalid configuration

### 🎯 Use Cases
- **React Native Google Login**: Implement Google sign-in in React Native apps
- **Mobile OAuth Authentication**: Secure user authentication for mobile apps
- **Social Login Integration**: Add Google as a social login provider
- **Enterprise SSO**: Single Sign-On for enterprise applications
- **User Profile Management**: Access Google user profile information

## Installation & Setup Guide

### NPM Installation

Install the React Native Google Authentication library using your preferred package manager:

```bash
# Using Yarn (Recommended)
yarn add react-native-google-auth

# Using NPM
npm install react-native-google-auth

# Using pnpm
pnpm add react-native-google-auth
```

### Quick Start

Get started with Google Sign-In in your React Native app in just 3 steps:

1. **Install the package** (see above)
2. **Configure your Google OAuth credentials** (see setup guides below)
3. **Initialize and use** the authentication methods

```typescript
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';

// Configure once in your app
await GoogleAuth.configure({
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID',
  scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE]
});

// Sign in users
const response = await GoogleAuth.signIn();
```

### iOS Setup

1. Install pods:
   ```bash
   cd ios && pod install
   ```
   
   *Note: The GoogleSignIn dependency is automatically included via the library's podspec.*

2. **Configure Client ID (Choose one method):**

   **Method A: Automatic Detection from Info.plist (Recommended)**
   
   Add your iOS client ID to `ios/Info.plist`:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_IOS_CLIENT_ID</string>
   ```
   
   With this method, you can configure without providing `iosClientId`:
   ```typescript
   await GoogleAuth.configure({
     androidClientId: 'YOUR_ANDROID_CLIENT_ID'
     // iosClientId automatically detected from Info.plist
   });
   ```

   **Method B: Manual Configuration**
   
   Provide the client ID directly in your configuration:
   ```typescript
   await GoogleAuth.configure({
     iosClientId: 'YOUR_IOS_CLIENT_ID',
     androidClientId: 'YOUR_ANDROID_CLIENT_ID'
   });
   ```

   **Method C: GoogleService-Info.plist (Alternative)**
   
   If you have a `GoogleService-Info.plist` file, the library will automatically detect the `CLIENT_ID` from it.

3. Add URL schemes to `ios/Info.plist` (replace with your actual iOS client ID):
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>googleauth</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```
   
   **Note:** Remove `.apps.googleusercontent.com` from your iOS client ID when adding it to URL schemes.

4. Configure URL handling in your `AppDelegate.swift`:
   ```swift
   import GoogleSignIn
   
   // Add this method to handle URL schemes
   func application(
     _ app: UIApplication,
     open url: URL,
     options: [UIApplication.OpenURLOptionsKey: Any] = [:]
   ) -> Bool {
     return GIDSignIn.sharedInstance.handle(url)
   }
   ```

### Android Setup

1. Add the following to your `android/app/build.gradle`:
   ```gradle
   dependencies {
     implementation 'androidx.credentials:credentials:1.3.0'
     implementation 'androidx.credentials:credentials-play-services-auth:1.3.0'
     implementation 'com.google.android.libraries.identity.googleid:googleid:1.1.0'
   }
   ```
   
   *Note: These dependencies are automatically included via the library's build.gradle.*

2. **Configure Client ID (Choose one method):**

   **Method A: Automatic Detection from google-services.json (Recommended)**
   
   Add your `google-services.json` file to `android/app/` directory:
   ```
   android/
   └── app/
       └── google-services.json
   ```
   
   With this method, you can configure without providing `androidClientId`:
   ```typescript
   await GoogleAuth.configure({
     androidClientId: 'YOUR_ANDROID_CLIENT_ID',
     // androidClientId automatically detected from google-services.json
   });
   ```

   **Method B: Manual Configuration**
   
   Provide the client ID directly in your configuration:
   ```typescript
   await GoogleAuth.configure({
     androidClientId: 'YOUR_ANDROID_CLIENT_ID',
     iosClientId: 'YOUR_IOS_CLIENT_ID'
   });
   ```

## Getting Client IDs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sign-In API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**

### For iOS:
- Application type: **iOS**
- Bundle ID: Your iOS app's bundle identifier
- Copy the **Client ID**

### For Android:
- Application type: **Android**
- Package name: Your Android app's package name
- SHA-1 certificate fingerprint:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- Copy the **Client ID**

## Usage

### Import

```typescript
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';
```

### Configure (Required - Call this first)

```typescript
const configure = async () => {
  try {
    await GoogleAuth.configure({
      iosClientId: 'YOUR_IOS_CLIENT_ID', // Optional on iOS - auto-detected from Info.plist
      androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Preferred for Android
      webClientId: 'YOUR_WEB_CLIENT_ID', // Fallback for Android, required for server verification
      hostedDomain: 'yourdomain.com', // Optional - for G Suite domains
      scopes: [ // Optional - additional OAuth scopes (use enum for common scopes)
        GoogleAuthScopes.EMAIL,
        GoogleAuthScopes.PROFILE,
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/calendar.readonly'
      ]
    });
    console.log('Google Auth configured successfully');
  } catch (error) {
    console.error('Configuration failed:', error);
  }
};
```

#### Configuration Options

- **iosClientId** (iOS): Optional if configured in Info.plist. The library automatically detects from:
  1. `GIDClientID` key in Info.plist (recommended)
  2. `CLIENT_ID` key in GoogleService-Info.plist
- **androidClientId** (Android): Optional if google-services.json is configured. The library automatically detects from:
  1. `google-services.json` file in android/app/ directory (recommended)
  2. Falls back to webClientId if neither androidClientId nor google-services.json is available
- **webClientId**: Used for server-side verification and Android fallback
- **hostedDomain**: Restricts sign-in to users from a specific G Suite domain
- **scopes**: Array of OAuth 2.0 scopes to request. Supports:
  - GoogleAuthScopes enum for common scopes (recommended for type safety)
  - Google API scopes: `https://www.googleapis.com/auth/[service]`
  - OpenID Connect scopes: `openid`, `email`, `profile`
- **offlineAccess**: Request refresh token for offline access

#### OAuth Scopes

The library provides a `GoogleAuthScopes` enum for type-safe scope definitions:

```typescript
import { GoogleAuthScopes } from 'react-native-google-auth';

// Use predefined scopes for type safety
await GoogleAuth.configure({
  scopes: [
    GoogleAuthScopes.EMAIL,
    GoogleAuthScopes.PROFILE,
    GoogleAuthScopes.DRIVE_READONLY,
    GoogleAuthScopes.CALENDAR,
  ]
});

// Or mix with custom scopes
await GoogleAuth.configure({
  scopes: [
    GoogleAuthScopes.EMAIL,
    'https://www.googleapis.com/auth/custom.scope'
  ]
});
```

**Available Scopes:**
- **OpenID Connect**: `OPENID`, `EMAIL`, `PROFILE`
- **Google Drive**: `DRIVE`, `DRIVE_FILE`, `DRIVE_READONLY`
- **Gmail**: `GMAIL_READONLY`, `GMAIL_MODIFY`, `GMAIL_COMPOSE`
- **Calendar**: `CALENDAR`, `CALENDAR_READONLY`
- **Contacts**: `CONTACTS`, `CONTACTS_READONLY`
- **YouTube**: `YOUTUBE`, `YOUTUBE_READONLY`
- **Photos**: `PHOTOS`, `PHOTOS_READONLY`
- **Google Workspace**: `SPREADSHEETS`, `DOCUMENTS`, `PRESENTATIONS` (with readonly variants)
- **Cloud Platform**: `CLOUD_PLATFORM`, `CLOUD_PLATFORM_READONLY`
- **Analytics**: `ANALYTICS`, `ANALYTICS_READONLY`
- **Fitness**: `FITNESS_ACTIVITY_READ`, `FITNESS_BODY_READ`, `FITNESS_LOCATION_READ`
- **Other**: `USERINFO_EMAIL`, `USERINFO_PROFILE`, `PLUS_ME`, `ADWORDS`, `BLOGGER`

#### Configuration Validation

The library automatically validates:
- Client ID format (must match Google OAuth format)
- Domain format for hosted domains
- OAuth scope format and validity
- Required parameters based on platform
- Automatic detection fallbacks for both iOS and Android
```

### Sign In

```typescript
const signIn = async () => {
  try {
    const response = await GoogleAuth.signIn();
    
    if (response.type === 'success') {
      console.log('User signed in:', response.data.user);
      console.log('Access token:', response.data.accessToken);
      console.log('ID token:', response.data.idToken);
      // response.data.user contains: id, email, name, photo, etc.
    } else if (response.type === 'cancelled') {
      console.log('Sign in was cancelled by user');
    } else if (response.type === 'noSavedCredentialFound') {
      console.log('No saved credential found');
    }
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
```

### Sign Out

```typescript
const signOut = async () => {
  try {
    await GoogleAuth.signOut();
    console.log('User signed out');
  } catch (error) {
    console.error('Sign out failed:', error);
  }
};
```

### Get Tokens

```typescript
const getTokens = async () => {
  try {
    const tokens = await GoogleAuth.getTokens();
    console.log('Tokens:', tokens);
    // tokens contains: accessToken, idToken, etc.
  } catch (error) {
    console.error('Failed to get tokens:', error);
  }
};
```

### Refresh Tokens

```typescript
const refreshTokens = async () => {
  try {
    const refreshedTokens = await GoogleAuth.refreshTokens();
    console.log('Refreshed tokens:', refreshedTokens);
    // refreshedTokens contains: accessToken, idToken, user, expiresAt
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
  }
};
```

### Check Token Expiration

```typescript
const checkTokenExpiration = async () => {
  try {
    const isExpired = await GoogleAuth.isTokenExpired();
    console.log('Token expired:', isExpired);
    
    if (isExpired) {
      // Automatically refresh tokens
      await refreshTokens();
    }
  } catch (error) {
    console.error('Failed to check token expiration:', error);
  }
};
```

### Get Current User

```typescript
const getCurrentUser = async () => {
  try {
    const currentUser = await GoogleAuth.getCurrentUser();
    if (currentUser) {
      console.log('Current user:', currentUser);
      // currentUser contains: id, name, email, photo, familyName, givenName
    } else {
      console.log('No user currently signed in');
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
};
```



### Check Play Services

```typescript
const checkPlayServices = async () => {
  try {
    const playServicesInfo = await GoogleAuth.checkPlayServices();
    console.log('Play Services available:', playServicesInfo.isAvailable);
    if (playServicesInfo.status) {
      console.log('Play Services status:', playServicesInfo.status);
    }
  } catch (error) {
    console.error('Play Services check failed:', error);
  }
};
```

*Note: This method is primarily useful on Android to check if Google Play Services are available. On iOS, it always returns `{ isAvailable: true }` since Play Services are not required.*

## Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { GoogleAuth } from 'react-native-google-auth';

const GoogleAuthExample = () => {
  const [user, setUser] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  useEffect(() => {
    configureGoogleAuth();
    checkCurrentUser();
  }, []);

  const configureGoogleAuth = async () => {
    try {
      await GoogleAuth.configure({
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: 'YOUR_WEB_CLIENT_ID'
      });
      setIsConfigured(true);
    } catch (error) {
      Alert.alert('Configuration Error', error.message);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const currentUser = await GoogleAuth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await checkTokenExpiration();
      }
    } catch (error) {
      console.log('No current user:', error.message);
    }
  };

  const checkTokenExpiration = async () => {
    try {
      const isExpired = await GoogleAuth.isTokenExpired();
      setTokenExpired(isExpired);
      
      if (isExpired) {
        Alert.alert('Token Expired', 'Your session has expired. Please refresh tokens.');
      }
    } catch (error) {
      console.error('Failed to check token expiration:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await GoogleAuth.signIn();
      
      if (response.type === 'success') {
        setUser(response.data.user);
        setTokenExpired(false);
        Alert.alert('Success', 'Signed in successfully!');
      } else if (response.type === 'cancelled') {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      } else if (response.type === 'noSavedCredentialFound') {
        Alert.alert('No Saved Credential', 'No saved credential found, please sign in manually');
      }
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
      setTokens(null);
      setTokenExpired(false);
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  const handleRefreshTokens = async () => {
    try {
      const refreshedTokens = await GoogleAuth.refreshTokens();
      setTokens(refreshedTokens);
      setTokenExpired(false);
      Alert.alert('Success', 'Tokens refreshed successfully!');
    } catch (error) {
      Alert.alert('Refresh Error', error.message);
    }
  };

  const handleGetTokens = async () => {
    try {
      const currentTokens = await GoogleAuth.getTokens();
      setTokens(currentTokens);
      Alert.alert('Tokens Retrieved', 'Check console for token details');
      console.log('Current tokens:', currentTokens);
    } catch (error) {
      Alert.alert('Token Error', error.message);
    }
  };

  if (!isConfigured) {
    return <Text>Configuring Google Auth...</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      {user ? (
        <View>
          <Text>Welcome, {user.name}!</Text>
          <Text>Email: {user.email}</Text>
          {tokenExpired && (
            <Text style={{ color: 'red' }}>⚠️ Token Expired</Text>
          )}
          <View style={{ marginTop: 10 }}>
            <Button title="Sign Out" onPress={handleSignOut} />
            <View style={{ marginTop: 5 }} />
            <Button title="Get Tokens" onPress={handleGetTokens} />
            <View style={{ marginTop: 5 }} />
            <Button title="Refresh Tokens" onPress={handleRefreshTokens} />
            <View style={{ marginTop: 5 }} />
            <Button title="Check Token Expiration" onPress={checkTokenExpiration} />
          </View>
        </View>
      ) : (
        <Button title="Sign In with Google" onPress={handleSignIn} />
      )}
    </View>
  );
};

export default GoogleAuthExample;
```

## Error Handling

```typescript
import { GoogleAuthError, GoogleAuthErrorCodes } from 'react-native-google-auth';

try {
  await GoogleAuth.signIn();
} catch (error) {
  switch (error.code) {
    case GoogleAuthErrorCodes.SIGN_IN_CANCELLED:
      console.log('User cancelled sign in');
      break;
    case GoogleAuthErrorCodes.IN_PROGRESS:
      console.log('Sign in already in progress');
      break;
    case GoogleAuthErrorCodes.PLAY_SERVICES_NOT_AVAILABLE:
      console.log('Play Services not available');
      break;
    case GoogleAuthErrorCodes.TOKEN_EXPIRED:
      console.log('Token has expired');
      break;
    case GoogleAuthErrorCodes.NOT_SIGNED_IN:
      console.log('User is not signed in');
      break;
    default:
      console.error('Unknown error:', error.message);
  }
}
```

## API Reference

### Methods

| Method | Platform | Description |
|--------|----------|-------------|
| `configure(config)` | iOS, Android | Configure Google Auth with client IDs |
| `signIn()` | iOS, Android | Sign in with Google using One Tap or standard flow |
| `signOut()` | iOS, Android | Sign out current user |
| `getTokens()` | iOS, Android | Get access and ID tokens for current user |
| `refreshTokens()` | iOS, Android | Refresh access and ID tokens |
| `isTokenExpired()` | iOS, Android | Check if current token is expired |
| `getCurrentUser()` | iOS, Android | Get current authenticated user info |
| `checkPlayServices(showErrorDialog?)` | Android | Check if Play Services is available |

### Configuration Options

```typescript
interface ConfigureParams {
  iosClientId?: string;              // iOS OAuth client ID
  androidClientId?: string;          // Android OAuth client ID (preferred for Android)
  webClientId?: string;              // Web OAuth client ID (fallback for Android, required for server verification)
  scopes?: string[];                 // Additional OAuth scopes to request (use GoogleAuthScopes enum for common scopes)
  hostedDomain?: string;             // G Suite domain restriction
  offlineAccess?: boolean;           // Request offline access (refresh tokens)
  forceCodeForRefreshToken?: boolean; // Force authorization code for refresh tokens
  accountName?: string;              // Account name hint
  profileImageSize?: number;         // Profile image size in pixels
  openIdRealm?: string;              // OpenID realm
}

// GoogleAuthScopes enum for type-safe scope definitions
enum GoogleAuthScopes {
  EMAIL = 'email',
  PROFILE = 'profile',
  OPENID = 'openid',
  DRIVE_READONLY = 'https://www.googleapis.com/auth/drive.readonly',
  CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly',
  GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly',
  PHOTOS_READONLY = 'https://www.googleapis.com/auth/photoslibrary.readonly'
}
```

### User Info Response

```typescript
interface User {
  id: string;                // User's Google ID
  name: string | null;       // User's display name
  email: string;             // User's email
  photo: string | null;      // User's profile photo URL
  familyName: string | null; // User's family name
  givenName: string | null;  // User's given name
}
```

### Sign In Response

```typescript
type OneTapResponse = 
  | { type: 'success'; data: { idToken: string; accessToken: string | null; user: User; } }
  | { type: 'noSavedCredentialFound' }
  | { type: 'cancelled' };
```

### Tokens Response

```typescript
interface GetTokensResponse {
  idToken: string;       // OpenID Connect ID token
  accessToken: string;   // OAuth access token
  expiresAt?: number;    // Unix timestamp when token expires
}

interface RefreshTokensResponse {
  idToken: string;       // Refreshed OpenID Connect ID token
  accessToken: string;   // Refreshed OAuth access token
  expiresAt?: number;    // Unix timestamp when token expires
}
```

### Play Services Response

```typescript
interface PlayServicesInfo {
  isAvailable: boolean;  // Whether Play Services is available
  status?: number;       // Play Services status code (Android only)
}
```

### Error Codes

The library provides comprehensive error codes for different scenarios:

```typescript
// Configuration errors
NOT_CONFIGURED          // Google Auth not configured
INVALID_CONFIG          // Invalid configuration parameters
CONFIG_ERROR           // Configuration failed

// Sign-in errors
SIGN_IN_ERROR          // General sign-in error
SIGN_IN_CANCELLED      // User cancelled sign-in
IN_PROGRESS            // Sign-in already in progress
NOT_SIGNED_IN          // User is not signed in

// Platform-specific errors
NO_ACTIVITY            // No activity available (Android)
NO_VIEW_CONTROLLER     // No view controller available (iOS)

// Token errors
TOKEN_ERROR            // General token error
TOKEN_REFRESH_ERROR    // Token refresh error
TOKEN_REFRESH_FAILED   // Token refresh failed
TOKEN_EXPIRED          // Token has expired
INVALID_TOKEN          // Invalid token

// Play Services errors (Android)
PLAY_SERVICES_NOT_AVAILABLE // Play Services not available
PLAY_SERVICES_ERROR         // Play Services error

// Network errors
NETWORK_ERROR          // Network connection error

// Implementation errors
NOT_IMPLEMENTED        // Feature not implemented
```

## Troubleshooting & FAQ

### Common Issues and Solutions

#### 🔧 Configuration Issues

**Q: "Google Auth not configured" error**
```typescript
// ❌ Wrong - calling signIn before configure
await GoogleAuth.signIn();

// ✅ Correct - configure first
await GoogleAuth.configure({
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID'
});
await GoogleAuth.signIn();
```

**Q: Invalid configuration parameters**
- Ensure client IDs are correct and match your Google Cloud Console setup
- Verify bundle ID (iOS) and package name (Android) match your app configuration
- Check that OAuth consent screen is properly configured

#### 📱 Platform-Specific Issues

**iOS Issues:**
- **"No view controller available"**: Ensure you're calling Google Auth methods from the main thread
- **"Invalid client ID"**: Verify your iOS client ID in Google Cloud Console
- **App crashes on sign-in**: Check if you've added the URL scheme to `Info.plist`

**Android Issues:**
- **"Play Services not available"**: User needs to update Google Play Services
- **"No activity available"**: Ensure you're calling from a valid React Native context
- **SHA-1 fingerprint issues**: Verify your app's SHA-1 fingerprint is added to Google Cloud Console

#### 🔐 Authentication Flow Issues

**Q: Sign-in cancelled by user**
```typescript
try {
  const result = await GoogleAuth.signIn();
  if (result.type === 'cancelled') {
    console.log('User cancelled sign-in');
    // Handle cancellation gracefully
  }
} catch (error) {
  if (error.code === GoogleAuthErrorCodes.SIGN_IN_CANCELLED) {
    // User cancelled the sign-in flow
  }
}
```

**Q: Token expired errors**
```typescript
// Check token expiration before making API calls
const isExpired = await GoogleAuth.isTokenExpired();
if (isExpired) {
  await GoogleAuth.refreshTokens();
}
```

#### 🌐 Network and Connectivity

**Q: Network errors during sign-in**
- Check internet connectivity
- Verify Google services are not blocked by firewall
- Ensure proper DNS resolution

**Q: "NETWORK_ERROR" when signing in**
```typescript
try {
  await GoogleAuth.signIn();
} catch (error) {
  if (error.code === GoogleAuthErrorCodes.NETWORK_ERROR) {
    // Show user-friendly network error message
    Alert.alert('Network Error', 'Please check your internet connection');
  }
}
```

### Frequently Asked Questions

#### General Questions

**Q: How do I get Google Client IDs?**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google Sign-In API
4. Create OAuth 2.0 credentials
5. Configure OAuth consent screen

**Q: What's the difference between iOS and Android Client IDs?**
- **iOS Client ID**: For iOS app authentication
- **Android Client ID**: For Android app authentication

#### Security Questions

**Q: How are tokens stored securely?**
- iOS: Stored in iOS Keychain
- Android: Stored using Android Keystore
- Tokens are encrypted and tied to your app's signature

**Q: How do I verify tokens on my server?**
```typescript
// Get ID token for server verification
const tokens = await GoogleAuth.getTokens();
const idToken = tokens.idToken;

// Send to your server for verification
fetch('/api/verify-google-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken })
});
```

#### Development Questions

**Q: Can I test without Google Play Services?**
- iOS: Yes, works on simulator and device
- Android: Requires Google Play Services or use emulator with Google APIs

**Q: How do I handle different environments (dev/staging/prod)?**
```typescript
const config = {
  iosClientId: __DEV__ ? 'DEV_IOS_CLIENT_ID' : 'PROD_IOS_CLIENT_ID',
  androidClientId: __DEV__ ? 'DEV_ANDROID_CLIENT_ID' : 'PROD_ANDROID_CLIENT_ID'
};
await GoogleAuth.configure(config);
```

### Performance Optimization

#### Best Practices

1. **Configure once**: Call `configure()` only once in your app lifecycle
2. **Check token expiration**: Verify tokens before API calls
3. **Handle errors gracefully**: Provide user-friendly error messages
4. **Cache user data**: Store user info locally to reduce API calls

#### Memory Management

```typescript
// Good: Check if already configured
if (!GoogleAuth.isConfigured) {
  await GoogleAuth.configure(config);
}

// Good: Cleanup on app exit
const handleAppExit = async () => {
  await GoogleAuth.signOut();
};
```

### Migration Guide

#### From @react-native-google-signin/google-signin

```typescript
// Old library
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// New library
import { GoogleAuth } from 'react-native-google-auth';

// Configuration changes
// Old:
GoogleSignin.configure({ webClientId: 'CLIENT_ID' });
// New:
GoogleAuth.configure({ 
  iosClientId: 'IOS_CLIENT_ID',
  androidClientId: 'ANDROID_CLIENT_ID' 
});

// Method changes
// Old:
const userInfo = await GoogleSignin.signIn();
// New:
const response = await GoogleAuth.signIn();
if (response.type === 'success') {
  const userInfo = response.data.user;
}
```

## Important Notes

- **Always call `configure()` before using other methods**
- **iOS**: Client ID is automatically detected from `Info.plist` if not provided
- **Android**: Uses the new Credential Manager API (not deprecated GoogleSignIn)
- **Android Client ID Priority**: Android prefers `androidClientId` when provided, falls back to `webClientId`
- **Web Client ID**: Required for server-side verification of tokens and as Android fallback
- **Hosted Domain**: Restricts sign-in to specific G Suite domains

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
