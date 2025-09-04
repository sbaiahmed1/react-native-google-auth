import Foundation
import UIKit
import GoogleSignIn

@objc(GoogleAuth)
class GoogleAuth: NSObject {
    
    @objc static let shared = GoogleAuth()
    private var isConfigured = false
    
    private var configuredScopes: [String] = []
    
    private override init() {
        super.init()
    }
    
    // MARK: - Configuration
    
    @objc
    func configure(_ params: [String: Any]) {
        // Validate configuration parameters
        let validationResult = validateConfiguration(params)
        if !validationResult.isValid {
            print("GoogleAuth: Configuration validation failed: \(validationResult.errorMessage)")
            return
        }
        
        // Get client ID with automatic detection from Info.plist
        guard let clientId = getClientId(from: params) else {
            print("GoogleAuth: Failed to obtain client ID. Please provide iosClientId in configure params or add CLIENT_ID to Info.plist")
            return
        }
        
        // Get hosted domain if provided
        let hostedDomain = params["hostedDomain"] as? String
        
        // Configure Google Sign-In with validation
        do {
            let configuration = try createGoogleSignInConfiguration(clientId: clientId, hostedDomain: hostedDomain)
            GIDSignIn.sharedInstance.configuration = configuration
            print("GoogleAuth: Successfully configured with client ID: \(maskClientId(clientId))")
            
            // Store scopes for later use during sign-in
            if let scopes = params["scopes"] as? [String] {
                validateAndStoreScopes(scopes)
            }
            
            isConfigured = true
            print("GoogleAuth: Configuration completed successfully")
        } catch {
            print("GoogleAuth: Configuration failed: \(error.localizedDescription)")
            return
        }
    }
    
    // MARK: - Sign-in Methods
    
    @objc
    func signIn(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard isConfigured else {
            reject("NOT_CONFIGURED", "GoogleAuth must be configured before signing in", nil)
            return
        }
        
        DispatchQueue.main.async {
            guard let presentingViewController = self.getPresentingViewController() else {
                reject("NO_VIEW_CONTROLLER", "No presenting view controller found", nil)
                return
            }
            
            // Try silent sign-in first
            GIDSignIn.sharedInstance.restorePreviousSignIn { [weak self] result, error in
                if let error = error {
                    // No previous sign-in, show interactive sign-in
                    self?.performInteractiveSignIn(presentingViewController: presentingViewController, resolve: resolve, reject: reject)
                    return
                }
                
                if let user = result {
                    self?.handleSignInSuccess(user: user, resolve: resolve)
                } else {
                    // No user found, show interactive sign-in
                    self?.performInteractiveSignIn(presentingViewController: presentingViewController, resolve: resolve, reject: reject)
                }
            }
        }
    }
    
    // MARK: - Private Helper Methods
    
    private func performInteractiveSignIn(presentingViewController: UIViewController, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Use configured scopes if available
        if !configuredScopes.isEmpty {
            GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController, hint: nil, additionalScopes: configuredScopes) { [weak self] result, error in
                self?.handleSignInResult(result: result, error: error, resolve: resolve, reject: reject)
            }
        } else {
            GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { [weak self] result, error in
                self?.handleSignInResult(result: result, error: error, resolve: resolve, reject: reject)
            }
        }
    }
    
    private func handleSignInResult(result: GIDSignInResult?, error: Error?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let error = error {
            let nsError = error as NSError
            if nsError.code == GIDSignInError.canceled.rawValue {
                resolve([
                    "type": "cancelled"
                ])
            } else {
                let errorMessage = getDetailedErrorMessage(for: nsError)
                reject("SIGN_IN_ERROR", errorMessage, error)
            }
            return
        }
        
        if let user = result?.user {
            handleSignInSuccess(user: user, resolve: resolve)
        } else {
            reject("SIGN_IN_ERROR", "No user returned from sign-in", nil)
        }
    }
    
    private func getDetailedErrorMessage(for error: NSError) -> String {
        switch error.code {
        case GIDSignInError.canceled.rawValue:
            return "Sign-in was cancelled by the user"
        case GIDSignInError.keychain.rawValue:
            return "Keychain error occurred. Please check app permissions"
        case GIDSignInError.hasNoAuthInKeychain.rawValue:
            return "No authentication data found in keychain"
        case GIDSignInError.unknown.rawValue:
            return "An unknown error occurred during sign-in"
        default:
            return error.localizedDescription
        }
    }
    
    // MARK: - Sign-out
    
    @objc
    func signOut(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        GIDSignIn.sharedInstance.signOut()
        resolve(nil)
    }
    
    // MARK: - Token Management
    
    @objc
    func getTokens(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            reject("NOT_SIGNED_IN", "No user is currently signed in", nil)
            return
        }
        
        user.refreshTokensIfNeeded { user, error in
            if let error = error {
                reject("TOKEN_REFRESH_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let user = user,
                  let idToken = user.idToken?.tokenString else {
                reject("TOKEN_ERROR", "Failed to get tokens", nil)
                return
            }
            let accessToken = user.accessToken.tokenString
            
            resolve([
                "idToken": idToken,
                "accessToken": accessToken
            ])
        }
    }
    
    @objc
    func refreshTokens(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            reject("NOT_SIGNED_IN", "No user is currently signed in", nil)
            return
        }
        
        user.refreshTokensIfNeeded { user, error in
            if let error = error {
                reject("TOKEN_REFRESH_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let user = user,
                  let idToken = user.idToken?.tokenString else {
                reject("TOKEN_ERROR", "Failed to refresh tokens", nil)
                return
            }
            
            let accessToken = user.accessToken.tokenString
            let expiresAt = user.accessToken.expirationDate?.timeIntervalSince1970 ?? 0
            
            // Break up the complex expression to help Swift compiler
            let userInfo: [String: Any] = [
                "id": user.userID ?? "",
                "name": user.profile?.name ?? "",
                "email": user.profile?.email ?? "",
                "photo": user.profile?.imageURL(withDimension: 120)?.absoluteString ?? "",
                "familyName": user.profile?.familyName ?? "",
                "givenName": user.profile?.givenName ?? ""
            ]
            
            let result: [String: Any] = [
                "idToken": idToken,
                "accessToken": accessToken,
                "expiresAt": expiresAt * 1000, // Convert to milliseconds
                "user": userInfo
            ]
            
            resolve(result)
        }
    }
    
    @objc
    func isTokenExpired(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            resolve(true) // No user, consider expired
            return
        }
        
        let isExpired = user.accessToken.expirationDate?.timeIntervalSinceNow ?? 0 <= 0
        resolve(isExpired)
    }
    
    @objc
    func getCurrentUser(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let user = GIDSignIn.sharedInstance.currentUser else {
            resolve(nil)
            return
        }
        
        let userData: [String: Any] = [
            "id": user.userID ?? "",
            "name": user.profile?.name ?? "",
            "email": user.profile?.email ?? "",
            "photo": user.profile?.imageURL(withDimension: 120)?.absoluteString ?? "",
            "familyName": user.profile?.familyName ?? "",
            "givenName": user.profile?.givenName ?? ""
        ]
        
        resolve(userData)
    }
    
    // MARK: - Utility Methods
    
    @objc
    func checkPlayServices(_ showErrorDialog: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // On iOS, Google Sign-In doesn't require Play Services
        // Always return available
        resolve([
            "isAvailable": true
        ])
    }
    

    
    // MARK: - Configuration Helper Methods
    
    private func validateConfiguration(_ params: [String: Any]) -> (isValid: Bool, errorMessage: String) {
        // Check for required parameters or Info.plist configuration
        let hasIosClientId = params["iosClientId"] as? String != nil
        let hasInfoPlistClientId = getClientIdFromInfoPlist() != nil
        
        if !hasIosClientId && !hasInfoPlistClientId {
            return (false, "No client ID found. Please provide iosClientId parameter or add CLIENT_ID to Info.plist")
        }
        
        // Validate client ID format if provided
        if let iosClientId = params["iosClientId"] as? String {
            if !isValidClientIdFormat(iosClientId) {
                return (false, "Invalid iosClientId format. Expected format: xxxxxx.apps.googleusercontent.com")
            }
        }
        
        // Validate hosted domain format if provided
        if let hostedDomain = params["hostedDomain"] as? String {
            if !isValidDomainFormat(hostedDomain) {
                return (false, "Invalid hostedDomain format. Please provide a valid domain name")
            }
        }
        
        // Validate scopes if provided
        if let scopes = params["scopes"] as? [String] {
            for scope in scopes {
                if !isValidScopeFormat(scope) {
                    return (false, "Invalid scope format: \(scope). Scopes should be valid OAuth 2.0 scope URLs")
                }
            }
        }
        
        return (true, "")
    }
    
    private func getClientId(from params: [String: Any]) -> String? {
        // First priority: iosClientId from params
        if let iosClientId = params["iosClientId"] as? String, !iosClientId.isEmpty {
            return iosClientId
        }
        
        // Second priority: CLIENT_ID from Info.plist
        if let plistClientId = getClientIdFromInfoPlist() {
            return plistClientId
        }
        
        // Third priority: CLIENT_ID from GoogleService-Info.plist
        if let googleServiceClientId = getClientIdFromGoogleServiceInfo() {
            return googleServiceClientId
        }
        
        return nil
    }
    
    private func getClientIdFromInfoPlist() -> String? {
        return Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String
    }
    
    private func getClientIdFromGoogleServiceInfo() -> String? {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: path),
              let clientId = plist["CLIENT_ID"] as? String else {
            return nil
        }
        return clientId
    }
    
    private func createGoogleSignInConfiguration(clientId: String, hostedDomain: String?) throws -> GIDConfiguration {
        guard !clientId.isEmpty else {
            throw NSError(domain: "GoogleAuthError", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Client ID cannot be empty"])
        }
        
        let configuration: GIDConfiguration
        
        if let domain = hostedDomain, !domain.isEmpty {
            configuration = GIDConfiguration(clientID: clientId, serverClientID: nil, hostedDomain: domain, openIDRealm: nil)
        } else {
            configuration = GIDConfiguration(clientID: clientId)
        }
        
        return configuration
    }
    
    private func validateAndStoreScopes(_ scopes: [String]) {
        let validScopes = scopes.filter { isValidScopeFormat($0) }
        configuredScopes = validScopes
        
        if validScopes.count != scopes.count {
            let invalidScopes = scopes.filter { !isValidScopeFormat($0) }
            print("GoogleAuth: Warning - Invalid scopes ignored: \(invalidScopes)")
        }
        
        print("GoogleAuth: Configured with \(validScopes.count) valid scopes")
    }
    
    private func isValidClientIdFormat(_ clientId: String) -> Bool {
        // Basic validation for Google OAuth client ID format
        let pattern = "^[0-9]+-[a-zA-Z0-9_]+\\.apps\\.googleusercontent\\.com$"
        let regex = try? NSRegularExpression(pattern: pattern)
        let range = NSRange(location: 0, length: clientId.utf16.count)
        return regex?.firstMatch(in: clientId, options: [], range: range) != nil
    }
    
    private func isValidDomainFormat(_ domain: String) -> Bool {
        // Basic domain validation
        let pattern = "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\\.[a-zA-Z]{2,}$"
        let regex = try? NSRegularExpression(pattern: pattern)
        let range = NSRange(location: 0, length: domain.utf16.count)
        return regex?.firstMatch(in: domain, options: [], range: range) != nil
    }
    
    private func isValidScopeFormat(_ scope: String) -> Bool {
        // Validate OAuth 2.0 scope format
        return scope.hasPrefix("https://www.googleapis.com/auth/") || 
               scope.hasPrefix("openid") || 
               scope.hasPrefix("email") || 
               scope.hasPrefix("profile")
    }
    
    private func maskClientId(_ clientId: String) -> String {
        // Mask client ID for logging (show only first 8 and last 4 characters)
        guard clientId.count > 12 else { return "****" }
        let start = clientId.prefix(8)
        let end = clientId.suffix(4)
        return "\(start)****\(end)"
    }
    
    // MARK: - Helper Methods
    
    private func handleSignInSuccess(user: GIDGoogleUser, resolve: @escaping RCTPromiseResolveBlock) {
        guard let idToken = user.idToken?.tokenString else {
            resolve([
                "type": "noSavedCredentialFound"
            ])
            return
        }
        
        let userData: [String: Any?] = [
            "id": user.userID,
            "name": user.profile?.name,
            "email": user.profile?.email,
            "photo": user.profile?.imageURL(withDimension: 120)?.absoluteString,
            "familyName": user.profile?.familyName,
            "givenName": user.profile?.givenName
        ]
        
        let response: [String: Any] = [
            "type": "success",
            "data": [
                "idToken": idToken,
                "accessToken": user.accessToken.tokenString,
                "user": userData
            ]
        ]
        
        resolve(response)
    }
    
    private func getPresentingViewController() -> UIViewController? {
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = scene.windows.first(where: { $0.isKeyWindow }) {
            return window.rootViewController
        }
        return nil
    }
}