import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

/**
 * Predefined OAuth 2.0 scopes for Google APIs
 * Use these constants for type safety and better developer experience
 */
export enum GoogleAuthScopes {
  // OpenID Connect scopes
  OPENID = 'openid',
  EMAIL = 'email',
  PROFILE = 'profile',

  // Google API scopes
  DRIVE = 'https://www.googleapis.com/auth/drive',
  DRIVE_FILE = 'https://www.googleapis.com/auth/drive.file',
  DRIVE_READONLY = 'https://www.googleapis.com/auth/drive.readonly',
  GMAIL_READONLY = 'https://www.googleapis.com/auth/gmail.readonly',
  GMAIL_MODIFY = 'https://www.googleapis.com/auth/gmail.modify',
  GMAIL_COMPOSE = 'https://www.googleapis.com/auth/gmail.compose',
  CALENDAR = 'https://www.googleapis.com/auth/calendar',
  CALENDAR_READONLY = 'https://www.googleapis.com/auth/calendar.readonly',
  CONTACTS = 'https://www.googleapis.com/auth/contacts',
  CONTACTS_READONLY = 'https://www.googleapis.com/auth/contacts.readonly',
  YOUTUBE = 'https://www.googleapis.com/auth/youtube',
  YOUTUBE_READONLY = 'https://www.googleapis.com/auth/youtube.readonly',
  PHOTOS = 'https://www.googleapis.com/auth/photoslibrary',
  PHOTOS_READONLY = 'https://www.googleapis.com/auth/photoslibrary.readonly',
  SPREADSHEETS = 'https://www.googleapis.com/auth/spreadsheets',
  SPREADSHEETS_READONLY = 'https://www.googleapis.com/auth/spreadsheets.readonly',
  DOCUMENTS = 'https://www.googleapis.com/auth/documents',
  DOCUMENTS_READONLY = 'https://www.googleapis.com/auth/documents.readonly',
  PRESENTATIONS = 'https://www.googleapis.com/auth/presentations',
  PRESENTATIONS_READONLY = 'https://www.googleapis.com/auth/presentations.readonly',
  CLOUD_PLATFORM = 'https://www.googleapis.com/auth/cloud-platform',
  CLOUD_PLATFORM_READONLY = 'https://www.googleapis.com/auth/cloud-platform.read-only',
  USERINFO_EMAIL = 'https://www.googleapis.com/auth/userinfo.email',
  USERINFO_PROFILE = 'https://www.googleapis.com/auth/userinfo.profile',
  PLUS_ME = 'https://www.googleapis.com/auth/plus.me',
  ANALYTICS = 'https://www.googleapis.com/auth/analytics',
  ANALYTICS_READONLY = 'https://www.googleapis.com/auth/analytics.readonly',
  ADWORDS = 'https://www.googleapis.com/auth/adwords',
  BLOGGER = 'https://www.googleapis.com/auth/blogger',
  FITNESS_ACTIVITY_READ = 'https://www.googleapis.com/auth/fitness.activity.read',
  FITNESS_BODY_READ = 'https://www.googleapis.com/auth/fitness.body.read',
  FITNESS_LOCATION_READ = 'https://www.googleapis.com/auth/fitness.location.read',
}

export interface ConfigureParams {
  /**
   * Web client ID from Google Cloud Console
   * Used for server-side verification and Android fallback
   */
  webClientId?: string;

  /**
   * iOS client ID from Google Cloud Console
   * If not provided, will automatically detect from:
   * 1. GIDClientID key in Info.plist
   * 2. CLIENT_ID key in GoogleService-Info.plist
   */
  iosClientId?: string;

  /**
   * Android client ID from Google Cloud Console
   * Preferred for Android platform
   */
  androidClientId?: string;

  /**
   * OAuth 2.0 scopes to request during sign-in
   * Use GoogleAuthScopes enum for type safety or provide custom scope strings
   * Examples: [GoogleAuthScopes.DRIVE, GoogleAuthScopes.EMAIL] or ['https://www.googleapis.com/auth/drive', 'email']
   */
  scopes?: (GoogleAuthScopes | string)[];

  /**
   * G Suite hosted domain for domain-restricted sign-in
   * Only users from this domain will be allowed to sign in
   */
  hostedDomain?: string;

  /**
   * Request offline access (refresh token)
   * Enables token refresh without user interaction
   */
  offlineAccess?: boolean;

  /**
   * Force authorization code for refresh token
   * Android-specific parameter
   */
  forceCodeForRefreshToken?: boolean;

  /**
   * Account name hint for sign-in
   * Android-specific parameter
   */
  accountName?: string;

  /**
   * Profile image size in pixels
   * Default: 120px
   */
  profileImageSize?: number;

  /**
   * OpenID realm parameter
   * Legacy parameter for specific use cases
   */
  openIdRealm?: string;

  /**
   * Force the account picker to show even if a user is already signed in
   * When true, skips silent sign-in and always shows the account selection UI
   * Useful when you want users to explicitly choose between multiple Google accounts
   * Default: false
   * @platform iOS
   */
  forceAccountPicker?: boolean;

  /**
   * Android Credential Manager behavior mode
   * - 'silent': Only show existing authorized accounts, no UI interaction
   * - 'interactive': Always display the Google account picker UI
   * - 'auto': Try silent sign-in first, fallback to interactive if needed (default)
   * Default: 'auto'
   * @platform Android
   */
  credentialManagerMode?: 'silent' | 'interactive' | 'auto';
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
}

export interface SignInResponse {
  type: 'success';
  data: {
    idToken: string;
    accessToken: string | null;
    user: User;
  };
}

export interface NoSavedCredentialFound {
  type: 'noSavedCredentialFound';
}

export interface CancelledResponse {
  type: 'cancelled';
}

export type OneTapResponse =
  | SignInResponse
  | NoSavedCredentialFound
  | CancelledResponse;

export interface GetTokensResponse {
  idToken: string;
  accessToken: string | null; // null on Android due to Credential Manager API limitations
  expiresAt?: number; // Unix timestamp when token expires
}

export interface RefreshTokensResponse {
  idToken: string;
  accessToken: string | null; // null on Android due to Credential Manager API limitations
  expiresAt?: number;
}

export interface PlayServicesInfo {
  isAvailable: boolean;
  status?: number;
}

export interface Spec extends TurboModule {
  // Configuration
  configure(params: ConfigureParams): Promise<void>;

  // Sign-in methods
  signIn(): Promise<OneTapResponse>;

  // Sign-out
  signOut(): Promise<void>;

  // Token management
  getTokens(): Promise<GetTokensResponse>;
  refreshTokens(): Promise<RefreshTokensResponse>;
  isTokenExpired(): Promise<boolean>;

  // Profile management
  getCurrentUser(): Promise<User | null>;

  // Utility methods
  checkPlayServices(showErrorDialog?: boolean): Promise<PlayServicesInfo>;

  // Legacy method for testing
}

export default TurboModuleRegistry.getEnforcing<Spec>('GoogleAuth');
