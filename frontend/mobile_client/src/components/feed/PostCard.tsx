import React from 'react'
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { PostHeader } from './PostHeader'
import { PostEngagement } from './PostEngagement'
import { Pill } from '../common/Pill'
import { Avatar } from '../common/Avatar'
import { theme } from '../../constants/theme'

const { width: screenWidth } = Dimensions.get('window')

export interface PostData {
  id: string
  user: {
    name: string
    avatar?: string
    meta: string
  }
  categories?: Array<{
    label: string
    color?: string
  }>
  title: string
  content: string
  steps?: string
  media?: {
    image: string
    caption?: string
  }
  tags?: Array<{
    label: string
    type: string
  }>
  engagement: {
    likes: number
    comments: number
    relates: number
    isLiked?: boolean
    isRelated?: boolean
  }
  inspiredBy?: {
    user: string
    avatar?: string
  }
}

interface PostCardProps {
  post: PostData
  onLike?: () => void
  onComment?: () => void
  onRelate?: () => void
  onUserPress?: () => void
  onMorePress?: () => void
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onRelate,
  onUserPress,
  onMorePress,
}) => {
  return (
    <View style={styles.container}>
      <PostHeader
        user={post.user}
        onUserPress={onUserPress}
        onMorePress={onMorePress}
      />

      {post.categories && post.categories.length > 0 && (
        <View style={styles.categories}>
          {post.categories.map((category, index) => (
            <View key={index} style={index > 0 && styles.categorySpacing}>
              <Pill
                label={category.label}
                backgroundColor={category.color}
                size="small"
              />
            </View>
          ))}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.content}</Text>
        {post.steps && (
          <Text style={styles.steps}>{post.steps}</Text>
        )}
      </View>

      {post.media && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.media.image }}
            style={styles.media}
            resizeMode="cover"
          />
          {post.media.caption && (
            <View style={styles.mediaCaptionContainer}>
              <Text style={styles.mediaCaption}>{post.media.caption}</Text>
            </View>
          )}
        </View>
      )}

      {post.tags && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.map((tag, index) => (
            <View key={index} style={index > 0 && styles.tagSpacing}>
              <Pill
                label={tag.label}
                size="small"
              />
            </View>
          ))}
        </View>
      )}

      <PostEngagement
        likes={post.engagement.likes}
        comments={post.engagement.comments}
        relates={post.engagement.relates}
        isLiked={post.engagement.isLiked}
        isRelated={post.engagement.isRelated}
        onLike={onLike}
        onComment={onComment}
        onRelate={onRelate}
      />

      {post.inspiredBy && (
        <View style={styles.inspiredContainer}>
          <Avatar size="small" src={post.inspiredBy.avatar} name={post.inspiredBy.user} />
          <Text style={styles.inspiredText}>
            Inspired by @{post.inspiredBy.user}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  categorySpacing: {
    marginLeft: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    lineHeight: 20,
  },
  steps: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.sm,
  },
  mediaContainer: {
    marginBottom: theme.spacing.md,
  },
  media: {
    width: screenWidth,
    height: screenWidth * 0.75,
    backgroundColor: theme.colors.surfaceLight,
  },
  mediaCaptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.md,
  },
  mediaCaption: {
    ...theme.typography.body,
    color: theme.colors.white,
    textAlign: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tagSpacing: {
    marginLeft: theme.spacing.sm,
  },
  inspiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inspiredText: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
  },
})