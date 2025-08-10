import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginWithGoogle, loginWithApple } from '../../store/slices/authSlice';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [loginType, setLoginType] = useState<'google' | 'apple' | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoginType('google');
      // For now, we'll simulate the OAuth flow with a mock code
      // In a real app, this would use expo-auth-session
      const mockCode = 'mock-google-auth-code-' + Date.now();
      const result = await dispatch(loginWithGoogle(mockCode)).unwrap();
      console.log('Google login successful:', result);
    } catch (error) {
      console.error('Google login failed:', error);
      Alert.alert('Login Failed', error as string);
    } finally {
      setLoginType(null);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoginType('apple');
      // For now, we'll simulate the OAuth flow with a mock code
      // In a real app, this would use expo-auth-session
      const mockCode = 'mock-apple-auth-code-' + Date.now();
      const result = await dispatch(loginWithApple(mockCode)).unwrap();
      console.log('Apple login successful:', result);
    } catch (error) {
      console.error('Apple login failed:', error);
      Alert.alert('Login Failed', error as string);
    } finally {
      setLoginType(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Ziririt</Text>
          <Text style={styles.subtitle}>
            Track your goals, share your progress, inspire others
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading && loginType === 'google' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.appleButton]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            {isLoading && loginType === 'apple' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue with Apple</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;