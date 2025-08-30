import Foundation
import UIKit
import GoogleSignIn

@objc(GoogleAuth)
class GoogleAuth: NSObject {
    
    @objc static let shared = GoogleAuth()
    private var isConfigured = false
    
    private override init() {
        super.init()
    }
    
    // MARK: - Configuration
    
    @objc
    func configure(_ params: [String: Any]) {
        guard let iosClientId = params["iosClientId"] as? String else {
            print("GoogleAuth: iosClientId is required for configuration")
            return
        }
        
        // Get hosted domain if provided
        let hostedDomain = params["hostedDomain"] as? String
        
        var clientIdToUse: String?
        
        // Try to get CLIENT_ID from GoogleService-Info.plist first
        if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
           let plist = NSDictionary(contentsOfFile: path),
           let clientId = plist["CLIENT_ID"] as? String {
            clientIdToUse = clientId
        } else {
            // Fall back to iosClientId
            clientIdToUse = iosClientId
        }
        
        // Configure Google Sign-In
        if let clientId = clientIdToUse {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
            print("GoogleAuth: Configured with client ID: \(clientId)")
        } else {
            print("GoogleAuth: No valid client ID found")
            return
        }
        
        // Configure additional options
        if let scopes = params["scopes"] as? [String] {
            // Scopes will be requested during sign-in
        }
        
        isConfigured = true
        print("GoogleAuth: Configuration completed successfully")
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
        GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { [weak self] result, error in
            if let error = error {
                let nsError = error as NSError
                if nsError.code == GIDSignInError.canceled.rawValue {
                    resolve([
                        "type": "cancelled"
                    ])
                } else {
                    reject("SIGN_IN_ERROR", error.localizedDescription, error)
                }
                return
            }
            
            if let user = result?.user {
                self?.handleSignInSuccess(user: user, resolve: resolve)
            } else {
                reject("SIGN_IN_ERROR", "No user returned from sign-in", nil)
            }
        }
    }
    
    @objc
    func createAccount(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard isConfigured else {
            reject("NOT_CONFIGURED", "GoogleAuth must be configured before creating account", nil)
            return
        }
        
        DispatchQueue.main.async {
            guard let presentingViewController = self.getPresentingViewController() else {
                reject("NO_VIEW_CONTROLLER", "No presenting view controller found", nil)
                return
            }
            
            self.performInteractiveSignIn(presentingViewController: presentingViewController, resolve: resolve, reject: reject)
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
    
    // MARK: - Utility Methods
    
    @objc
    func checkPlayServices(_ showErrorDialog: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // On iOS, Google Sign-In doesn't require Play Services
        // Always return available
        resolve([
            "isAvailable": true
        ])
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