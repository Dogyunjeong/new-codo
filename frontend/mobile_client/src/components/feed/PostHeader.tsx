import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Avatar } from '../common/Avatar'
import { theme } from '../../constants/theme'

interface PostHeaderProps {
  user: {
    name: string
    avatar?: string
    meta: string // e.g., "Career • 2h ago"
  }
  onUserPress?: () => void
  onMorePress?: () => void
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  user,
  onUserPress,
  onMorePress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={onUserPress}
        activeOpacity={0.7}
      >
        <Avatar size="large" src={user.avatar} name={user.name} />
        <View style={styles.textContainer}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.meta}>{user.meta}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={onMorePress}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.primaryText} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: theme.spacing.md,
  },
  userName: {
    ...theme.typography.userName,
    color: theme.colors.primaryText,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.tertiaryText,
    marginTop: 2,
  },
  moreButton: {
    padding: theme.spacing.xs,
  },
})