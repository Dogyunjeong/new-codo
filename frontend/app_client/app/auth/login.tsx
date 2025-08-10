import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../src/store';
import { loginWithGoogle, loginWithApple } from '../../src/store/slices/authSlice';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/feed');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
    }
  }, [error]);

  const handleGoogleLogin = async () => {
    try {
      // For now, show a placeholder message
      Alert.alert('Google Login', 'Google login integration will be implemented with proper OAuth setup');
      
      // In production, you would use:
      // const result = await AuthSession.startAsync({...});
      // dispatch(loginWithGoogle(result.code));
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      // For now, show a placeholder message
      Alert.alert('Apple Login', 'Apple login integration will be implemented with proper OAuth setup');
      
      // In production, you would use Apple Authentication
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  // For development, add a bypass button
  const handleDevBypass = () => {
    // Set auth state as authenticated for development
    dispatch({ 
      type: 'auth/setAuthToken',
      payload: {
        user: { id: '1', username: 'dev-user', email: 'dev@test.com', displayName: 'Dev User' },
        token: 'dev-token'
      }
    });
    router.replace('/(tabs)/feed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Ziririt</Text>
        <Text style={styles.subtitle}>Track your goals and share your progress</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.googleButton]} 
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.appleButton]} 
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, styles.appleButtonText]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.button, styles.devButton]} 
              onPress={handleDevBypass}
            >
              <Text style={styles.buttonText}>Dev: Skip Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  devButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButtonText: {
    color: 'white',
  },
});