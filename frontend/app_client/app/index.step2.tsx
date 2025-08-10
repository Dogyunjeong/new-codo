import React from 'react';
import { View, Text } from 'react-native';

// Step 2: Add basic React Native components (View, Text)
export default function Index() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>🚀 Ziririt App Test</Text>
      <Text style={{ fontSize: 18, color: '#666' }}>App is working!</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, marginVertical: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Auth Status:</Text>
        <Text>Loading: false (temporarily disabled)</Text>
        <Text>Authenticated: false (temporarily disabled)</Text>
      </View>
      
      <View style={{ gap: 15 }}>
        <Text>Go to Login</Text>
        <Text>Go to Tabs (Test)</Text>
      </View>
    </View>
  );
}