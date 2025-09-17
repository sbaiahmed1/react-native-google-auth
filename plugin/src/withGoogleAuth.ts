import {
  type ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from '@expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

interface GoogleAuthPluginOptions {
  iosClientId?: string; // iOS OAuth client ID
  androidClientId?: string; // Android OAuth client ID
  googleServicesFile?: string; // Path to google-services.json (default: './google-services.json')
  iosGoogleServicesFile?: string; // Path to GoogleService-Info.plist (default: './GoogleService-Info.plist')
}

const withGoogleAuth: ConfigPlugin<GoogleAuthPluginOptions> = (
  config,
  options = {}
) => {
  console.log('🚀 React Native Google Auth plugin starting...');
  console.log('📋 Plugin options:', options);

  // Helper function to copy file with error handling
  const copyFileWithErrorHandling = (
    sourcePath: string,
    destinationPath: string,
    fileName: string
  ): boolean => {
    try {
      if (fs.existsSync(sourcePath)) {
        // Ensure destination directory exists
        const destinationDir = path.dirname(destinationPath);
        if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`✅ Successfully copied ${fileName} to ${destinationPath}`);
        return true;
      } else {
        console.warn(`⚠️ Source file not found: ${sourcePath}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to copy ${fileName}:`, error);
      return false;
    }
  };

  // Helper function to extract client ID from GoogleService-Info.plist
  const getIosClientIdFromPlist = (
    projectRoot: string,
    plistPath?: string
  ): string | null => {
    try {
      const defaultPath = path.join(projectRoot, 'GoogleService-Info.plist');
      const filePath = plistPath
        ? path.join(projectRoot, plistPath)
        : defaultPath;

      if (fs.existsSync(filePath)) {
        const plistContent = fs.readFileSync(filePath, 'utf8');
        const clientIdMatch = plistContent.match(
          /<key>CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/
        );
        return clientIdMatch && clientIdMatch[1] ? clientIdMatch[1] : null;
      }
    } catch (error) {
      console.warn('⚠️ Could not read GoogleService-Info.plist:', error);
    }
    return null;
  };

  // Helper function to extract client ID from google-services.json
  const getAndroidClientIdFromJson = (
    projectRoot: string,
    jsonPath?: string
  ): string | null => {
    try {
      const defaultPath = path.join(projectRoot, 'google-services.json');
      const filePath = jsonPath
        ? path.join(projectRoot, jsonPath)
        : defaultPath;

      if (fs.existsSync(filePath)) {
        const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const androidClient = jsonContent.client?.find(
          (client: any) => client.client_info?.android_client_info
        );
        return (
          androidClient?.oauth_client?.find(
            (oauth: any) => oauth.client_type === 1
          )?.client_id || null
        );
      }
    } catch (error) {
      console.warn('⚠️ Could not read google-services.json:', error);
    }
    return null;
  };

  // Configure iOS
  config = withInfoPlist(config, (infoPlistConfig) => {
    console.log('🍎 Configuring iOS Info.plist for Google Auth...');

    // Copy GoogleService-Info.plist to iOS directory
    const { projectRoot } = infoPlistConfig.modRequest;
    const iosGoogleServicesPath = options.iosGoogleServicesFile
      ? path.join(projectRoot, options.iosGoogleServicesFile)
      : path.join(projectRoot, 'GoogleService-Info.plist');

    const iosDestinationPath = path.join(
      projectRoot,
      'ios',
      infoPlistConfig.name || 'App',
      'GoogleService-Info.plist'
    );

    copyFileWithErrorHandling(
      iosGoogleServicesPath,
      iosDestinationPath,
      'GoogleService-Info.plist'
    );

    // Determine iOS client ID
    let { iosClientId } = options;
    if (!iosClientId) {
      iosClientId =
        getIosClientIdFromPlist(
          infoPlistConfig.modRequest.projectRoot,
          options.iosGoogleServicesFile
        ) || undefined;
    }

    if (iosClientId) {
      console.log(
        '📱 Using iOS client ID:',
        iosClientId.substring(0, 20) + '...'
      );

      // Add Google URL scheme to Info.plist
      const urlSchemes = infoPlistConfig.modResults.CFBundleURLTypes || [];

      // Create URL scheme from client ID by reversing it
      const scheme = iosClientId.split('.').reverse().join('.');

      // Check if the scheme already exists to avoid duplicates
      const schemeExists = urlSchemes.some(
        (urlType: any) =>
          urlType.CFBundleURLSchemes &&
          urlType.CFBundleURLSchemes.includes(scheme)
      );

      if (!schemeExists) {
        // Add Google Auth URL scheme
        const googleScheme = {
          // Use bundle identifier for URL name, which is common practice
          CFBundleURLName:
            infoPlistConfig.ios?.bundleIdentifier || 'com.google.auth',
          CFBundleURLSchemes: [scheme],
        };
        urlSchemes.push(googleScheme);
        infoPlistConfig.modResults.CFBundleURLTypes = urlSchemes;
      }

      // Add GIDClientID to Info.plist for automatic detection by Google Sign-In SDK
      infoPlistConfig.modResults.GIDClientID = iosClientId;
    } else {
      console.warn(
        '⚠️ No iOS client ID found. Please provide iosClientId or GoogleService-Info.plist'
      );
    }

    return infoPlistConfig;
  });

  // Configure Android
  config = withAndroidManifest(config, (androidConfig) => {
    console.log('🤖 Configuring Android manifest for Google Auth...');

    // Copy google-services.json to Android app directory
    const { projectRoot } = androidConfig.modRequest;
    const androidGoogleServicesPath = options.googleServicesFile
      ? path.join(projectRoot, options.googleServicesFile)
      : path.join(projectRoot, 'google-services.json');

    const androidDestinationPath = path.join(
      projectRoot,
      'android',
      'app',
      'google-services.json'
    );

    copyFileWithErrorHandling(
      androidGoogleServicesPath,
      androidDestinationPath,
      'google-services.json'
    );

    // Determine Android client ID
    let { androidClientId } = options;
    if (!androidClientId) {
      androidClientId =
        getAndroidClientIdFromJson(
          androidConfig.modRequest.projectRoot,
          options.googleServicesFile
        ) || undefined;
    }

    if (androidClientId) {
      console.log(
        '🤖 Using Android client ID:',
        androidClientId.substring(0, 20) + '...'
      );
    } else {
      console.warn(
        '⚠️ No Android client ID found. Please provide androidClientId or google-services.json'
      );
    }

    // Add INTERNET permission if not already present
    const permissions =
      androidConfig.modResults.manifest['uses-permission'] || [];
    const hasInternetPermission = permissions.some(
      (permission: any) =>
        permission.$['android:name'] === 'android.permission.INTERNET'
    );

    if (!hasInternetPermission) {
      permissions.push({
        $: { 'android:name': 'android.permission.INTERNET' },
      });
      androidConfig.modResults.manifest['uses-permission'] = permissions;
    }

    return androidConfig;
  });

  console.log(
    '✅ React Native Google Auth plugin configuration completed successfully!'
  );
  return config;
};

export { withGoogleAuth };
