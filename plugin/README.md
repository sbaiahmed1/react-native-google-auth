# React Native Google Auth - Expo Plugin

An Expo config plugin for seamless Google Sign-In integration in React Native projects. This plugin automatically configures both iOS and Android platforms with minimal setup required.

## Features

- 🍎 **iOS Configuration**: Automatic Info.plist setup, URL schemes, and GoogleService-Info.plist integration
- 🤖 **Android Configuration**: AndroidManifest.xml setup, permissions, and google-services.json integration
- 🔧 **Smart Detection**: Automatically extracts client IDs from Google service files
- 📁 **File Management**: Copies Google service files to correct platform directories
- 🔄 **Firebase Compatible**: Falls back to standard Firebase configuration when needed
- ✅ **Validation**: Ensures proper client ID formats and configuration

## Installation

```bash
npm install react-native-google-auth
# or
yarn add react-native-google-auth
```

## Configuration

### Basic Setup (Recommended)

The easiest way to use this plugin is to place your Google service files in your project root and let the plugin handle everything automatically:

1. **Add Google service files to your project root:**
   - `GoogleService-Info.plist` (for iOS)
   - `google-services.json` (for Android)

2. **Add the plugin to your `app.config.js`:**

```javascript
export default {
  expo: {
    name: "Your App",
    plugins: [
      "react-native-google-auth"
    ]
  }
};
```

### Advanced Configuration

For more control over the configuration, you can provide custom options:

```javascript
export default {
  expo: {
    name: "Your App",
    plugins: [
      [
        "react-native-google-auth",
        {
          iosClientId: "your-ios-client-id.apps.googleusercontent.com",
          androidClientId: "your-android-client-id.apps.googleusercontent.com",
          googleServicesFile: "./path/to/google-services.json",
          iosGoogleServicesFile: "./path/to/GoogleService-Info.plist"
        }
      ]
    ]
  }
};
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `iosClientId` | `string` | No | iOS OAuth client ID. Auto-extracted from GoogleService-Info.plist if not provided |
| `androidClientId` | `string` | No | Android OAuth client ID. Auto-extracted from google-services.json if not provided |
| `iosUrlScheme` | `string` | No | iOS URL scheme. Auto-extracted from iosClientId (first part before dot) if not provided |
| `googleServicesFile` | `string` | No | Custom path to google-services.json (default: `./google-services.json`) |
| `iosGoogleServicesFile` | `string` | No | Custom path to GoogleService-Info.plist (default: `./GoogleService-Info.plist`) |

## How It Works

### iOS Configuration

The plugin automatically:

1. **Copies GoogleService-Info.plist** to `ios/GoogleService-Info.plist`
2. **Extracts CLIENT_ID** from the plist file (if not manually provided)
3. **Adds GIDClientID** to Info.plist
4. **Configures URL scheme** based on the client ID (first part before the first dot)
5. **Validates client ID format** (must end with `.apps.googleusercontent.com`)

### Android Configuration

The plugin automatically:

1. **Copies google-services.json** to `android/app/google-services.json`
2. **Extracts client ID** from the JSON file (if not manually provided)
3. **Adds INTERNET permission** to AndroidManifest.xml (if not already present)
4. **Provides helpful logging** for debugging configuration issues

## Usage Examples

### Example 1: Automatic Configuration

```javascript
// app.config.js
export default {
  expo: {
    name: "MyApp",
    plugins: ["react-native-google-auth"]
  }
};
```

**Requirements:**
- `GoogleService-Info.plist` in project root
- `google-services.json` in project root

### Example 2: Custom File Paths

```javascript
// app.config.js
export default {
  expo: {
    name: "MyApp",
    plugins: [
      [
        "react-native-google-auth",
        {
          googleServicesFile: "./config/google-services.json",
          iosGoogleServicesFile: "./config/GoogleService-Info.plist"
        }
      ]
    ]
  }
};
```

### Example 3: Manual Client IDs

```javascript
// app.config.js
export default {
  expo: {
    name: "MyApp",
    plugins: [
      [
        "react-native-google-auth",
        {
          iosClientId: "123456789-abcdef.apps.googleusercontent.com",
          androidClientId: "123456789-ghijkl.apps.googleusercontent.com"
        }
      ]
    ]
  }
};
```

### Example 4: Custom URL Scheme

```javascript
// app.config.js
export default {
  expo: {
    name: "MyApp",
    plugins: [
      [
        "react-native-google-auth",
        {
          iosClientId: "123456789-abcdef.apps.googleusercontent.com",
          iosUrlScheme: "com.mycompany.myapp" // Custom URL scheme instead of auto-extracted
        }
      ]
    ]
  }
};
```

### Common Issues

1. **"No iOS client ID found" warning**
   - Ensure `GoogleService-Info.plist` exists in your project root
   - Or provide `iosClientId` manually in the plugin configuration

2. **"No Android client ID found" warning**
   - Ensure `google-services.json` exists in your project root
   - Or provide `androidClientId` manually in the plugin configuration

3. **"Source file not found" error**
   - Check that your Google service files are in the correct location
   - Verify the file paths in your plugin configuration

4. **iOS client ID format error**
   - Ensure your iOS client ID ends with `.apps.googleusercontent.com`
   - Double-check the CLIENT_ID value in your GoogleService-Info.plist

### Debug Logging

The plugin provides comprehensive logging during the configuration process:

- ✅ Success messages for file operations
- ⚠️ Warnings for missing files or configuration
- 🍎 iOS-specific configuration steps
- 🤖 Android-specific configuration steps
- 🚀 Overall plugin status

## Firebase Compatibility

When no options are provided, the plugin falls back to standard Expo Firebase configuration:

- Uses `AndroidConfig.GoogleServices` for Android
- Uses `IOSConfig.Google` for iOS
- Automatically applies Google Services plugins and files

## Requirements

- Expo SDK 47+
- React Native Google Auth library
- Valid Google OAuth credentials

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify your Google service files are correctly formatted
3. Ensure your OAuth client IDs are properly configured in Google Cloud Console

## License

This plugin is part of the react-native-google-auth package.