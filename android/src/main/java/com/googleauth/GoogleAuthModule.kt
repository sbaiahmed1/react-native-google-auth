package com.googleauth

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleObserver
import androidx.lifecycle.OnLifecycleEvent
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialCustomException
import androidx.credentials.exceptions.NoCredentialException
import android.credentials.ClearCredentialStateException
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Date
import java.util.concurrent.TimeUnit
import org.json.JSONObject
import java.util.Base64

@ReactModule(name = GoogleAuthModule.NAME)
class GoogleAuthModule(reactContext: ReactApplicationContext) :
  NativeGoogleAuthSpec(reactContext), LifecycleObserver {

  private var credentialManager: CredentialManager? = null
  private var webClientId: String? = null
  private var androidClientId: String? = null
  private var isConfigured = false
  private val coroutineScope = CoroutineScope(Dispatchers.Main)
  
  // Secure credential storage
  private val securePrefs: SharedPreferences by lazy {
    try {
      val masterKey = MasterKey.Builder(reactApplicationContext)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
      
      EncryptedSharedPreferences.create(
        reactApplicationContext,
        "google_auth_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
      )
    } catch (e: Exception) {
      Log.w("GoogleAuth", "Failed to create encrypted preferences, falling back to regular: " + (e.localizedMessage ?: "Unknown error"))
      reactApplicationContext.getSharedPreferences("google_auth_prefs", Context.MODE_PRIVATE)
    }
  }
  
  // In-memory token caching for performance
  private var cachedIdToken: String? = null
  private var cachedAccessToken: String? = null
  private var cachedUserInfo: WritableMap? = null
  private var tokenExpiresAt: Long? = null
  
  init {
    // Register lifecycle observer to handle app state changes on main thread
    reactApplicationContext.runOnUiQueueThread {
      ProcessLifecycleOwner.get().lifecycle.addObserver(this)
    }
  }
  
  override fun getName(): String {
    return NAME
  }
  
  @OnLifecycleEvent(Lifecycle.Event.ON_START)
  fun onAppForegrounded() {
    Log.d("GoogleAuth", "App foregrounded - checking credential state")
    // Optionally refresh credentials when app comes to foreground
  }
  
  @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
  fun onAppBackgrounded() {
    Log.d("GoogleAuth", "App backgrounded - saving credential state")
    // Ensure credentials are saved when app goes to background
    if (cachedIdToken != null) {
      saveCredentialsSecurely(cachedIdToken, cachedAccessToken, cachedUserInfo, tokenExpiresAt)
    }
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
      promise.reject("CONFIG_ERROR", "Failed to configure Google Auth: " + (e.localizedMessage ?: "Unknown error"), e)
    }
  }

  // MARK: - Sign-in Methods

  override fun signIn(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before signing in")
      return
    }

    coroutineScope.launch {
      try {
        val activity = getValidActivity()
        if (activity == null) {
          promise.reject("NO_ACTIVITY", "No valid activity available. Please ensure the app is in the foreground.")
          return@launch
        }

        // Try silent sign-in first
        try {
          val silentResult = performSilentSignIn(activity)
          withContext(Dispatchers.Main) {
            promise.resolve(silentResult)
          }
        } catch (e: Exception) {
          Log.d("GoogleAuth", "Silent sign-in failed, trying interactive: " + (e.localizedMessage ?: "Unknown error"))
          // If silent fails, try interactive
          val interactiveResult = performInteractiveSignIn(activity)
          withContext(Dispatchers.Main) {
            promise.resolve(interactiveResult)
          }
        }
      } catch (e: Exception) {
        Log.e("GoogleAuth", "Sign in failed: " + (e.localizedMessage ?: "Unknown error"))
        withContext(Dispatchers.Main) {
          promise.reject("SIGN_IN_ERROR", "Sign in failed: " + (e.localizedMessage ?: "Unknown error"), e)
        }
      }
    }
  }

  // MARK: - Sign-out

  override fun signOut(promise: Promise) {
    coroutineScope.launch {
      try {
        // Clear cached tokens and user info
        cachedIdToken = null
        cachedAccessToken = null
        cachedUserInfo = null
        tokenExpiresAt = null
        
        // Clear secure storage
        clearCredentialsSecurely()
        
        // Clear credential state from Credential Manager
        // This includes clearing any restore credentials and cached credentials
        credentialManager?.let { manager ->
          withContext(Dispatchers.IO) {
            try {
              val clearRequest = ClearCredentialStateRequest()
              manager.clearCredentialState(clearRequest)
              Log.d("GoogleAuth", "Credential state cleared successfully")
            } catch (e: ClearCredentialStateException) {
              Log.w("GoogleAuth", "Failed to clear credential state: " + (e.message ?: "Unknown error"))
              // Continue with sign-out even if clearing fails
            } catch (e: Exception) {
              Log.w("GoogleAuth", "Unexpected error clearing credential state: " + (e.localizedMessage ?: "Unknown error"))
              // Continue with sign-out even if clearing fails
            }
          }
        }
        
        withContext(Dispatchers.Main) {
          promise.resolve(null)
        }
      } catch (e: Exception) {
        Log.e("GoogleAuth", "Sign out failed: " + (e.localizedMessage ?: "Unknown error"))
        withContext(Dispatchers.Main) {
          promise.reject("SIGN_OUT_ERROR", "Sign out failed: " + (e.localizedMessage ?: "Unknown error"), e)
        }
      }
    }
  }

  // MARK: - Token Management

  override fun getTokens(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before getting tokens")
      return
    }

    // Try to load from cache first, then from secure storage
    if (cachedIdToken == null) {
      loadCredentialsSecurely()
    }

    // Return cached tokens if available
    if (cachedIdToken != null && cachedUserInfo != null) {
      // Create a fresh copy of user info to avoid "map already consumed" error
      val freshUserInfo = Arguments.createMap().apply {
        cachedUserInfo?.let { cached ->
          putString("id", cached.getString("id"))
          putString("name", cached.getString("name"))
          putString("email", cached.getString("email"))
          putString("photo", cached.getString("photo"))
          putString("familyName", cached.getString("familyName"))
          putString("givenName", cached.getString("givenName"))
        }
      }
      
      val response = Arguments.createMap().apply {
        putString("idToken", cachedIdToken)
        putString("accessToken", cachedAccessToken) // Will be null for Credential Manager
        putMap("user", freshUserInfo)
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
          // Create a fresh copy of user info to avoid "map already consumed" error
          val freshUserInfo = Arguments.createMap().apply {
            cachedUserInfo?.let { cached ->
              putString("id", cached.getString("id"))
              putString("name", cached.getString("name"))
              putString("email", cached.getString("email"))
              putString("photo", cached.getString("photo"))
              putString("familyName", cached.getString("familyName"))
              putString("givenName", cached.getString("givenName"))
            }
          }
          
          val response = Arguments.createMap().apply {
            putString("idToken", cachedIdToken)
            putString("accessToken", cachedAccessToken)
            putMap("user", freshUserInfo)
          }
          promise.resolve(response)
        } else {
          promise.reject("SIGN_IN_REQUIRED", "getTokens requires re-authentication with Credential Manager")
        }
      } catch (e: Exception) {
        Log.e(NAME, "Failed to get tokens: " + (e.localizedMessage ?: "Unknown error"), e)
        promise.reject("GET_TOKENS_ERROR", "Failed to get tokens: " + (e.localizedMessage ?: "Unknown error"))
      }
    }
  }

  // MARK: - Utility Methods

  override fun refreshTokens(promise: Promise) {
    if (!isConfigured) {
      promise.reject("NOT_CONFIGURED", "GoogleAuth must be configured before refreshing tokens")
      return
    }

    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity available")
      return
    }

    coroutineScope.launch {
      try {
        val result = performSilentSignIn(activity)
        if (result.getString("type") == "success") {
          // Create a fresh copy of user info to avoid "map already consumed" error
          val freshUserInfo = Arguments.createMap().apply {
            cachedUserInfo?.let { cached ->
              putString("id", cached.getString("id"))
              putString("name", cached.getString("name"))
              putString("email", cached.getString("email"))
              putString("photo", cached.getString("photo"))
              putString("familyName", cached.getString("familyName"))
              putString("givenName", cached.getString("givenName"))
            }
          }
          
          val response = Arguments.createMap().apply {
            putString("idToken", cachedIdToken)
            putString("accessToken", cachedAccessToken)
            putMap("user", freshUserInfo)
            tokenExpiresAt?.let { putDouble("expiresAt", it.toDouble()) }
          }
          promise.resolve(response)
        } else {
          promise.reject("REFRESH_FAILED", "Failed to refresh tokens")
        }
      } catch (e: Exception) {
        Log.e(NAME, "Failed to refresh tokens: " + (e.localizedMessage ?: "Unknown error"), e)
        promise.reject("REFRESH_ERROR", "Failed to refresh tokens: " + (e.localizedMessage ?: "Unknown error"))
      }
    }
  }

  override fun isTokenExpired(promise: Promise) {
    val expiresAt = tokenExpiresAt
    if (expiresAt == null) {
      promise.resolve(true) // No expiration info, consider expired
      return
    }
    
    val currentTime = System.currentTimeMillis()
    val isExpired = currentTime >= expiresAt
    promise.resolve(isExpired)
  }

  override fun getCurrentUser(promise: Promise) {
    // Try to load from cache first, then from secure storage
    if (cachedUserInfo == null) {
      loadCredentialsSecurely()
    }
    
    if (cachedUserInfo != null) {
      // Create a fresh copy of user info
      val freshUserInfo = Arguments.createMap().apply {
        cachedUserInfo?.let { cached ->
          putString("id", cached.getString("id"))
          putString("name", cached.getString("name"))
          putString("email", cached.getString("email"))
          putString("photo", cached.getString("photo"))
          putString("familyName", cached.getString("familyName"))
          putString("givenName", cached.getString("givenName"))
        }
      }
      promise.resolve(freshUserInfo)
    } else {
      promise.resolve(null)
    }
  }

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
      promise.reject("PLAY_SERVICES_ERROR", "Failed to check Play Services: " + (e.localizedMessage ?: "Unknown error"), e)
    }
  }

  // MARK: - Helper Methods
  
  private fun getValidActivity(): Activity? {
    val activity = currentActivity
    return if (activity != null && !activity.isFinishing && !activity.isDestroyed) {
      activity
    } else {
      Log.w("GoogleAuth", "Current activity is null, finishing, or destroyed")
      null
    }
  }
  
  private fun getClientId(): String {
    return androidClientId ?: webClientId ?: throw IllegalStateException("No client ID configured")
  }
  
  private fun isRetryableError(exception: Exception): Boolean {
    val message = exception.message?.lowercase() ?: ""
    return message.contains("network") ||
           message.contains("timeout") ||
           message.contains("connection") ||
           message.contains("unavailable") ||
           message.contains("service temporarily unavailable")
  }

  private suspend fun performSilentSignIn(activity: Activity): WritableMap {
    return withContext(Dispatchers.IO) {
      var retryCount = 0
      val maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          val googleIdOption = GetGoogleIdOption.Builder()
            .setServerClientId(getClientId())
            .setFilterByAuthorizedAccounts(true) // Only show accounts that have previously signed in
            .build()

          val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

          val result = credentialManager!!.getCredential(
            request = request,
            context = activity
          )
          Log.d(NAME, "Credential retrieved successfully, processing response")
          return@withContext handleCredentialResponse(result)
        } catch (e: GetCredentialCustomException) {
          Log.e(NAME, "GetCredentialCustomException in silent sign-in - Developer console setup error")
          Log.e(NAME, "Error code: " + e.type + ", Message: " + (e.localizedMessage ?: "Unknown error"))
          if (retryCount < maxRetries && e.localizedMessage?.contains("network", ignoreCase = true) == true) {
            retryCount++
            Log.d(NAME, "Retrying silent sign-in (attempt $retryCount/$maxRetries)")
            delay(1000L * retryCount) // Exponential backoff
            continue
          }
          throw Exception("Developer console is not set up correctly. Please verify your OAuth 2.0 Client ID configuration in Google Cloud Console and ensure the SHA-1 fingerprint is correctly added.")
        } catch (e: NoCredentialException) {
          throw Exception("No saved credential found")
        } catch (e: Exception) {
          Log.e(NAME, "Silent sign-in failed: " + (e.localizedMessage ?: "Unknown error"))
          if (retryCount < maxRetries && isRetryableError(e)) {
            retryCount++
            Log.d(NAME, "Retrying silent sign-in (attempt $retryCount/$maxRetries)")
            delay(1000L * retryCount) // Exponential backoff
            continue
          }
          throw e
        }
      }
      
      // This should never be reached, but just in case
      throw Exception("Silent sign-in failed after $maxRetries retries")
    }
  }

  private suspend fun performInteractiveSignIn(activity: Activity): WritableMap {
    return withContext(Dispatchers.IO) {
      var retryCount = 0
      val maxRetries = 1 // Less retries for interactive sign-in
      
      while (retryCount <= maxRetries) {
        try {
          val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(getClientId())
            .build()

          val request = GetCredentialRequest.Builder()
            .addCredentialOption(signInWithGoogleOption)
            .build()

          val result = credentialManager!!.getCredential(
            request = request,
            context = activity
          )
          Log.d(NAME, "Credential retrieved successfully, processing response")
          return@withContext handleCredentialResponse(result)
        } catch (e: GetCredentialCustomException) {
          Log.e(NAME, "GetCredentialCustomException caught - Developer console setup error")
          Log.e(NAME, "Error code: " + e.type + ", Message: " + (e.localizedMessage ?: "Unknown error"))
          
          if (retryCount < maxRetries && e.localizedMessage?.contains("network", ignoreCase = true) == true) {
            retryCount++
            Log.d(NAME, "Retrying interactive sign-in (attempt $retryCount/$maxRetries)")
            delay(2000L * retryCount)
            continue
          }
          
          return@withContext Arguments.createMap().apply {
            putString("type", "configuration_error")
            putString("message", "Developer console is not set up correctly. Please verify your OAuth 2.0 Client ID configuration in Google Cloud Console and ensure the SHA-1 fingerprint is correctly added.")
            putString("errorCode", e.type)
          }
        } catch (e: GetCredentialCancellationException) {
          Log.d(NAME, "GetCredentialCancellationException caught - This may be a known issue with Credential Manager API")
          Log.d(NAME, "Exception message: " + (e.localizedMessage ?: "Unknown error"))
          
          // Known issue: GetCredentialCancellationException is sometimes thrown even when user completes consent
          // This is a workaround for the Credential Manager API issue
          // Reference: https://stackoverflow.com/questions/78345532/credential-manager-always-returns-getcredentialcancellationexception-activity
          return@withContext Arguments.createMap().apply {
            putString("type", "cancelled")
            putString("message", "Sign-in was cancelled. This might be due to a known Credential Manager API issue. Please try recreating OAuth 2.0 Client IDs in Google Cloud Console if this persists.")
          }
        } catch (e: GetCredentialException) {
          Log.d(NAME, "GetCredentialException caught - Type: " + e.type + ", Message: " + (e.localizedMessage ?: "Unknown error"))
          Log.e(NAME, "Interactive sign-in failed - Type: " + e.type + ", Message: " + (e.localizedMessage ?: "Unknown error"), e)
          if (retryCount < maxRetries && isRetryableError(e)) {
            retryCount++
            Log.d(NAME, "Retrying interactive sign-in (attempt $retryCount/$maxRetries)")
            delay(2000L * retryCount)
            continue
          }
          throw e
        }
      }
      
      // This should never be reached, but just in case
      throw Exception("Interactive sign-in failed after $maxRetries retries")
    }
  }

  private fun handleCredentialResponse(result: GetCredentialResponse): WritableMap {
    val credential = result.credential
    Log.d(NAME, "Processing credential response - Type: " + credential.type)
    
    when (credential.type) {
      GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL -> {
        try {
          val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
          
          // Cache the ID token and parse expiration
          cachedIdToken = googleIdTokenCredential.idToken
          parseTokenExpiration(googleIdTokenCredential.idToken)
          
          // Create user info for caching - create a copy to avoid "map already consumed" error
          val cachedUser = Arguments.createMap().apply {
            putString("id", googleIdTokenCredential.id)
            putString("name", googleIdTokenCredential.displayName)
            putString("email", googleIdTokenCredential.id) // Email is typically the ID
            putString("photo", googleIdTokenCredential.profilePictureUri?.toString())
            putString("familyName", googleIdTokenCredential.familyName)
            putString("givenName", googleIdTokenCredential.givenName)
          }
          
          // Cache tokens and user info first
          cachedAccessToken = null // Credential Manager doesn't provide access tokens directly
          cachedUserInfo = cachedUser
          
          // Save to secure storage
          saveCredentialsSecurely(cachedIdToken, cachedAccessToken, cachedUserInfo, tokenExpiresAt)
          
          // Create separate user info for response data to avoid "map already consumed" error
          val responseUser = Arguments.createMap().apply {
            putString("id", googleIdTokenCredential.id)
            putString("name", googleIdTokenCredential.displayName)
            putString("email", googleIdTokenCredential.id) // Email is typically the ID
            putString("photo", googleIdTokenCredential.profilePictureUri?.toString())
            putString("familyName", googleIdTokenCredential.familyName)
            putString("givenName", googleIdTokenCredential.givenName)
          }
          
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
          throw Exception("Failed to parse Google ID token: " + (e.localizedMessage ?: "Unknown error"))
        }
      }
      else -> {
        throw Exception("Unexpected credential type: " + credential.type)
      }
    }
  }

  private fun parseTokenExpiration(idToken: String) {
    try {
      val parts = idToken.split(".")
      if (parts.size >= 2) {
        val payload = String(Base64.getUrlDecoder().decode(parts[1]))
        val json = JSONObject(payload)
        val exp = json.optLong("exp", 0)
        if (exp > 0) {
          tokenExpiresAt = exp * 1000 // Convert to milliseconds
        }
      }
    } catch (e: Exception) {
      Log.w(NAME, "Failed to parse token expiration: " + (e.localizedMessage ?: "Unknown error"))
    }
  }

  // MARK: - Secure Credential Storage
  
  private fun saveCredentialsSecurely(idToken: String?, accessToken: String?, userInfo: WritableMap?, expiresAt: Long?) {
    try {
      securePrefs.edit().apply {
        if (idToken != null) putString(PREF_ID_TOKEN, idToken) else remove(PREF_ID_TOKEN)
        if (accessToken != null) putString(PREF_ACCESS_TOKEN, accessToken) else remove(PREF_ACCESS_TOKEN)
        if (userInfo != null) putString(PREF_USER_INFO, userInfo.toString()) else remove(PREF_USER_INFO)
        if (expiresAt != null) putLong(PREF_TOKEN_EXPIRES_AT, expiresAt) else remove(PREF_TOKEN_EXPIRES_AT)
        putBoolean(PREF_IS_SIGNED_IN, idToken != null)
        apply()
      }
      Log.d("GoogleAuth", "Credentials saved securely")
    } catch (e: Exception) {
      Log.e("GoogleAuth", "Failed to save credentials securely: " + (e.localizedMessage ?: "Unknown error"))
    }
  }
  
  private fun loadCredentialsSecurely(): Boolean {
    return try {
      if (!securePrefs.getBoolean(PREF_IS_SIGNED_IN, false)) {
        return false
      }
      
      cachedIdToken = securePrefs.getString(PREF_ID_TOKEN, null)
      cachedAccessToken = securePrefs.getString(PREF_ACCESS_TOKEN, null)
      tokenExpiresAt = securePrefs.getLong(PREF_TOKEN_EXPIRES_AT, 0).takeIf { it > 0 }
      
      val userInfoJson = securePrefs.getString(PREF_USER_INFO, null)
      cachedUserInfo = userInfoJson?.let {
        try {
          val jsonObject = JSONObject(it)
          Arguments.createMap().apply {
            if (jsonObject.has("id")) putString("id", jsonObject.getString("id"))
            if (jsonObject.has("name")) putString("name", jsonObject.getString("name"))
            if (jsonObject.has("email")) putString("email", jsonObject.getString("email"))
            if (jsonObject.has("photo")) putString("photo", jsonObject.getString("photo"))
            if (jsonObject.has("familyName")) putString("familyName", jsonObject.getString("familyName"))
            if (jsonObject.has("givenName")) putString("givenName", jsonObject.getString("givenName"))
          }
        } catch (e: Exception) {
          Log.w("GoogleAuth", "Failed to parse cached user info: " + (e.localizedMessage ?: "Unknown error"))
          null
        }
      }
      
      Log.d("GoogleAuth", "Credentials loaded from secure storage")
      cachedIdToken != null
    } catch (e: Exception) {
      Log.e("GoogleAuth", "Failed to load credentials securely: " + (e.localizedMessage ?: "Unknown error"))
      false
    }
  }
  
  private fun clearCredentialsSecurely() {
    try {
      securePrefs.edit().apply {
        remove(PREF_ID_TOKEN)
        remove(PREF_ACCESS_TOKEN)
        remove(PREF_USER_INFO)
        remove(PREF_TOKEN_EXPIRES_AT)
        remove(PREF_IS_SIGNED_IN)
        apply()
      }
      Log.d("GoogleAuth", "Credentials cleared from secure storage")
    } catch (e: Exception) {
      Log.e("GoogleAuth", "Failed to clear credentials securely: " + (e.localizedMessage ?: "Unknown error"))
    }
  }
  
  companion object {
    const val NAME = "GoogleAuth"
    private const val PREF_ID_TOKEN = "id_token"
    private const val PREF_ACCESS_TOKEN = "access_token"
    private const val PREF_USER_INFO = "user_info"
    private const val PREF_TOKEN_EXPIRES_AT = "token_expires_at"
    private const val PREF_IS_SIGNED_IN = "is_signed_in"
  }
}
