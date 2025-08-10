import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../constants/theme'

interface ProfileStatsProps {
  stats: {
    steps: number
    following: number
    followers: number
  }
  onStatPress?: (stat: 'steps' | 'following' | 'followers') => void
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  onStatPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => onStatPress?.('steps')}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{stats.steps}</Text>
        <Text style={styles.statLabel}>Steps</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => onStatPress?.('following')}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{stats.following}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.statItem}
        onPress={() => onStatPress?.('followers')}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{stats.followers}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
})