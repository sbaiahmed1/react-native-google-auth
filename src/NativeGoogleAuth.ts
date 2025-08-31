import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface ConfigureParams {
  webClientId?: string;
  iosClientId?: string;
  androidClientId?: string;
  scopes?: string[];
  hostedDomain?: string;
  offlineAccess?: boolean;
  forceCodeForRefreshToken?: boolean;
  accountName?: string;
  profileImageSize?: number;
  openIdRealm?: string;
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
  accessToken: string;
  expiresAt?: number; // Unix timestamp when token expires
}

export interface RefreshTokensResponse {
  idToken: string;
  accessToken: string;
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
