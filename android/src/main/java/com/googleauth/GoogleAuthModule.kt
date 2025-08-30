package com.googleauth

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialCustomException
import androidx.credentials.exceptions.NoCredentialException
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@ReactModule(name = GoogleAuthModule.NAME)
class GoogleAuthModule(reactContext: ReactApplicationContext) :
  NativeGoogleAuthSpec(reactContext) {

  private var credentialManager: CredentialManager? = null
  private var webClientId: String? = null
  private var androidClientId: String? = null
  private var isConfigured = false
  private val coroutineScope = CoroutineScope(Dispatchers.Main)
  
  // Token caching
  private var cachedIdToken: String? = null
  private var cachedAccessToken: String? = null
  private var cachedUserInfo: WritableMap? = null

  override fun getName(): String {
    return NAME
  }

  // MARK: - Configuration

  override fun configure(params: ReadableMap, promise: Promise) {
    try {
      webClientId = params.getString("webClientId")
      androidClientId = params.getString("androidClientId")
      
      // Android should prefer androidClientId, but fall back to webClientId
      val clientId = androidClientId ?: webClientId
      if (clientId == null) {
        promise.reject("INVALID_CONFIG", "Either androidClientId or webClientId is required")
        return
      }

      credentialManager = CredentialManager.create(reactApplicationContext)
      isConfigured = true
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("CONFIG_ERROR", "Failed to configure Google Auth: ${e.message}", e)
    }
  }

  // MARK: - Sign-in Methods

  override fun signIn(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before signing in")
      return
    }

    val currentActivity = currentActivity
    if (currentActivity == null) {
      promise.reject("NO_ACTIVITY", "No current activity found")
      return
    }

    coroutineScope.launch {
      try {
        val result = performSilentSignIn(currentActivity)
        promise.resolve(result)
      } catch (e: Exception) {
        Log.e(NAME, "Silent sign-in failed, attempting interactive sign-in", e)
        // Fall back to interactive sign-in when silent sign-in fails
        try {
          val result = performInteractiveSignIn(currentActivity)
          promise.resolve(result)
        } catch (interactiveError: Exception) {
          Log.e(NAME, "Interactive sign-in failed", interactiveError)
          val response = Arguments.createMap().apply {
            putString("type", "noSavedCredentialFound")
          }
          promise.resolve(response)
        }
      }
    }
  }

  override fun createAccount(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before creating account")
      return
    }

    val currentActivity = currentActivity
    if (currentActivity == null) {
      promise.reject("NO_ACTIVITY", "No current activity found")
      return
    }

    coroutineScope.launch {
      try {
        val result = performInteractiveSignIn(currentActivity)
        promise.resolve(result)
      } catch (e: Exception) {
        Log.e(NAME, "Interactive sign-in failed", e)
        if (e is GetCredentialException) {
          when (e.type) {
            "android.credentials.GetCredentialException.TYPE_USER_CANCELED" -> {
              val response = Arguments.createMap().apply {
                putString("type", "cancelled")
              }
              promise.resolve(response)
            }
            else -> {
              promise.reject("SIGN_IN_ERROR", e.message ?: "Sign-in failed", e)
            }
          }
        } else {
          promise.reject("SIGN_IN_ERROR", e.message ?: "Sign-in failed", e)
        }
      }
    }
  }

  // MARK: - Sign-out

  override fun signOut(promise: Promise) {
    // Clear cached tokens and user info
    cachedIdToken = null
    cachedAccessToken = null
    cachedUserInfo = null
    
    // Note: Credential Manager doesn't have a direct sign-out method
    // The app should manage sign-out state locally
    promise.resolve(null)
  }

  // MARK: - Token Management

  override fun getTokens(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before getting tokens")
      return
    }

    // Return cached tokens if available
    if (cachedIdToken != null && cachedUserInfo != null) {
      val response = Arguments.createMap().apply {
        putString("idToken", cachedIdToken)
        putString("accessToken", cachedAccessToken) // Will be null for Credential Manager
        putMap("user", cachedUserInfo)
      }
      promise.resolve(response)
      return
    }

    // No cached tokens, try silent sign-in
    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity available")
      return
    }

    coroutineScope.launch {
      try {
        val result = performSilentSignIn(activity)
        if (result.getString("type") == "success") {
          // Use cached tokens since performSilentSignIn would have updated them
          val response = Arguments.createMap().apply {
            putString("idToken", cachedIdToken)
            putString("accessToken", cachedAccessToken)
            putMap("user", cachedUserInfo)
          }
          promise.resolve(response)
        } else {
          promise.reject("SIGN_IN_REQUIRED", "getTokens requires re-authentication with Credential Manager")
        }
      } catch (e: Exception) {
        Log.e(NAME, "Failed to get tokens: ${e.message}", e)
        promise.reject("GET_TOKENS_ERROR", "Failed to get tokens: ${e.message}")
      }
    }
  }

  // MARK: - Utility Methods

  override fun checkPlayServices(showErrorDialog: Boolean?, promise: Promise) {
    try {
      val googleApiAvailability = GoogleApiAvailability.getInstance()
      val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(reactApplicationContext)
      
      val isAvailable = resultCode == ConnectionResult.SUCCESS
      val response = Arguments.createMap().apply {
        putBoolean("isAvailable", isAvailable)
        putInt("status", resultCode)
      }
      
      if (!isAvailable && showErrorDialog == true) {
        currentActivity?.let { activity ->
          if (googleApiAvailability.isUserResolvableError(resultCode)) {
            googleApiAvailability.getErrorDialog(activity, resultCode, 9000)?.show()
          }
        }
      }
      
      promise.resolve(response)
    } catch (e: Exception) {
      promise.reject("PLAY_SERVICES_ERROR", "Failed to check Play Services: ${e.message}", e)
    }
  }

  // MARK: - Helper Methods
  
  private fun getClientId(): String {
    return androidClientId ?: webClientId ?: throw IllegalStateException("No client ID configured")
  }

  private suspend fun performSilentSignIn(activity: Activity): WritableMap {
    return withContext(Dispatchers.IO) {
      val googleIdOption = GetGoogleIdOption.Builder()
        .setServerClientId(getClientId())
        .setFilterByAuthorizedAccounts(true) // Only show accounts that have previously signed in
        .build()

      val request = GetCredentialRequest.Builder()
        .addCredentialOption(googleIdOption)
        .build()

      try {
        val result = credentialManager!!.getCredential(
          request = request,
          context = activity
        )
        Log.d(NAME, "Credential retrieved successfully, processing response")
        return@withContext handleCredentialResponse(result)
      } catch (e: GetCredentialCustomException) {
        Log.e(NAME, "GetCredentialCustomException in silent sign-in - Developer console setup error")
        Log.e(NAME, "Error code: ${e.type}, Message: ${e.message}")
        throw Exception("Developer console is not set up correctly. Please verify your OAuth 2.0 Client ID configuration in Google Cloud Console and ensure the SHA-1 fingerprint is correctly added.")
      } catch (e: NoCredentialException) {
        throw Exception("No saved credential found")
      }
    }
  }

  private suspend fun performInteractiveSignIn(activity: Activity): WritableMap {
    return withContext(Dispatchers.IO) {
      val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(getClientId())
        .build()

      val request = GetCredentialRequest.Builder()
        .addCredentialOption(signInWithGoogleOption)
        .build()

      try {
        val result = credentialManager!!.getCredential(
          request = request,
          context = activity
        )
        Log.d(NAME, "Credential retrieved successfully, processing response")
        return@withContext handleCredentialResponse(result)
      } catch (e: GetCredentialCustomException) {
        Log.e(NAME, "GetCredentialCustomException caught - Developer console setup error")
        Log.e(NAME, "Error code: ${e.type}, Message: ${e.message}")
        
        return@withContext Arguments.createMap().apply {
          putString("type", "configuration_error")
          putString("message", "Developer console is not set up correctly. Please verify your OAuth 2.0 Client ID configuration in Google Cloud Console and ensure the SHA-1 fingerprint is correctly added.")
          putString("errorCode", e.type)
        }
      } catch (e: GetCredentialCancellationException) {
        Log.d(NAME, "GetCredentialCancellationException caught - This may be a known issue with Credential Manager API")
        Log.d(NAME, "Exception message: ${e.message}")
        
        // Known issue: GetCredentialCancellationException is sometimes thrown even when user completes consent
        // This is a workaround for the Credential Manager API issue
        // Reference: https://stackoverflow.com/questions/78345532/credential-manager-always-returns-getcredentialcancellationexception-activity
        return@withContext Arguments.createMap().apply {
          putString("type", "cancelled")
          putString("message", "Sign-in was cancelled. This might be due to a known Credential Manager API issue. Please try recreating OAuth 2.0 Client IDs in Google Cloud Console if this persists.")
        }
      } catch (e: GetCredentialException) {
        Log.d(NAME, "GetCredentialException caught - Type: ${e.type}, Message: ${e.message}")
        Log.e(NAME, "Interactive sign-in failed - Type: ${e.type}, Message: ${e.message}", e)
        throw e
      }
    }
  }

  private fun handleCredentialResponse(result: GetCredentialResponse): WritableMap {
    val credential = result.credential
    Log.d(NAME, "Processing credential response - Type: ${credential.type}")
    
    when (credential.type) {
      GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL -> {
        try {
          val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
          
          // Create user info for caching
          val cachedUser = Arguments.createMap().apply {
            putString("id", googleIdTokenCredential.id)
            putString("name", googleIdTokenCredential.displayName)
            putString("email", googleIdTokenCredential.id) // Email is typically the ID
            putString("photo", googleIdTokenCredential.profilePictureUri?.toString())
            putString("familyName", googleIdTokenCredential.familyName)
            putString("givenName", googleIdTokenCredential.givenName)
          }
          
          // Create separate user info for response data
          val responseUser = Arguments.createMap().apply {
            putString("id", googleIdTokenCredential.id)
            putString("name", googleIdTokenCredential.displayName)
            putString("email", googleIdTokenCredential.id) // Email is typically the ID
            putString("photo", googleIdTokenCredential.profilePictureUri?.toString())
            putString("familyName", googleIdTokenCredential.familyName)
            putString("givenName", googleIdTokenCredential.givenName)
          }
          
          // Cache tokens and user info
          cachedIdToken = googleIdTokenCredential.idToken
          cachedAccessToken = null // Credential Manager doesn't provide access tokens directly
          cachedUserInfo = cachedUser
          
          val data = Arguments.createMap().apply {
            putString("idToken", googleIdTokenCredential.idToken)
            putNull("accessToken") // Credential Manager doesn't provide access tokens directly
            putMap("user", responseUser)
          }
          
          return Arguments.createMap().apply {
            putString("type", "success")
            putMap("data", data)
          }
        } catch (e: GoogleIdTokenParsingException) {
          throw Exception("Failed to parse Google ID token: ${e.message}")
        }
      }
      else -> {
        throw Exception("Unexpected credential type: ${credential.type}")
      }
    }
  }

  companion object {
    const val NAME = "GoogleAuth"
  }
}
