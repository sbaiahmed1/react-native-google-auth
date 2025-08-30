import { useEffect, useState } from 'react';
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
  type User,
  type GetTokensResponse,
  type PlayServicesInfo,
} from 'react-native-google-auth';

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<GetTokensResponse | null>(null);
  const [playServicesInfo, setPlayServicesInfo] =
    useState<PlayServicesInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleAuth();
  }, []);

  const configureGoogleAuth = async () => {
    try {
      await GoogleAuth.configure({
        iosClientId:
          '113079111701-d5prah7tuib9jt47g1t948v9kn38l3gh.apps.googleusercontent.com',
        androidClientId:
          '113079111701-d91tmclfhambj5f0ul3fk5t81opa6o79.apps.googleusercontent.com', // Android OAuth client ID
      });
      setIsConfigured(true);
    } catch (error) {
      console.log('Configuration Error', error);
      Alert.alert(
        'Configuration Error',
        `Failed to configure Google Auth: ${error}`
      );
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

  const handleCreateAccount = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await GoogleAuth.createAccount();
      console.log('Create Account Result:', result);

      if (result.type === 'success') {
        setUser(result.data.user);
        Alert.alert(
          'Account Created',
          `Welcome ${result.data.user.name}! Your account has been created.`
        );
      } else if (result.type === 'cancelled') {
        Alert.alert(
          'Account Creation Cancelled',
          'User cancelled the account creation process'
        );
      } else {
        Alert.alert('Account Creation Failed', 'Failed to create account');
      }
    } catch (error) {
      console.log('Create Account Error:', error);
      Alert.alert('Create Account Error', `Failed to create account: ${error}`);
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
      Alert.alert('Sign Out', 'Successfully signed out');
    } catch (error) {
      console.log('Sign Out Error:', error);
      Alert.alert('Sign Out Error', `Failed to sign out: ${error}`);
    } finally {
      setLoading(false);
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

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.secondaryButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleCreateAccount}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Create Google Account'}
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
}

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
});
