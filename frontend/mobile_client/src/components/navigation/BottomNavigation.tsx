import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface BottomNavigationProps {
  activeTab: 'home' | 'discover' | 'journey' | 'profile'
  onTabPress: (tab: 'home' | 'discover' | 'journey' | 'profile') => void
  onAddPress: () => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
  onAddPress,
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: 'home' as const },
    { id: 'discover' as const, label: 'Discover', icon: 'compass' as const },
    { id: 'journey' as const, label: 'My Journey', icon: 'flag' as const },
    { id: 'profile' as const, label: 'Profile', icon: 'person' as const },
  ]

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id
        const isMiddle = index === 1

        if (isMiddle) {
          return (
            <React.Fragment key={tab.id}>
              <TouchableOpacity
                style={styles.tab}
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? tab.icon : `${tab.icon}-outline` as any}
                  size={24}
                  color={isActive ? theme.colors.primary : theme.colors.tertiaryText}
                />
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.fab}
                onPress={onAddPress}
                activeOpacity={0.9}
              >
                <Ionicons name="add" size={28} color={theme.colors.white} />
              </TouchableOpacity>
            </React.Fragment>
          )
        }

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline` as any}
              size={24}
              color={isActive ? theme.colors.primary : theme.colors.tertiaryText}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    height: Platform.OS === 'ios' ? 76 : 56,
    alignItems: 'flex-start',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    color: theme.colors.tertiaryText,
  },
  activeLabel: {
    color: theme.colors.primary,
  },
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -28,
    top: -20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
})