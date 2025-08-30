import NativeGoogleAuth from './NativeGoogleAuth';
import type {
  ConfigureParams,
  User,
  SignInResponse,
  NoSavedCredentialFound,
  CancelledResponse,
  OneTapResponse,
  GetTokensResponse,
  PlayServicesInfo,
} from './NativeGoogleAuth';

// Export types
export type {
  ConfigureParams,
  User,
  SignInResponse,
  NoSavedCredentialFound,
  CancelledResponse,
  OneTapResponse,
  GetTokensResponse,
  PlayServicesInfo,
};

// Export error types and utilities
export {
  GoogleAuthError,
  GoogleAuthErrorCodes,
  GoogleAuthStatusCodes,
  isGoogleAuthError,
  isErrorWithCode,
  createErrorResponse,
  mapNativeErrorCode,
} from './errors';
export type { GoogleAuthErrorCode, GoogleAuthStatusCode } from './errors';

/**
 * Google Auth API
 */
export const GoogleAuth = {
  /**
   * Configure Google Sign-In with the provided parameters
   */
  configure: (params: ConfigureParams): Promise<void> => {
    return NativeGoogleAuth.configure(params);
  },

  /**
   * Sign in with Google using One Tap or standard flow
   */
  signIn: (): Promise<OneTapResponse> => {
    return NativeGoogleAuth.signIn();
  },

  /**
   * Sign out the current user
   */
  signOut: (): Promise<void> => {
    return NativeGoogleAuth.signOut();
  },

  /**
   * Get access and ID tokens for the current user
   */
  getTokens: (): Promise<GetTokensResponse> => {
    return NativeGoogleAuth.getTokens();
  },

  /**
   * Check Google Play Services availability (Android only)
   */
  checkPlayServices: (showErrorDialog?: boolean): Promise<PlayServicesInfo> => {
    return NativeGoogleAuth.checkPlayServices(showErrorDialog);
  },
};

// Default export
export default GoogleAuth;
