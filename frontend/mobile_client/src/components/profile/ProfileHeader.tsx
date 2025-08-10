import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from '../common/Avatar'
import { theme } from '../../constants/theme'

interface ProfileHeaderProps {
  user: {
    avatar?: string
    name: string
    username: string
    bio: string
  }
  onEdit?: () => void
  onSettings?: () => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEdit,
  onSettings,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Avatar size="xlarge" src={user.avatar} name={user.name} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit} activeOpacity={0.7}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={onSettings} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.bio}>{user.bio}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  headerInfo: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  name: {
    ...theme.typography.screenHeader,
    color: theme.colors.primaryText,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  username: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  editButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  bio: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    lineHeight: 22,
  },
})