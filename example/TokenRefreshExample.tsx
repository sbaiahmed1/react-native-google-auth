import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import {
  GoogleAuth,
  GoogleAuthScopes,
  type User,
  type GetTokensResponse,
  type PlayServicesInfo,
} from 'react-native-google-auth';

const TokenRefreshExample: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<GetTokensResponse | null>(null);
  const [playServicesInfo, setPlayServicesInfo] =
    useState<PlayServicesInfo | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const configureGoogleAuth = useCallback(async () => {
    try {
      await GoogleAuth.configure({
        iosClientId:
          '113079111701-d5prah7tuib9jt47g1t948v9kn38l3gh.apps.googleusercontent.com',
        androidClientId:
          '113079111701-d91tmclfhambj5f0ul3fk5t81opa6o79.apps.googleusercontent.com', // Android OAuth client ID
        scopes: [
          GoogleAuthScopes.EMAIL,
          GoogleAuthScopes.PROFILE,
          // GoogleAuthScopes.DRIVE_READONLY, // Example: Request read-only access to Google Drive
        ],
      });
      setIsConfigured(true);
      checkCurrentUser();
      checkTokenExpiration();
    } catch (error) {
      console.log('Configuration Error', error);
      Alert.alert(
        'Configuration Error',
        `Failed to configure Google Auth: ${error}`
      );
    }
  }, []);

  const checkCurrentUser = async () => {
    try {
      const currentUser = await GoogleAuth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('No current user:', error);
    }
  };

  const checkTokenExpiration = async () => {
    try {
      const expired = await GoogleAuth.isTokenExpired();
      setIsTokenExpired(expired);
    } catch (error) {
      console.log('Error checking token expiration:', error);
    }
  };

  const handleGetTokens = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const tokenResult = await GoogleAuth.getTokens();
      console.log('Tokens Result:', tokenResult);
      setTokens(tokenResult);
      Alert.alert(
        'Tokens Retrieved',
        'Access and ID tokens have been retrieved successfully'
      );
    } catch (error) {
      console.log('Get Tokens Error:', error);
      Alert.alert('Get Tokens Error', `Failed to get tokens: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshTokens = async () => {
    setLoading(true);
    try {
      const refreshResponse = await GoogleAuth.refreshTokens();
      setTokens(refreshResponse);
      setIsTokenExpired(false);
      Alert.alert('Success', 'Tokens refreshed successfully');
    } catch (error: any) {
      Alert.alert('Error', `Failed to refresh tokens: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await GoogleAuth.signIn();
      console.log('Sign In Result:', result);

      if (result.type === 'success') {
        setUser(result.data.user);
        Alert.alert('Sign In Success', `Welcome ${result.data.user.name}!`);
      } else if (result.type === 'cancelled') {
        Alert.alert('Sign In Cancelled', 'User cancelled the sign-in process');
      } else {
        Alert.alert('Sign In Failed', 'No saved credential found');
      }
    } catch (error) {
      console.log('Sign In Error:', error);
      Alert.alert('Sign In Error', `Failed to sign in: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPlayServices = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Platform Not Supported',
        'Play Services check is only available on Android'
      );
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const playServices = await GoogleAuth.checkPlayServices(true);
      console.log('Play Services Info:', playServices);
      setPlayServicesInfo(playServices);
      Alert.alert(
        'Play Services Status',
        `Available: ${playServices.isAvailable}\nStatus Code: ${playServices.status || 'Unknown'}`
      );
    } catch (error) {
      console.log('Check Play Services Error:', error);
      Alert.alert(
        'Play Services Error',
        `Failed to check Play Services: ${error}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await GoogleAuth.signOut();
      setUser(null);
      setTokens(null);
      setIsTokenExpired(false);
      Alert.alert('Sign Out', 'Successfully signed out');
    } catch (error) {
      console.log('Sign Out Error:', error);
      Alert.alert('Sign Out Error', `Failed to sign out: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    configureGoogleAuth();
  }, [configureGoogleAuth]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Google Auth Example</Text>
      {!isConfigured ? (
        <Text style={styles.status}>Configuring Google Auth...</Text>
      ) : (
        <>
          {user ? (
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
              <Text style={styles.emailText}>{user.email}</Text>
              <Text style={styles.userIdText}>ID: {user.id}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleGetTokens}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Get Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleRefreshTokens}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Refresh Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.tertiaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={checkTokenExpiration}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Check Token Expiration</Text>
                </TouchableOpacity>
                {Platform.OS === 'android' && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.secondaryButton,
                      loading && styles.buttonDisabled,
                    ]}
                    onPress={handleCheckPlayServices}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>Check Play Services</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.signOutButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSignOut}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
              </View>

              {tokens && (
                <View style={styles.tokenInfo}>
                  <Text style={styles.sectionTitle}>Tokens:</Text>
                  <Text style={styles.tokenText}>
                    Access Token:{' '}
                    {tokens.accessToken?.substring(0, 20) || 'N/A'}...
                  </Text>
                  <Text style={styles.tokenText}>
                    ID Token: {tokens.idToken?.substring(0, 20) || 'N/A'}...
                  </Text>
                  {tokens.expiresAt && (
                    <Text style={styles.tokenText}>
                      Expires: {new Date(tokens.expiresAt).toLocaleString()}
                    </Text>
                  )}
                </View>
              )}

              {playServicesInfo && (
                <View style={styles.playServicesInfo}>
                  <Text style={styles.sectionTitle}>Play Services:</Text>
                  <Text style={styles.infoText}>
                    Available: {playServicesInfo.isAvailable ? 'Yes' : 'No'}
                  </Text>
                  {playServicesInfo.status && (
                    <Text style={styles.infoText}>
                      Status: {playServicesInfo.status}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.statusContainer}>
                <Text
                  style={[
                    styles.statusText,
                    { color: isTokenExpired ? 'red' : 'green' },
                  ]}
                >
                  Token Status: {isTokenExpired ? 'Expired' : 'Valid'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Signing In...' : 'Sign In with Google'}
                </Text>
              </TouchableOpacity>
              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.tertiaryButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleCheckPlayServices}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Check Play Services</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userIdText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34A853',
  },
  tertiaryButton: {
    backgroundColor: '#FBBC05',
  },
  signOutButton: {
    backgroundColor: '#EA4335',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tokenInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  playServicesInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TokenRefreshExample;
