# react-native-google-auth

A modern React Native Google Authentication library using the latest Google Sign-In SDK for iOS and Android Credential Manager for Android.

## Features

- ✅ **Modern APIs**: Uses Google Sign-In SDK for iOS and Android Credential Manager (not deprecated GoogleSignIn)
- ✅ **TypeScript Support**: Full TypeScript definitions included
- ✅ **Cross-platform**: Works on both iOS and Android
- ✅ **Easy Setup**: Simple configuration and usage
- ✅ **Error Handling**: Comprehensive error codes and messages

## Installation

```sh
yarn add react-native-google-auth
```

### iOS Setup

1. Install pods:
   ```bash
   cd ios && pod install
   ```
   
   *Note: The GoogleSignIn dependency is automatically included via the library's podspec.*

2. Add your iOS client ID to `ios/Info.plist`:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_IOS_CLIENT_ID</string>
   ```

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

No additional setup required! The library automatically includes all necessary dependencies through Gradle.

*Note: Google Play Services and Credential Manager dependencies are automatically configured.*

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
import { GoogleAuth } from 'react-native-google-auth';
```

### Configure (Required - Call this first)

```typescript
const configure = async () => {
  try {
    await GoogleAuth.configure({
      iosClientId: 'YOUR_IOS_CLIENT_ID',
      androidClientId: 'YOUR_ANDROID_CLIENT_ID', // Preferred for Android
      webClientId: 'YOUR_WEB_CLIENT_ID', // Fallback for Android, required for server verification
      hostedDomain: 'yourdomain.com' // Optional - for G Suite domains
    });
    console.log('Google Auth configured successfully');
  } catch (error) {
    console.error('Configuration failed:', error);
  }
};
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
  scopes?: string[];                 // Additional OAuth scopes to request
  hostedDomain?: string;             // G Suite domain restriction
  offlineAccess?: boolean;           // Request offline access (refresh tokens)
  forceCodeForRefreshToken?: boolean; // Force authorization code for refresh tokens
  accountName?: string;              // Account name hint
  profileImageSize?: number;         // Profile image size in pixels
  openIdRealm?: string;              // OpenID realm
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
