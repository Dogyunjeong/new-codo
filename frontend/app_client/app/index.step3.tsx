import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// Step 3: Add TouchableOpacity and navigation
export default function Index() {
  const goToLogin = () => {
    router.push('/auth/login');
  };

  const goToTabs = () => {
    router.push('/(tabs)/feed');
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>🚀 Ziririt App Test</Text>
      <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 30 }}>App is working!</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 30 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Auth Status:</Text>
        <Text style={{ marginBottom: 5 }}>Loading: false (temporarily disabled)</Text>
        <Text style={{ marginBottom: 5 }}>Authenticated: false (temporarily disabled)</Text>
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