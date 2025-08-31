import NativeGoogleAuth from './NativeGoogleAuth';
import type {
  ConfigureParams,
  User,
  SignInResponse,
  NoSavedCredentialFound,
  CancelledResponse,
  OneTapResponse,
  GetTokensResponse,
  RefreshTokensResponse,
  PlayServicesInfo,
} from './NativeGoogleAuth';
import { GoogleAuthErrorCodes, createErrorResponse } from './errors';

// Error handling wrapper
const handleError = (error: any, operation: string) => {
  console.error(`GoogleAuth ${operation} error:`, error);

  // Map common error codes to our error enum
  if (error.code) {
    switch (error.code) {
      case 'SIGN_IN_CANCELLED':
        throw createErrorResponse(
          GoogleAuthErrorCodes.SIGN_IN_CANCELLED,
          error.message || 'Sign in was cancelled',
          error.userInfo
        );
      case 'IN_PROGRESS':
        throw createErrorResponse(
          GoogleAuthErrorCodes.IN_PROGRESS,
          error.message || 'Sign in already in progress',
          error.userInfo
        );
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        throw createErrorResponse(
          GoogleAuthErrorCodes.PLAY_SERVICES_NOT_AVAILABLE,
          error.message || 'Play Services not available',
          error.userInfo
        );
      case 'TOKEN_REFRESH_FAILED':
        throw createErrorResponse(
          GoogleAuthErrorCodes.TOKEN_REFRESH_FAILED,
          error.message || 'Token refresh failed',
          error.userInfo
        );
      case 'TOKEN_EXPIRED':
        throw createErrorResponse(
          GoogleAuthErrorCodes.TOKEN_EXPIRED,
          error.message || 'Token has expired',
          error.userInfo
        );

      case 'NETWORK_ERROR':
        throw createErrorResponse(
          GoogleAuthErrorCodes.NETWORK_ERROR,
          error.message || 'Network error occurred',
          error.userInfo
        );
      case 'INVALID_TOKEN':
        throw createErrorResponse(
          GoogleAuthErrorCodes.INVALID_TOKEN,
          error.message || 'Invalid token',
          error.userInfo
        );
      default:
        throw error;
    }
  }

  throw error;
};

// Export types
export type {
  ConfigureParams,
  User,
  SignInResponse,
  NoSavedCredentialFound,
  CancelledResponse,
  OneTapResponse,
  GetTokensResponse,
  RefreshTokensResponse,
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
   * Refresh access and ID tokens for the current user
   */
  refreshTokens: async (): Promise<RefreshTokensResponse> => {
    try {
      return await NativeGoogleAuth.refreshTokens();
    } catch (error) {
      return handleError(error, 'refreshTokens');
    }
  },

  /**
   * Check if the current token is expired
   */
  isTokenExpired: async (): Promise<boolean> => {
    try {
      return await NativeGoogleAuth.isTokenExpired();
    } catch (error) {
      return handleError(error, 'isTokenExpired');
    }
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await NativeGoogleAuth.getCurrentUser();
    } catch (error) {
      return handleError(error, 'getCurrentUser');
    }
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
