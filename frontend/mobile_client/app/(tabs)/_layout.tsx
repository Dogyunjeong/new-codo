import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/constants/theme';
import { AddStepModalProvider, useAddStepModal } from '../../src/contexts/AddStepModalContext';
import { AddNewStepModal } from '../../src/screens/AddNewStepModal';
import { useAuth } from '../../src/contexts/AuthContext';

function TabLayoutContent() {
  const { showModal, hideModal, isModalVisible } = useAddStepModal();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Only render tabs if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.tertiaryText,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 8,
            position: 'relative',
          },
          tabBarLabelStyle: {
            fontSize: 10,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "compass" : "compass-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journey"
          options={{
            title: 'My Journey',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "flag" : "flag-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "person" : "person-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={showModal}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={theme.colors.white} />
      </TouchableOpacity>
      
      <AddNewStepModal
        visible={isModalVisible}
        onClose={hideModal}
        onShare={(data) => {
          console.log('New step shared:', data)
          hideModal()
        }}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <AddStepModalProvider>
      <TabLayoutContent />
    </AddStepModalProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -28,
    bottom: Platform.OS === 'ios' ? 64 : 44,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
