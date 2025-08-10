import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from '../common/Avatar'
import { theme } from '../../constants/theme'

interface StoryBarProps {
  userAvatar?: string
  onAddStep: () => void
}

export const StoryBar: React.FC<StoryBarProps> = ({ userAvatar, onAddStep }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Avatar size="medium" src={userAvatar} />
        <Text style={styles.placeholder}>Share your next step...</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAddStep} activeOpacity={0.8}>
        <Ionicons name="add" size={20} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholder: {
    marginLeft: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.tertiaryText,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
})