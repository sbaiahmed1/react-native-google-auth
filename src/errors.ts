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
    case 'android.credentials.GetCredentialException.TYPE_USER_CANCELED':
    case 'GIDSignInErrorCanceled':
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;

    case 'android.credentials.GetCredentialException.TYPE_NO_CREDENTIAL':
    case 'NoCredentialException':
      return GoogleAuthErrorCodes.NOT_SIGNED_IN;

    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return GoogleAuthErrorCodes.PLAY_SERVICES_NOT_AVAILABLE;

    default:
      return GoogleAuthErrorCodes.SIGN_IN_ERROR;
  }
}
