import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector } from '../src/store';

// Step 4: Add Redux integration
export default function Index() {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  const goToLogin = () => {
    router.push('/auth/login');
  };

  const goToTabs = () => {
    router.push('/(tabs)/feed');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🚀 Ziririt App Test</Text>
      <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 30 }}>App is working!</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 30 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Auth Status:</Text>
        <Text style={{ marginBottom: 5 }}>Loading: {isLoading ? 'true' : 'false'}</Text>
        <Text style={{ marginBottom: 5 }}>Authenticated: {isAuthenticated ? 'true' : 'false'}</Text>
      </View>
      
      <View style={{ gap: 15, width: '100%' }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 8, alignItems: 'center' }}
          onPress={goToLogin}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Go to Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ backgroundColor: '#FF6B6B', paddingVertical: 15, borderRadius: 8, alignItems: 'center' }}
          onPress={goToTabs}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Go to Tabs (Test)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}