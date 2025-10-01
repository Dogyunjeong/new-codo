import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../src/constants/theme'
import { ProfileService } from '../../src/services/ProfileService'
import { FeedService } from '../../src/services/FeedService'
import { Journey } from '../../src/services/post/types'
import { PostCard, PostData } from '../../src/components/feed/PostCard'
import { useAuth } from '../../src/contexts/AuthContext'

export default function JourneyDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const journeyId = (params.journeyId as string) || (params.goalId as string)
  
  const [journey, setJourney] = useState<Journey | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { user } = useAuth()
  const profileService = ProfileService.getInstance()
  const feedService = FeedService.getInstance()

  useEffect(() => {
    if (journeyId) {
      loadJourneyDetails()
      loadJourneyPosts()
    }
  }, [journeyId])

  const loadJourneyDetails = async () => {
    try {
      const data = await (profileService.getJourney ? profileService.getJourney(journeyId) : profileService.getGoal(journeyId))
      if (data) setJourney(data)
    } catch (error) {
      console.error('Failed to load journey:', error)
      Alert.alert('Error', 'Failed to load journey details')
    }
  }

  const loadJourneyPosts = async () => {
    try {
      setLoading(true)
      const journeyPosts = await (feedService as any).getJourneyTimeline(journeyId)
      const mapped: PostData[] = journeyPosts.map((post: any) => ({
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
        tags: post.tags || post.hashtags?.map((tag: string) => ({ label: tag, type: 'hashtag' as const })),
        engagement: post.engagement || {
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          relates: 0,
          isLiked: false,
        },
        inspiredBy: post.inspiredBy,
      }))
      setPosts(mapped)
    } catch (error) {
      console.error('Failed to load journey posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadJourneyDetails(), loadJourneyPosts()])
    setRefreshing(false)
  }

  const handleEditJourney = () => {
    Alert.alert('Edit Journey', 'Editing journey will be implemented soon')
  }

  const handleDeleteJourney = () => {
    Alert.alert(
      'Delete Journey',
      'Are you sure you want to delete this journey?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await (profileService.deleteJourney ? profileService.deleteJourney(journeyId) : profileService.deleteGoal(journeyId))
              router.back()
            } catch (error) {
              Alert.alert('Error', 'Failed to delete journey')
            }
          }
        }
      ]
    )
  }

  const handleAddStep = () => {
    router.push({ pathname: '/create-step', params: { journeyId } })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journey</Text>
        <TouchableOpacity onPress={handleEditJourney} style={styles.headerButton}>
          <Ionicons name="create-outline" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!journey ? (
          <View style={styles.loadingContainer}>
            {loading ? <ActivityIndicator /> : <Text>Journey not found</Text>}
          </View>
        ) : (
          <>
            <View style={styles.journeyCard}>
              <View style={styles.journeyHeader}>
                <Text style={styles.journeyEmoji}>{(journey as any).emoji || '🎯'}</Text>
                <Text style={styles.journeyTitle}>{journey.title}</Text>
              </View>
              {!!journey.description && (
                <Text style={styles.journeyDescription}>{journey.description}</Text>
              )}
              <View style={styles.journeyMeta}>
                {journey.isPrivate && (
                  <View style={styles.metaRow}>
                    <Ionicons name="lock-closed" size={14} color={theme.colors.textSecondary} />
                    <Text style={styles.metaText}>Private</Text>
                  </View>
                )}
                <Text style={styles.metaText}>Steps: {journey.stepsCount ?? 0}</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Steps</Text>
              <TouchableOpacity onPress={handleRefresh}>
                <Ionicons name="refresh" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              posts.map((p) => (
                <PostCard key={p.id} post={p} onLike={() => {}} onComment={() => {}} />
              ))
            )}
          </>
        )}
      </ScrollView>

      {!!journeyId && (
        <TouchableOpacity style={styles.fab} onPress={handleAddStep}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  content: { padding: 12 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  journeyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  journeyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  journeyEmoji: { fontSize: 24 },
  journeyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  journeyDescription: { marginTop: 8, color: theme.colors.textSecondary },
  journeyMeta: { marginTop: 10, flexDirection: 'row', gap: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: theme.colors.textSecondary, fontSize: 12 },
  sectionHeader: { marginTop: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
})
