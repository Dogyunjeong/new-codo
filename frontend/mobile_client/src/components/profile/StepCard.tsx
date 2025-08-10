import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

const { width: screenWidth } = Dimensions.get('window')

export interface StepData {
  id: string
  type: 'Breakthrough' | 'Challenge' | 'Threshold'
  date: string
  content: string
  media?: {
    image: string
    caption?: string
  }
  engagement: {
    likes: number
    comments: number
    isLiked?: boolean
    isSaved?: boolean
  }
}

interface StepCardProps {
  step: StepData
  onLike?: () => void
  onComment?: () => void
  onSave?: () => void
  onShare?: () => void
  onMore?: () => void
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  onLike,
  onComment,
  onSave,
  onShare,
  onMore,
}) => {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'Breakthrough':
        return { name: 'trophy' as const, color: '#FFD700' }
      case 'Challenge':
        return { name: 'warning' as const, color: '#FF9500' }
      case 'Threshold':
        return { name: 'key' as const, color: '#8B5CF6' }
      default:
        return { name: 'flag' as const, color: theme.colors.primary }
    }
  }

  const icon = getStepIcon(step.type)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.typeSection}>
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
            <Ionicons name={icon.name} size={18} color={icon.color} />
          </View>
          <View style={styles.typeInfo}>
            <Text style={styles.typeText}>{step.type}</Text>
            <Text style={styles.dateText}>{step.date}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onMore} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.secondaryText} />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{step.content}</Text>

      {step.media && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: step.media.image }} style={styles.media} resizeMode="cover" />
          {step.media.caption && (
            <View style={styles.mediaCaptionContainer}>
              <Text style={styles.mediaCaption}>{step.media.caption}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.engagement}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike} activeOpacity={0.7}>
            <Ionicons
              name={step.engagement.isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={step.engagement.isLiked ? theme.colors.danger : theme.colors.primaryText}
            />
            <Text style={styles.actionCount}>{step.engagement.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onComment} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primaryText} />
            <Text style={styles.actionCount}>{step.engagement.comments}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconButton} onPress={onSave} activeOpacity={0.7}>
            <Ionicons
              name={step.engagement.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={theme.colors.primaryText}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={onShare} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={20} color={theme.colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  typeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeInfo: {
    marginLeft: theme.spacing.md,
  },
  typeText: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
    fontWeight: '600',
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.tertiaryText,
    marginTop: 2,
  },
  moreButton: {
    padding: theme.spacing.xs,
  },
  content: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  mediaContainer: {
    marginBottom: theme.spacing.md,
  },
  media: {
    width: screenWidth,
    height: screenWidth * 0.6,
    backgroundColor: '#4B5563',
  },
  mediaCaptionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: theme.spacing.lg,
  },
  mediaCaption: {
    ...theme.typography.body,
    color: theme.colors.white,
    textAlign: 'center',
  },
  engagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  leftActions: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  rightActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionCount: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
})