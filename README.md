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

1. Add GoogleSignIn to your `ios/Podfile`:
   ```ruby
   pod 'GoogleSignIn'
   ```

2. Install pods:
   ```bash
   cd ios && pod install
   ```

3. Add your iOS client ID to `ios/Info.plist`:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_IOS_CLIENT_ID</string>
   ```

4. Add URL schemes to `ios/Info.plist` (replace with your actual iOS client ID):
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

5. Configure URL handling in your `AppDelegate.swift`:
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

1. Add dependencies to `android/app/build.gradle`:
   ```gradle
   dependencies {
       implementation 'androidx.credentials:credentials:1.2.2'
       implementation 'androidx.credentials:credentials-play-services-auth:1.2.2'
       implementation 'com.google.android.libraries.identity.googleid:googleid:1.1.0'
   }
   ```

2. Download `google-services.json` from Firebase Console and place it in `android/app/`:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project or create a new one
   - Add your Android app with your package name
   - Download `google-services.json` and place it in `android/app/google-services.json`

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

### For Web (Server-side verification):
- Application type: **Web application**
- Copy the **Client ID** (used for token verification on your backend)

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
    const userInfo = await GoogleAuth.signIn();
    console.log('User signed in:', userInfo);
    // userInfo contains: id, email, name, photo, etc.
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
```

### Create Account (Android only)

```typescript
const createAccount = async () => {
  try {
    const userInfo = await GoogleAuth.createAccount();
    console.log('Account created:', userInfo);
  } catch (error) {
    console.error('Account creation failed:', error);
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

### Check Play Services (Android only)

```typescript
const checkPlayServices = async () => {
  try {
    const isAvailable = await GoogleAuth.checkPlayServices();
    console.log('Play Services available:', isAvailable);
  } catch (error) {
    console.error('Play Services check failed:', error);
  }
};
```

## Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { GoogleAuth } from 'react-native-google-auth';

const GoogleAuthExample = () => {
  const [user, setUser] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    configureGoogleAuth();
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

  const handleSignIn = async () => {
    try {
      const userInfo = await GoogleAuth.signIn();
      setUser(userInfo);
    } catch (error) {
      Alert.alert('Sign In Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
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
          <Button title="Sign Out" onPress={handleSignOut} />
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
import { GoogleAuthError } from 'react-native-google-auth';

try {
  await GoogleAuth.signIn();
} catch (error) {
  switch (error.code) {
    case GoogleAuthError.SIGN_IN_CANCELLED:
      console.log('User cancelled sign in');
      break;
    case GoogleAuthError.IN_PROGRESS:
      console.log('Sign in already in progress');
      break;
    case GoogleAuthError.PLAY_SERVICES_NOT_AVAILABLE:
      console.log('Play Services not available');
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
| `signIn()` | iOS, Android | Sign in with Google |
| `createAccount()` | Android | Create new Google account |
| `signOut()` | iOS, Android | Sign out current user |
| `getTokens()` | iOS, Android | Get access and ID tokens |
| `checkPlayServices()` | Android | Check if Play Services is available |

### Configuration Options

```typescript
interface GoogleAuthConfig {
  iosClientId?: string;        // iOS OAuth client ID
  androidClientId?: string;    // Android OAuth client ID (preferred for Android)
  webClientId?: string;        // Web OAuth client ID (fallback for Android, required for server verification)
  hostedDomain?: string;       // G Suite domain restriction
}
```

### User Info Response

```typescript
interface GoogleUser {
  id: string;           // User's Google ID
  email: string;        // User's email
  name: string;         // User's display name
  photo?: string;       // User's profile photo URL
  familyName?: string;  // User's family name
  givenName?: string;   // User's given name
}
```

### Tokens Response

```typescript
interface GoogleTokens {
  accessToken: string;  // OAuth access token
  idToken?: string;     // OpenID Connect ID token
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
