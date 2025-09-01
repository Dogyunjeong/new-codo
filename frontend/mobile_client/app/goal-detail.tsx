import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../src/constants/theme'
import { ProfileService } from '../src/services/ProfileService'
import { PostService } from '../src/services/PostService'
import { FeedService } from '../src/services/FeedService'
import { Goal, Post } from '../src/services/post/types'
import { PostCard, PostData } from '../src/components/feed/PostCard'
import { useAuth } from '../src/contexts/AuthContext'

export default function GoalDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const goalId = params.goalId as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { user } = useAuth()
  const profileService = ProfileService.getInstance()
  const feedService = FeedService.getInstance()

  useEffect(() => {
    if (goalId) {
      loadGoalDetails()
      loadGoalPosts()
    }
  }, [goalId])

  const loadGoalDetails = async () => {
    try {
      const goalData = await profileService.getGoal(goalId)
      if (goalData) {
        setGoal(goalData)
      }
    } catch (error) {
      console.error('Failed to load goal details:', error)
      Alert.alert('Error', 'Failed to load goal details')
    }
  }

  const loadGoalPosts = async () => {
    try {
      setLoading(true)
      // Get posts for this goal
      const goalPosts = await feedService.getGoalTimeline(goalId)
      
      // Convert to PostData format
      const mappedPosts: PostData[] = goalPosts.map((post: any) => ({
        id: post.id || post._id,
        user: {
          name: post.user?.name || post.userName || user?.displayName || 'Unknown User',
          avatar: post.user?.avatar || post.userAvatar || 'https://i.pravatar.cc/150',
          meta: post.user?.meta || post.userMeta || '',
        },
        categories: post.categories || [],
        title: post.title || '',
        content: post.content || '',
        steps: post.steps,
        media: post.media || post.mediaFiles?.[0],
        tags: post.tags || post.hashtags?.map((tag: string) => ({
          label: tag,
          type: 'hashtag' as const
        })),
        engagement: post.engagement || {
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          relates: 0,
          isLiked: false,
        },
        inspiredBy: post.inspiredBy,
      }))
      
      setPosts(mappedPosts)
    } catch (error) {
      console.error('Failed to load goal posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadGoalDetails(), loadGoalPosts()])
    setRefreshing(false)
  }

  const handleEditGoal = () => {
    // Navigate to edit goal screen (to be implemented)
    Alert.alert('Edit Goal', 'Goal editing will be implemented soon')
  }

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await profileService.deleteGoal(goalId)
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal')
            }
          }
        }
      ]
    )
  }

  if (loading && !goal) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEditGoal} style={styles.headerButton}>
            <Ionicons name="pencil" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteGoal} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goal Info */}
        {goal && (
          <View style={styles.goalInfo}>
            <View style={styles.goalHeader}>
              {goal.emoji && <Text style={styles.emoji}>{goal.emoji}</Text>}
              <View style={styles.goalTextContainer}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.description && (
                  <Text style={styles.goalDescription}>{goal.description}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.goalMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  Started {new Date(goal.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="bar-chart-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  {goal.progress || 0} steps
                </Text>
              </View>
              {goal.isPrivate && (
                <View style={styles.metaItem}>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>Private</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Progress Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Progress Timeline</Text>
          
          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>No progress posts yet</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/create-step')}
              >
                <Text style={styles.addButtonText}>Add First Step</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.postsList}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  goalInfo: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  emoji: {
    fontSize: 48,
    marginRight: theme.spacing.md,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  goalDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  goalMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  timelineSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  postsList: {
    gap: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})