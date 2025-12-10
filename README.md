# React Native Google Authentication Library | Modern Google Sign-In SDK

[![npm version](https://badge.fury.io/js/react-native-google-auth.svg)](https://badge.fury.io/js/react-native-google-auth)
[![npm downloads](https://img.shields.io/npm/d18m/react-native-google-auth.svg)](https://img.shields.io/npm/d18m/react-native-google-auth.svg)
[![GitHub stars](https://img.shields.io/github/stars/sbaiahmed1/react-native-google-auth.svg)](https://github.com/sbaiahmed1/react-native-google-auth/stargazers)

**react-native-google-auth** is a comprehensive React Native Google Authentication library that provides seamless Google Sign-In integration for iOS and Android applications. Built with modern APIs including Google Sign-In SDK for iOS and Android Credential Manager, this library offers the most up-to-date Google authentication solution for React Native developers.

## 📋 Table of Contents

- [Why Choose react-native-google-auth?](#why-choose-react-native-google-auth)
- [Key Features & Benefits](#key-features--benefits)
- [Installation](#installation)
- [🚀 Quick Start](#-quick-start)
- [📱 Platform Setup](#-platform-setup)
  - [Expo Setup (Recommended)](#expo-setup-recommended)
  - [React Native CLI Setup](#react-native-cli-setup)
- [🔧 Google Cloud Console Setup](#-google-cloud-console-setup)
- [💻 Usage](#-usage)
- [🔍 API Reference](#-api-reference)
- [🐛 Troubleshooting](#-troubleshooting)
- [📚 Examples](#-examples)

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
- ✅ **Expo Config Plugin**: Zero-configuration setup for Expo projects
- ✅ **Comprehensive Documentation**: Detailed guides and API reference

### 🔒 Security & Reliability
- ✅ **Secure Token Storage**: Secure credential storage using platform keychain
- ✅ **Error Handling**: Comprehensive error codes and user-friendly messages
- ✅ **Production Ready**: Battle-tested authentication flows
- ✅ **Google Play Services**: Automatic Google Play Services availability checking

### 🎯 Use Cases
- **React Native Google Login**: Implement Google sign-in in React Native apps
- **Mobile OAuth Authentication**: Secure user authentication for mobile apps
- **Social Login Integration**: Add Google as a social login provider
- **Enterprise SSO**: Single Sign-On for enterprise applications
- **User Profile Management**: Access Google user profile information

## Installation

Install the React Native Google Authentication library using your preferred package manager:

```bash
# Using Yarn (Recommended)
yarn add react-native-google-auth

# Using NPM
npm install react-native-google-auth

# Using pnpm
pnpm add react-native-google-auth

# For Expo projects
npx expo install react-native-google-auth
```

## 🚀 Quick Start

Get started with Google Sign-In in your React Native app in just 3 steps:

1. **Install the package** (see above)
2. **Configure your Google OAuth credentials** (see setup guides below)
3. **Initialize and use** the authentication methods

```typescript
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';

// Configure once in your app
await GoogleAuth.configure({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Use Web OAuth client ID for Android
  scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE]
});

// Sign in users
const response = await GoogleAuth.signIn();
if (response.type === 'success') {
  console.log('User signed in:', response.data.user);
}
```

> **Android Note:** The `androidClientId` must be a **Web application OAuth client ID** (not Android OAuth client), as required by the Android Credential Manager API.

## 📱 Platform Setup

### Expo Setup (Recommended)

> **⚠️ Important**: This library requires native code and is **not compatible with Expo Go**. You must use **Expo Development Build** or eject to a bare React Native project.

#### Prerequisites

- Expo SDK 49+ (recommended)
- Expo Development Build configured
- EAS CLI installed: `npm install -g @expo/eas-cli` or local dev server

#### Step 1: Install the Package

```bash
npx expo install react-native-google-auth
```

#### Step 2: Configure the Expo Plugin

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "name": "Your App Name",
    "plugins": [
      [
        "react-native-google-auth",
        {
          "iosClientId": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
          "androidClientId": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com"
        }
      ]
    ]
  }
}
```

**Alternative: Automatic Configuration (Recommended)**

Place your Google configuration files in your project root and let the plugin auto-detect them:

1. Download `GoogleService-Info.plist` from Firebase Console (iOS)
2. Download `google-services.json` from Firebase Console (Android)
3. Place both files in your project root (same level as `app.json`)

```json
{
  "expo": {
    "plugins": [
      "react-native-google-auth"
    ]
  }
}
```

#### Step 3: Configure Platform-Specific Settings

**iOS Configuration in app.json:**

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "infoPlist": {
        "GIDClientID": "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com"
      }
    }
  }
}
```

**Android Configuration in app.json:**

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

#### Step 4: Create Development Build

```bash
# Login to EAS (if not already logged in)
eas login

# Configure your project (if first time)
eas build:configure

# Create development build
eas build --profile development --platform all

# Or for specific platform
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Step 5: Install and Test

1. Install the development build on your device
2. Start the development server:
   ```bash
   npx expo start --dev-client
   ```

#### Step 6: Use in Your App

```typescript
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    configureGoogleAuth();
  }, []);

  const configureGoogleAuth = async () => {
    try {
      await GoogleAuth.configure({
        // Client IDs are automatically detected from plugin configuration
        scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE]
      });
      console.log('Google Auth configured successfully');
    } catch (error) {
      console.error('Google Auth configuration failed:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const response = await GoogleAuth.signIn();

      if (response.type === 'success') {
        console.log('User signed in:', response.data.user);
        // Handle successful sign-in
      } else if (response.type === 'cancelled') {
        console.log('Sign in cancelled by user');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Your app components...
}
```

#### Expo Plugin Options

The config plugin accepts the following options:

```typescript
interface GoogleAuthPluginOptions {
  iosClientId?: string;              // iOS OAuth client ID
  androidClientId?: string;          // Android OAuth client ID
  googleServicesFile?: string;       // Path to google-services.json (default: './google-services.json')
  iosGoogleServicesFile?: string;    // Path to GoogleService-Info.plist (default: './GoogleService-Info.plist')
}
```

**Example with custom file paths:**

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-auth",
        {
          "googleServicesFile": "./config/google-services.json",
          "iosGoogleServicesFile": "./config/GoogleService-Info.plist"
        }
      ]
    ]
  }
}
```

### React Native CLI Setup

#### iOS Setup

1. **Install pods:**
   ```bash
   cd ios && pod install
   ```

2. **Configure Client ID (Choose one method):**

   **Method A: Automatic Detection from Info.plist (Recommended)**

   Add your iOS client ID to `ios/YourApp/Info.plist`:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
   ```

   **Method B: Manual Configuration**

   Provide the client ID directly in your configuration:
   ```typescript
   await GoogleAuth.configure({
     iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
     androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com'
   });
   ```

3. **Add URL schemes to `ios/YourApp/Info.plist`:**
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>com.yourcompany.yourapp</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```

4. **Configure URL handling in your `AppDelegate.swift`:**
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

#### Android Setup

1. **Configure Client ID (Choose one method):**

   **Method A: Automatic Detection from google-services.json (Recommended)**

   Add your `google-services.json` file to `android/app/` directory.

   > **Important:** The library will automatically extract the Web client ID (client_type: 3) from your `google-services.json`. This is the correct client ID for Android Credential Manager authentication.

   **Method B: Manual Configuration**

   Provide the **Web application** client ID directly in your configuration:
   ```typescript
   await GoogleAuth.configure({
     androidClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Use Web OAuth client ID, NOT Android client ID
     iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com'
   });
   ```

   > **Note:** The `androidClientId` should be your **Web application OAuth client ID** (client_type: 3 in google-services.json), not the Android OAuth client ID. The Android OAuth client is used only for linking your SHA-1 certificate to the project.

## 🔧 Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sign-In API**

### Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for public apps) or **Internal** (for G Suite domains)
3. Fill in the required information:
  - App name
  - User support email
  - Developer contact information
4. Add scopes (at minimum: `email`, `profile`, `openid`)
5. Save and continue

### Step 3: Create OAuth 2.0 Client IDs

#### For iOS:
1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
2. Application type: **iOS**
3. Name: Your app name (iOS)
4. Bundle ID: Your iOS app's bundle identifier (e.g., `com.yourcompany.yourapp`)
5. Click **Create**
6. Copy the **Client ID** (ends with `.apps.googleusercontent.com`)

#### For Android:

**Important:** For Android, you need to create **both** an Android OAuth client AND a Web application OAuth client.

**Step 1: Create Android OAuth Client (for SHA-1 certificate)**
1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
2. Application type: **Android**
3. Name: Your app name (Android)
4. Package name: Your Android app's package name (e.g., `com.yourcompany.yourapp`)
5. SHA-1 certificate fingerprint:

   **For development:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

   **For Expo development builds:**
   ```bash
   eas credentials -p android
   ```

   **For production:**
   ```bash
   keytool -list -v -keystore path/to/your/release.keystore -alias your-key-alias
   ```

6. Click **Create**

**Step 2: Create Web Application OAuth Client (Required for Android Authentication)**
1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
2. Application type: **Web application**
3. Name: Your app name (Web)
4. Click **Create**
5. **Copy this Client ID** - this is what you'll use for `androidClientId` in your configuration

> **Why do I need a Web client ID for Android?**
>
> The Android Credential Manager API requires a Web OAuth client ID (client_type: 3) for authentication. This is used to generate ID tokens and authenticate with your backend server. The Android OAuth client (created in Step 1) is only used for associating your app's package name and SHA-1 certificate with your project.
>
> When you download `google-services.json`, look for the `oauth_client` entry with `"client_type": 3` - this is the Web client ID you should use in your `androidClientId` configuration.

### Step 4: Download Configuration Files (Optional but Recommended)

#### For iOS:
1. In your OAuth 2.0 client, click **Download plist**
2. Save as `GoogleService-Info.plist`
3. Place in your project root (for Expo) or `ios/YourApp/` (for React Native CLI)

#### For Android:
1. Go to **Firebase Console** → **Project Settings** → **General**
2. Add your Android app if not already added
3. Download `google-services.json`
4. Place in your project root (for Expo) or `android/app/` (for React Native CLI)

## 💻 Usage

### Import

```typescript
import { GoogleAuth, GoogleAuthScopes } from 'react-native-google-auth';
```

### Configure (Required - Call this first)

```typescript
const configure = async () => {
  try {
    await GoogleAuth.configure({
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional on iOS - auto-detected from Info.plist
      androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com', // Optional on Android - auto-detected from google-services.json
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Optional - for server verification
      hostedDomain: 'yourdomain.com', // Optional - for G Suite domains
      forceAccountPicker: true, // Optional (iOS only) - always show account picker, even if user is already signed in
      scopes: [ // Optional - additional OAuth scopes
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

#### Force Account Picker (iOS)

By default, the library attempts silent sign-in first, which automatically signs in the user with their previously used Google account. To force the account picker to always show (useful when users have multiple Google accounts), use the `forceAccountPicker` option:

```typescript
await GoogleAuth.configure({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  forceAccountPicker: true, // Always show account picker on iOS
});
```

> **Note:** This option only affects iOS. On Android, the Credential Manager API handles account selection automatically.

### Sign In

```typescript
const signIn = async () => {
  try {
    const response = await GoogleAuth.signIn();

    if (response.type === 'success') {
      const { user, idToken, accessToken } = response.data;
      console.log('User:', user);
      console.log('Access Token:', accessToken); // null on Android
      console.log('ID Token:', idToken);
    } else if (response.type === 'cancelled') {
      console.log('Sign in was cancelled');
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
    console.log('User signed out successfully');
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
    console.log('ID Token:', tokens.idToken);
    console.log('Access Token:', tokens.accessToken); // null on Android
    console.log('User:', tokens.user);
  } catch (error) {
    console.error('Failed to get tokens:', error);
  }
};
```

### Get Current User

```typescript
const getCurrentUser = async () => {
  try {
    const user = await GoogleAuth.getCurrentUser();
    if (user) {
      console.log('Current user:', user);
    } else {
      console.log('No user is currently signed in');
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
};
```

### Refresh Tokens

```typescript
const refreshTokens = async () => {
  try {
    const tokens = await GoogleAuth.refreshTokens();
    console.log('Refreshed ID Token:', tokens.idToken);
    console.log('Refreshed Access Token:', tokens.accessToken); // null on Android
    console.log('User:', tokens.user);
    console.log('Expires At:', tokens.expiresAt);
  } catch (error) {
    console.error('Token refresh failed:', error);
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
      // Refresh tokens if expired
      await refreshTokens();
    }
  } catch (error) {
    console.error('Failed to check token expiration:', error);
  }
};
```

### Check Play Services (Android)

```typescript
const checkPlayServices = async () => {
  try {
    const playServicesInfo = await GoogleAuth.checkPlayServices(true); // Show error dialog if needed
    console.log('Play Services available:', playServicesInfo.isAvailable);
    console.log('Play Services status:', playServicesInfo.status); // Android only
  } catch (error) {
    console.error('Failed to check Play Services:', error);
  }
};
```

## 🔍 API Reference

### GoogleAuth

#### Methods

- `configure(options: GoogleAuthConfig): Promise<void>`
- `signIn(): Promise<GoogleAuthResponse>`
- `signOut(): Promise<void>`
- `getCurrentUser(): Promise<GoogleUser | null>`
- `getTokens(): Promise<GoogleTokens>`
- `refreshTokens(): Promise<GoogleTokens>`
- `isTokenExpired(): Promise<boolean>`
- `checkPlayServices(showErrorDialog?: boolean): Promise<PlayServicesInfo>`

#### Types

```typescript
interface GoogleAuthConfig {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
  hostedDomain?: string;
  scopes?: string[];
  forceAccountPicker?: boolean; // iOS only - forces account picker to show even if user is already signed in
}

interface GoogleAuthResponse {
  type: 'success' | 'cancelled';
  data?: {
    user: GoogleUser;
    idToken: string;
    accessToken: string | null; // null on Android due to Credential Manager API limitations
  };
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  familyName?: string;
  givenName?: string;
}

interface GoogleTokens {
  idToken: string;
  accessToken: string | null; // null on Android due to Credential Manager API limitations
  user?: GoogleUser;
  expiresAt?: number;
}

interface PlayServicesInfo {
  isAvailable: boolean;
  status?: number; // Android only - Google Play Services status code
}
```

### GoogleAuthScopes

Common OAuth scopes:

```typescript
enum GoogleAuthScopes {
  EMAIL = 'email',
  PROFILE = 'profile',
  OPENID = 'openid',
  DRIVE = 'https://www.googleapis.com/auth/drive',
  DRIVE_READONLY = 'https://www.googleapis.com/auth/drive.readonly',
  CALENDAR = 'https://www.googleapis.com/auth/calendar',
  CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly',
}
```

## 🐛 Troubleshooting

### Common Issues

#### Expo-Specific Issues

**1. "Google Auth not configured" in Expo**
- Ensure you've added the config plugin to `app.json`
- Rebuild your development build after adding the plugin
- Verify client IDs are correctly set in the plugin configuration

**2. "Invalid client ID" in Expo**
- Check that your bundle identifier (iOS) and package name (Android) match your Google Cloud Console configuration
- Ensure you're using the correct client IDs for your platform
- Verify the client IDs include the full `.apps.googleusercontent.com` suffix

**3. Build fails with Google Auth**
- Make sure you're using Expo SDK 49+
- Clear your build cache: `eas build --clear-cache`
- Verify `google-services.json` and `GoogleService-Info.plist` are in the project root

**4. Sign-in doesn't work in development build**
- Ensure you're testing on a physical device (not Expo Go)
- Check that Google Play Services are installed and updated (Android)
- Verify your app's SHA-1 fingerprint is added to Google Cloud Console (Android)

#### General Issues

**1. "DEVELOPER_ERROR" on Android**
- Verify your package name matches Google Cloud Console
- Check SHA-1 fingerprint is correctly added to the Android OAuth client
- Ensure you're using the **Web application OAuth client ID** (client_type: 3), not the Android OAuth client ID
- Verify `google-services.json` is in the correct location (`android/app/`)
- If manually configuring, ensure `androidClientId` is set to your Web OAuth client ID

**2. "SIGN_IN_REQUIRED" error**
- User needs to sign in first
- Check if user session has expired

**3. iOS URL scheme not working**
- Verify URL scheme is correctly added to Info.plist
- Check AppDelegate.swift has the URL handling code
- Ensure the scheme matches your client ID (reversed)

**4. Network errors**
- Check internet connectivity
- Verify Google Play Services are available (Android)
- Check if your app is properly configured in Google Cloud Console

#### Platform Differences

**Important Note about Access Tokens:**
- **iOS**: Returns both `idToken` and `accessToken`
- **Android**: Returns `idToken` but `accessToken` is always `null` due to Android Credential Manager API limitations

The Android Credential Manager API focuses on authentication (ID tokens) rather than authorization (access tokens). If you need access tokens on Android for API calls, consider implementing a separate OAuth2 flow or use the ID token for server-side token exchange.

### Getting Help

1. Check the [GitHub Issues](https://github.com/sbaiahmed1/react-native-google-auth/issues)
2. Review the [troubleshooting guide](./docs/troubleshooting.md)
3. Join our [Discord community](https://discord.gg/your-discord)

## 📚 Examples

### Complete Expo Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { GoogleAuth, GoogleAuthScopes, GoogleUser } from 'react-native-google-auth';

export default function App() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    configureGoogleAuth();
  }, []);

  const configureGoogleAuth = async () => {
    try {
      await GoogleAuth.configure({
        scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE]
      });
      setIsConfigured(true);

      // Check if user is already signed in
      const currentUser = await GoogleAuth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Google Auth configuration failed:', error);
      Alert.alert('Configuration Error', 'Failed to configure Google Auth');
    }
  };

  const handleSignIn = async () => {
    if (!isConfigured) {
      Alert.alert('Error', 'Google Auth is not configured');
      return;
    }

    try {
      const response = await GoogleAuth.signIn();

      if (response.type === 'success') {
        setUser(response.data.user);
        Alert.alert('Success', `Welcome ${response.data.user.name}!`);
      } else if (response.type === 'cancelled') {
        Alert.alert('Cancelled', 'Sign in was cancelled');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      Alert.alert('Sign In Error', 'Failed to sign in with Google');
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out');
    }
  };

  return (
    <View style={styles.container}>
    <Text style={styles.title}>Google Auth Example</Text>

  {user ? (
    <View style={styles.userInfo}>
    <Text style={styles.userText}>Welcome, {user.name}!</Text>
    <Text style={styles.userText}>Email: {user.email}</Text>
  <TouchableOpacity style={styles.button} onPress={handleSignOut}>
  <Text style={styles.buttonText}>Sign Out</Text>
  </TouchableOpacity>
  </View>
  ) : (
    <TouchableOpacity
      style={[styles.button, !isConfigured && styles.buttonDisabled]}
    onPress={handleSignIn}
    disabled={!isConfigured}
  >
    <Text style={styles.buttonText}>
      {isConfigured ? 'Sign In with Google' : 'Configuring...'}
      </Text>
      </TouchableOpacity>
  )}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  userInfo: {
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

### React Native CLI Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GoogleAuth, GoogleAuthScopes, GoogleUser } from 'react-native-google-auth';

const App = () => {
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    configureGoogleAuth();
  }, []);

  const configureGoogleAuth = async () => {
    try {
      await GoogleAuth.configure({
        iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        scopes: [GoogleAuthScopes.EMAIL, GoogleAuthScopes.PROFILE]
      });

      // Check if user is already signed in
      const currentUser = await GoogleAuth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Configuration failed:', error);
    }
  };

  const signIn = async () => {
    try {
      const response = await GoogleAuth.signIn();
      if (response.type === 'success') {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleAuth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
          <View>
            <Text>Welcome, {user.name}!</Text>
          <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
      </View>
  ) : (
    <TouchableOpacity style={styles.button} onPress={signIn}>
  <Text style={styles.buttonText}>Sign In with Google</Text>
  </TouchableOpacity>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/sbaiahmed1/react-native-google-auth/issues)

---

Made with ❤️ by @sbaiahmed1
