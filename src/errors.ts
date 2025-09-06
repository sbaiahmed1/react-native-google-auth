/**
 * Error codes for Google Auth operations
 */
export const GoogleAuthErrorCodes = {
  // Configuration errors
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  INVALID_CONFIG: 'INVALID_CONFIG',
  CONFIG_ERROR: 'CONFIG_ERROR',

  // Configuration validation errors
  EMPTY_CLIENT_ID: 'EMPTY_CLIENT_ID',
  INVALID_CLIENT_ID_FORMAT: 'INVALID_CLIENT_ID_FORMAT',
  EMPTY_DOMAIN: 'EMPTY_DOMAIN',
  INVALID_DOMAIN_FORMAT: 'INVALID_DOMAIN_FORMAT',
  EMPTY_SCOPE: 'EMPTY_SCOPE',
  INVALID_SCOPE_FORMAT: 'INVALID_SCOPE_FORMAT',
  INVALID_SCOPES_TYPE: 'INVALID_SCOPES_TYPE',
  INVALID_SCOPE_TYPE: 'INVALID_SCOPE_TYPE',
  MISSING_REQUIRED_CONFIG: 'MISSING_REQUIRED_CONFIG',

  // Sign-in errors
  SIGN_IN_ERROR: 'SIGN_IN_ERROR',
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  NOT_SIGNED_IN: 'NOT_SIGNED_IN',

  // Platform-specific errors
  NO_ACTIVITY: 'NO_ACTIVITY', // Android
  NO_VIEW_CONTROLLER: 'NO_VIEW_CONTROLLER', // iOS

  // Token errors
  TOKEN_ERROR: 'TOKEN_ERROR',
  TOKEN_REFRESH_ERROR: 'TOKEN_REFRESH_ERROR',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Play Services errors (Android)
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  PLAY_SERVICES_ERROR: 'PLAY_SERVICES_ERROR',

  // One-tap specific errors
  ONE_TAP_START_FAILED: 'ONE_TAP_START_FAILED',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Implementation errors
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',

  // Additional platform-specific error codes
  SIGN_OUT_ERROR: 'SIGN_OUT_ERROR',
  GET_TOKENS_ERROR: 'GET_TOKENS_ERROR',
  REFRESH_ERROR: 'REFRESH_ERROR',
  REFRESH_FAILED: 'REFRESH_FAILED',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',
} as const;

export type GoogleAuthErrorCode =
  (typeof GoogleAuthErrorCodes)[keyof typeof GoogleAuthErrorCodes];

/**
 * Status codes for various Google Auth operations
 */
export const GoogleAuthStatusCodes = {
  // Sign-in status
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  SIGN_IN_REQUIRED: 'SIGN_IN_REQUIRED',

  // Play Services status codes (Android)
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  PLAY_SERVICES_UPDATE_REQUIRED: 'PLAY_SERVICES_UPDATE_REQUIRED',

  // One-tap status
  NO_SAVED_CREDENTIAL_FOUND: 'NO_SAVED_CREDENTIAL_FOUND',
} as const;

export type GoogleAuthStatusCode =
  (typeof GoogleAuthStatusCodes)[keyof typeof GoogleAuthStatusCodes];

/**
 * Custom error class for Google Auth operations
 */
export class GoogleAuthError extends Error {
  public readonly code: GoogleAuthErrorCode;
  public readonly userInfo?: Record<string, any>;

  constructor(
    code: GoogleAuthErrorCode,
    message: string,
    userInfo?: Record<string, any>
  ) {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
    this.userInfo = userInfo;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GoogleAuthError);
    }
  }
}

/**
 * Type guard to check if an error is a GoogleAuthError
 */
export function isGoogleAuthError(error: any): error is GoogleAuthError {
  return error instanceof GoogleAuthError;
}

/**
 * Type guard to check if an error has a code property
 */
export function isErrorWithCode(
  error: any
): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(
  code: GoogleAuthErrorCode,
  message: string,
  userInfo?: Record<string, any>
): GoogleAuthError {
  return new GoogleAuthError(code, message, userInfo);
}

/**
 * Maps native error codes to our standardized error codes
 */
export function mapNativeErrorCode(nativeCode: string): GoogleAuthErrorCode {
  switch (nativeCode) {
    // User cancellation
    case 'android.credentials.GetCredentialException.TYPE_USER_CANCELED':
    case 'GIDSignInErrorCanceled':
      return GoogleAuthErrorCodes.SIGN_IN_CANCELLED;

    // No credential/not signed in
    case 'android.credentials.GetCredentialException.TYPE_NO_CREDENTIAL':
    case 'NoCredentialException':
    case 'NOT_SIGNED_IN':
      return GoogleAuthErrorCodes.NOT_SIGNED_IN;

    // Configuration errors
    case 'NOT_CONFIGURED':
      return GoogleAuthErrorCodes.NOT_CONFIGURED;
    case 'INVALID_CONFIG':
      return GoogleAuthErrorCodes.INVALID_CONFIG;
    case 'CONFIG_ERROR':
      return GoogleAuthErrorCodes.CONFIG_ERROR;

    // Platform-specific activity/view controller errors
    case 'NO_ACTIVITY':
      return GoogleAuthErrorCodes.NO_ACTIVITY;
    case 'NO_VIEW_CONTROLLER':
      return GoogleAuthErrorCodes.NO_VIEW_CONTROLLER;

    // Sign-in errors
    case 'SIGN_IN_ERROR':
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;
    case 'SIGN_IN_REQUIRED':
      return GoogleAuthErrorCodes.SIGN_IN_REQUIRED;

    // Sign-out errors
    case 'SIGN_OUT_ERROR':
      return GoogleAuthErrorCodes.SIGN_OUT_ERROR;

    // Token errors
    case 'TOKEN_ERROR':
      return GoogleAuthErrorCodes.TOKEN_ERROR;
    case 'TOKEN_REFRESH_ERROR':
      return GoogleAuthErrorCodes.TOKEN_REFRESH_ERROR;
    case 'GET_TOKENS_ERROR':
      return GoogleAuthErrorCodes.GET_TOKENS_ERROR;
    case 'REFRESH_ERROR':
      return GoogleAuthErrorCodes.REFRESH_ERROR;
    case 'REFRESH_FAILED':
      return GoogleAuthErrorCodes.REFRESH_FAILED;

    // Play Services errors
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return GoogleAuthErrorCodes.PLAY_SERVICES_NOT_AVAILABLE;
    case 'PLAY_SERVICES_ERROR':
      return GoogleAuthErrorCodes.PLAY_SERVICES_ERROR;

    // Android Credential Manager specific errors
    case 'android.credentials.GetCredentialException.TYPE_INTERRUPTED':
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;
    case 'android.credentials.GetCredentialException.TYPE_UNKNOWN':
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;

    // Network errors
    case 'NETWORK_ERROR':
      return GoogleAuthErrorCodes.NETWORK_ERROR;

    default:
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;
  }
}
