import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface PostEngagementProps {
  likes: number
  comments: number
  relates: number
  isLiked?: boolean
  isRelated?: boolean
  onLike?: () => void
  onComment?: () => void
  onRelate?: () => void
}

export const PostEngagement: React.FC<PostEngagementProps> = ({
  likes,
  comments,
  relates,
  isLiked = false,
  isRelated = false,
  onLike,
  onComment,
  onRelate,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={isLiked ? theme.colors.danger : theme.colors.primaryText}
        />
        <Text style={styles.count}>{likes}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onComment}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chatbubble-outline"
          size={20}
          color={theme.colors.primaryText}
        />
        <Text style={styles.count}>{comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onRelate}
        activeOpacity={0.7}
      >
        <Ionicons
          name="link-outline"
          size={20}
          color={isRelated ? theme.colors.info : theme.colors.primaryText}
        />
        <Text style={styles.relateText}>Relate</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xxl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  count: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  relateText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
})