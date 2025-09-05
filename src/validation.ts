/**
 * Shared validation utilities for Google Auth configuration
 * Used by both iOS and Android implementations to ensure consistency
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Validates Google OAuth client ID format
 * @param clientId The client ID to validate
 * @returns ValidationResult with validation status and error details
 */
export function validateClientIdFormat(clientId: string): ValidationResult {
  if (!clientId || clientId.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: 'Client ID cannot be empty',
      errorCode: 'EMPTY_CLIENT_ID',
    };
  }

  // Google OAuth client ID format validation
  const clientIdPattern = /^\d+(-[a-zA-Z0-9]+)*\.apps\.googleusercontent\.com$/;

  if (!clientIdPattern.test(clientId)) {
    return {
      isValid: false,
      errorMessage:
        'Invalid client ID format. Expected format: xxxxx-xxxxx.apps.googleusercontent.com',
      errorCode: 'INVALID_CLIENT_ID_FORMAT',
    };
  }

  return { isValid: true };
}

/**
 * Validates hosted domain format
 * @param domain The domain to validate
 * @returns ValidationResult with validation status and error details
 */
export function validateDomainFormat(domain: string): ValidationResult {
  if (!domain || domain.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: 'Domain cannot be empty',
      errorCode: 'EMPTY_DOMAIN',
    };
  }

  // Basic domain format validation
  const domainPattern =
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

  if (!domainPattern.test(domain)) {
    return {
      isValid: false,
      errorMessage: 'Invalid domain format',
      errorCode: 'INVALID_DOMAIN_FORMAT',
    };
  }

  return { isValid: true };
}

/**
 * Validates OAuth scope format
 * @param scope The scope to validate
 * @returns ValidationResult with validation status and error details
 */
export function validateScopeFormat(scope: string): ValidationResult {
  if (!scope || scope.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: 'Scope cannot be empty',
      errorCode: 'EMPTY_SCOPE',
    };
  }

  // Valid OAuth 2.0 scope formats
  const isValidScope =
    scope.startsWith('https://www.googleapis.com/auth/') ||
    scope === 'openid' ||
    scope === 'email' ||
    scope === 'profile';

  if (!isValidScope) {
    return {
      isValid: false,
      errorMessage: `Invalid OAuth scope format: ${scope}. Must be a Google API scope URL or one of: openid, email, profile`,
      errorCode: 'INVALID_SCOPE_FORMAT',
    };
  }

  return { isValid: true };
}

/**
 * Validates an array of scopes
 * @param scopes Array of scopes to validate
 * @returns ValidationResult with validation status and error details
 */
export function validateScopes(scopes: string[]): ValidationResult {
  if (!Array.isArray(scopes)) {
    return {
      isValid: false,
      errorMessage: 'Scopes must be an array',
      errorCode: 'INVALID_SCOPES_TYPE',
    };
  }

  for (let i = 0; i < scopes.length; i++) {
    const scope = scopes[i];
    if (typeof scope !== 'string') {
      return {
        isValid: false,
        errorMessage: `Scope at index ${i} must be a string, got ${typeof scope}`,
        errorCode: 'INVALID_SCOPE_TYPE',
      };
    }

    const scopeValidation = validateScopeFormat(scope);
    if (!scopeValidation.isValid) {
      return {
        isValid: false,
        errorMessage: `Scope at index ${i}: ${scopeValidation.errorMessage}`,
        errorCode: scopeValidation.errorCode,
      };
    }
  }

  return { isValid: true };
}

/**
 * Masks sensitive client ID for logging purposes
 * @param clientId The client ID to mask
 * @returns Masked client ID string
 */
export function maskClientId(clientId: string): string {
  if (!clientId || clientId.length <= 12) {
    return '****';
  }

  const start = clientId.substring(0, 8);
  const end = clientId.substring(clientId.length - 4);
  return `${start}****${end}`;
}

/**
 * Configuration error codes enum
 */
export enum ConfigErrorCode {
  EMPTY_CLIENT_ID = 'EMPTY_CLIENT_ID',
  INVALID_CLIENT_ID_FORMAT = 'INVALID_CLIENT_ID_FORMAT',
  EMPTY_DOMAIN = 'EMPTY_DOMAIN',
  INVALID_DOMAIN_FORMAT = 'INVALID_DOMAIN_FORMAT',
  EMPTY_SCOPE = 'EMPTY_SCOPE',
  INVALID_SCOPE_FORMAT = 'INVALID_SCOPE_FORMAT',
  INVALID_SCOPES_TYPE = 'INVALID_SCOPES_TYPE',
  INVALID_SCOPE_TYPE = 'INVALID_SCOPE_TYPE',
  MISSING_REQUIRED_CONFIG = 'MISSING_REQUIRED_CONFIG',
}
