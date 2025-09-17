import type { ConfigPlugin } from '@expo/config-plugins';
import { withPlugins } from '@expo/config-plugins';
import { withGoogleAuth } from './withGoogleAuth';

interface GoogleAuthPluginOptions {
  iosClientId?: string; // iOS OAuth client ID
  androidClientId?: string; // Android OAuth client ID
  googleServicesFile?: string; // Path to google-services.json (default: './google-services.json')
  iosGoogleServicesFile?: string; // Path to GoogleService-Info.plist (default: './GoogleService-Info.plist')
}

/**
 * React Native Google Auth Expo Config Plugin
 *
 * This plugin configures the native Android and iOS projects
 * to support Google Authentication.
 */
const withReactNativeGoogleAuth: ConfigPlugin<GoogleAuthPluginOptions> = (
  config,
  options = {}
) => {
  return withPlugins(config, [[withGoogleAuth, options]]);
};

export default withReactNativeGoogleAuth;
export type { GoogleAuthPluginOptions };
