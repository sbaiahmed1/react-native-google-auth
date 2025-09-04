# React Native Google Auth Installation Guide

Complete step-by-step installation guide for implementing Google Sign-In authentication in your React Native application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Package Installation](#package-installation)
- [iOS Setup](#ios-setup)
- [Android Setup](#android-setup)
- [Google Cloud Console Configuration](#google-cloud-console-configuration)
- [Basic Configuration](#basic-configuration)
- [Testing Installation](#testing-installation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Environment

- **Node.js**: Version 16 or higher
- **React Native**: Version 0.60 or higher
- **iOS Development**: Xcode 12+, iOS 11+ deployment target
- **Android Development**: Android Studio, API level 21+ (Android 5.0)

### Google Account Requirements

- Google Cloud Console account
- Google Cloud project with billing enabled (for production)
- OAuth consent screen configured

## Package Installation

### Using Yarn (Recommended)

```bash
yarn add react-native-google-auth
```

### Using NPM

```bash
npm install react-native-google-auth
```

### Using pnpm

```bash
pnpm add react-native-google-auth
```

### Auto-linking

For React Native 0.60+, the package will be auto-linked. No manual linking required.

## iOS Setup

### 1. Install iOS Dependencies

```bash
cd ios && pod install && cd ..
```

### 2. Configure Info.plist

Add your iOS client ID to `ios/YourApp/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>GoogleAuth</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>YOUR_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

### 3. Update AppDelegate (if needed)

For React Native 0.60+, no additional AppDelegate changes are required.

### 4. iOS Simulator Testing

- Google Sign-In works on iOS Simulator
- No additional configuration needed for testing

## Android Setup

### 1. Configure Gradle

The package automatically configures Android dependencies.

### 2. Add SHA-1 Fingerprint

#### Debug Fingerprint

```bash
# Get debug SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### Release Fingerprint

```bash
# Get release SHA-1 fingerprint
keytool -list -v -keystore path/to/your/release.keystore -alias your-alias
```

Add both fingerprints to your Google Cloud Console OAuth configuration.

### 3. Google Play Services

Ensure Google Play Services is available:

```typescript
import { GoogleAuth } from 'react-native-google-auth';

// Check Play Services availability (Android only)
const playServicesInfo = await GoogleAuth.checkPlayServices();
if (!playServicesInfo.isAvailable) {
  // Handle Play Services not available
  console.log('Google Play Services not available');
}
```

### 4. Android Emulator Testing

- Use emulator with Google APIs
- Ensure Google Play Services is installed
- Sign in with a Google account on the emulator

## Google Cloud Console Configuration

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sign-In API

### 2. Configure OAuth Consent Screen

1. Navigate to "APIs & Services" > "OAuth consent screen"
2. Choose "External" for public apps
3. Fill in required information:
   - App name
   - User support email
   - Developer contact information
4. Add scopes (email, profile, openid)
5. Add test users (for development)

### 3. Create OAuth 2.0 Credentials

#### iOS Client ID

1. Click "Create Credentials" > "OAuth client ID"
2. Select "iOS"
3. Enter your app's bundle ID
4. Download the configuration file (optional)

#### Android Client ID

1. Click "Create Credentials" > "OAuth client ID"
2. Select "Android"
3. Enter your app's package name
4. Add SHA-1 fingerprints (debug and release)

#### Web Client ID (Optional)

1. Click "Create Credentials" > "OAuth client ID"
2. Select "Web application"
3. Used for server-side token verification

## Basic Configuration

### 1. Configure Google Auth

```typescript
import { GoogleAuth } from 'react-native-google-auth';

// Configure once in your app (e.g., App.tsx)
const configureGoogleAuth = async () => {
  try {
    await GoogleAuth.configure({
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Optional
      scopes: ['email', 'profile'], // Optional
      offlineAccess: true, // Optional
    });
    console.log('Google Auth configured successfully');
  } catch (error) {
    console.error('Google Auth configuration failed:', error);
  }
};

// Call during app initialization
configureGoogleAuth();
```

### 2. Environment-Specific Configuration

```typescript
const getGoogleAuthConfig = () => {
  if (__DEV__) {
    return {
      iosClientId: 'DEV_IOS_CLIENT_ID.apps.googleusercontent.com',
      androidClientId: 'DEV_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    };
  }
  
  return {
    iosClientId: 'PROD_IOS_CLIENT_ID.apps.googleusercontent.com',
    androidClientId: 'PROD_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  };
};

await GoogleAuth.configure(getGoogleAuthConfig());
```

## Testing Installation

### 1. Basic Sign-In Test

```typescript
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { GoogleAuth } from 'react-native-google-auth';

const TestGoogleAuth = () => {
  const testSignIn = async () => {
    try {
      const response = await GoogleAuth.signIn();
      if (response.type === 'success') {
        Alert.alert('Success', `Welcome ${response.data.user.name}!`);
      } else {
        Alert.alert('Info', `Sign-in ${response.type}`);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Google Sign-In" onPress={testSignIn} />
    </View>
  );
};

export default TestGoogleAuth;
```

### 2. Verify Configuration

```typescript
const verifyConfiguration = async () => {
  try {
    // This will throw if not configured
    await GoogleAuth.getCurrentUser();
    console.log('✅ Google Auth is properly configured');
  } catch (error) {
    if (error.code === 'NOT_CONFIGURED') {
      console.log('❌ Google Auth not configured');
    }
  }
};
```

## Troubleshooting

### Common Installation Issues

#### iOS Issues

**Pod install fails:**
```bash
# Clear CocoaPods cache
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install
```

**Build errors:**
- Ensure Xcode version is 12+
- Check iOS deployment target is 11.0+
- Verify bundle ID matches Google Cloud Console

#### Android Issues

**Build fails:**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

**SHA-1 fingerprint issues:**
- Verify fingerprints are added to Google Cloud Console
- Use correct keystore for release builds
- Check package name matches exactly

#### Configuration Issues

**"Google Auth not configured" error:**
- Ensure `configure()` is called before other methods
- Check client IDs are correct
- Verify OAuth consent screen is published

**"Invalid client ID" error:**
- Double-check client IDs in Google Cloud Console
- Ensure bundle ID/package name matches
- Verify OAuth consent screen configuration

### Debug Mode

```typescript
// Enable debug logging (development only)
if (__DEV__) {
  GoogleAuth.setDebugMode(true);
}
```

### Getting Help

- Check [GitHub Issues](https://github.com/your-repo/react-native-google-auth/issues)
- Review [API Documentation](../README.md#api-reference)
- Join community discussions

## Next Steps

After successful installation:

1. [Implement authentication flow](./authentication-guide.md)
2. [Handle tokens and user data](./token-management.md)
3. [Add error handling](./error-handling.md)
4. [Optimize for production](./production-guide.md)

---

**Need help?** Check our [troubleshooting guide](./troubleshooting.md) or [open an issue](https://github.com/your-repo/react-native-google-auth/issues).