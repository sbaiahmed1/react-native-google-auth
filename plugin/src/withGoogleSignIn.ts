import { appendScheme } from '@expo/config-plugins/build/ios/Scheme';
import type { ExpoConfig } from 'expo/config';
import {
  type ConfigPlugin,
  AndroidConfig,
  IOSConfig,
  createRunOncePlugin,
  withPlugins,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';
import * as fs from 'fs';
import * as path from 'path';

const pkg = require('react-native-google-auth/package.json');

type Options = {
  iosClientId?: string; // iOS OAuth client ID
  androidClientId?: string; // Android OAuth client ID
  iosUrlScheme?: string; // iOS URL scheme (auto-extracted from iosClientId if not provided)
  googleServicesFile?: string; // Path to google-services.json (default: './google-services.json')
  iosGoogleServicesFile?: string; // Path to GoogleService-Info.plist (default: './GoogleService-Info.plist')
};

function validateOptions(options: Options) {
  const messagePrefix = `react-native-google-auth config plugin`;

  if (
    options?.iosClientId &&
    !options.iosClientId.endsWith('.apps.googleusercontent.com')
  ) {
    throw new Error(
      `${messagePrefix}: \`iosClientId\` must end with ".apps.googleusercontent.com": ${JSON.stringify(
        options
      )}`
    );
  }
}

/**
 * Helper function to copy files with error handling
 */
const copyFileWithErrorHandling = (
  sourcePath: string,
  destinationPath: string,
  fileName: string
): boolean => {
  try {
    if (fs.existsSync(sourcePath)) {
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

/**
 * Helper function to check if URL scheme already exists in Info.plist
 */
const hasExistingUrlScheme = (infoPlist: any, scheme: string): boolean => {
  const urlTypes = infoPlist.CFBundleURLTypes || [];
  return urlTypes.some((urlType: any) => {
    const schemes = urlType.CFBundleURLSchemes || [];
    return schemes.includes(scheme);
  });
};

/**
 * Helper function to extract client ID from GoogleService-Info.plist
 */
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

/**
 * Helper function to check if INTERNET permission already exists in Android manifest
 */
const hasInternetPermission = (permissions: any[]): boolean => {
  return permissions.some(
    (permission: any) =>
      permission.$['android:name'] === 'android.permission.INTERNET'
  );
};

/**
 * Helper function to extract client ID from google-services.json
 */
const getAndroidClientIdFromJson = (
  projectRoot: string,
  jsonPath?: string
): string | null => {
  try {
    const defaultPath = path.join(projectRoot, 'google-services.json');
    const filePath = jsonPath ? path.join(projectRoot, jsonPath) : defaultPath;

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

/**
 * Configure iOS for Google Sign-In
 */
const withGoogleSignInIOS: ConfigPlugin<Options> = (config, options) => {
  return withInfoPlist(config, (iosConfig) => {
    console.log('🍎 Configuring iOS for Google Auth...');

    // Copy GoogleService-Info.plist to iOS directory
    const { projectRoot } = iosConfig.modRequest;
    const iosGoogleServicesPath = options.iosGoogleServicesFile
      ? path.join(projectRoot, options.iosGoogleServicesFile)
      : path.join(projectRoot, 'GoogleService-Info.plist');

    const iosDestinationPath = path.join(
      projectRoot,
      'ios',
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
          iosConfig.modRequest.projectRoot,
          options.iosGoogleServicesFile
        ) || undefined;
    }

    if (iosClientId) {
      console.log(
        '🍎 Using iOS client ID:',
        iosClientId.substring(0, 20) + '...'
      );

      // Add GIDClientID to Info.plist
      iosConfig.modResults.GIDClientID = iosClientId;

      // Add URL scheme
      const urlScheme = options.iosUrlScheme || iosClientId.split('.')[0];
      if (urlScheme) {
        // Check if URL scheme already exists to prevent duplicates
        if (hasExistingUrlScheme(iosConfig.modResults, urlScheme)) {
          console.log(
            `🍎 URL scheme "${urlScheme}" already exists, skipping...`
          );
        } else {
          console.log(`🍎 Adding URL scheme: ${urlScheme}`);
          iosConfig.modResults = appendScheme(urlScheme, iosConfig.modResults);
        }
      }
    } else {
      console.warn(
        '⚠️ No iOS client ID found. Please provide iosClientId or GoogleService-Info.plist'
      );
    }

    return iosConfig;
  });
};

/**
 * Configure Android for Google Sign-In
 */
const withGoogleSignInAndroid: ConfigPlugin<Options> = (config, options) => {
  return withAndroidManifest(config, (androidConfig) => {
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

    if (!hasInternetPermission(permissions)) {
      console.log('🤖 Adding INTERNET permission...');
      permissions.push({
        $: { 'android:name': 'android.permission.INTERNET' },
      });
      androidConfig.modResults.manifest['uses-permission'] = permissions;
    } else {
      console.log('🤖 INTERNET permission already exists, skipping...');
    }

    return androidConfig;
  });
};

/**
 * Google Sign-In configuration without Firebase
 */
const withGoogleSignInWithoutFirebase: ConfigPlugin<Options> = (
  config: ExpoConfig,
  options
) => {
  validateOptions(options);
  return withPlugins(config, [
    // iOS Configuration
    (cfg) => withGoogleSignInIOS(cfg, options),
    // Android Configuration
    (cfg) => withGoogleSignInAndroid(cfg, options),
  ]);
};

/**
 * Add Google Sign-In URL scheme to iOS Info.plist
 */
export const withGoogleUrlScheme: ConfigPlugin<Options> = (config, options) => {
  return withInfoPlist(config, (config) => {
    const urlScheme =
      options.iosUrlScheme ||
      (options.iosClientId ? options.iosClientId.split('.')[0] : null);

    if (urlScheme) {
      // Check if URL scheme already exists to prevent duplicates
      if (hasExistingUrlScheme(config.modResults, urlScheme)) {
        console.log(`🍎 URL scheme "${urlScheme}" already exists, skipping...`);
      } else {
        console.log(`🍎 Adding URL scheme: ${urlScheme}`);
        config.modResults = appendScheme(urlScheme, config.modResults);
      }
    }
    return config;
  });
};

/**
 * Apply google-signin configuration for Expo SDK 47+ projects. This plugin reads information from the Firebase config file.
 */
const withGoogleSignIn: ConfigPlugin = (config: ExpoConfig) => {
  return withPlugins(config, [
    // Android
    AndroidConfig.GoogleServices.withClassPath,
    AndroidConfig.GoogleServices.withApplyPlugin,
    AndroidConfig.GoogleServices.withGoogleServicesFile,

    // iOS
    IOSConfig.Google.withGoogle,
    IOSConfig.Google.withGoogleServicesFile,
  ]);
};

const withGoogleSignInRoot: ConfigPlugin<Options | void> = (
  config: ExpoConfig,
  options
) => {
  console.log('🚀 Starting React Native Google Auth plugin configuration...');

  const result = options
    ? withGoogleSignInWithoutFirebase(config, options)
    : withGoogleSignIn(config);

  console.log(
    '✅ React Native Google Auth plugin configuration completed successfully!'
  );

  return result;
};

export default createRunOncePlugin<Options>(
  withGoogleSignInRoot,
  pkg.name,
  pkg.version
);
