import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StoryBar } from '../../src/components/feed/StoryBar'
import { TabBar } from '../../src/components/common/TabBar'
import { PostCard, PostData } from '../../src/components/feed/PostCard'
import { useAddStepModal } from '../../src/contexts/AddStepModalContext'
import { theme } from '../../src/constants/theme'
import { FeedService } from '../../src/services/FeedService'
import { useAuth } from '../../src/contexts/AuthContext'
import { mapRawPostsToPostData } from '../../src/utils/postMapper'


const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'career', label: 'Career' },
  { id: 'healing', label: 'Healing' },
]

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('for-you')
  const [refreshing, setRefreshing] = useState(false)
  const [isFeedLoading, setIsFeedLoading] = useState(false)
  const [feedError, setFeedError] = useState<string | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const { showModal } = useAddStepModal()
  const { user, isAuthenticated } = useAuth()
  const feedService = FeedService.getInstance()

  const loadPosts = useCallback(async (withLoading: boolean = true) => {
    try {
      if (withLoading) {
        setIsFeedLoading(true)
      }
      setFeedError(null)

      const fetchedPosts = await feedService.getHomeFeed()
      setPosts(mapRawPostsToPostData(fetchedPosts))
    } catch (error) {
      console.error('Failed to load posts:', error)
      setPosts([])
      setFeedError(error instanceof Error ? error.message : 'Failed to load feed')
    } finally {
      if (withLoading) {
        setIsFeedLoading(false)
      }
    }
  }, [feedService])

  useEffect(() => {
    // Only load posts if user is authenticated
    if (isAuthenticated) {
      loadPosts()
      return
    }
    setPosts([])
    setFeedError(null)
  }, [isAuthenticated, loadPosts])

  // Reload posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      // Only load posts if user is authenticated
      if (isAuthenticated) {
        loadPosts()
      }
    }, [isAuthenticated, loadPosts])
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts(false)
    setRefreshing(false)
  }

  const renderEmptyState = () => {
    if (isFeedLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading feed...</Text>
        </View>
      )
    }

    if (feedError) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorTitle}>Couldn&apos;t load feed</Text>
          <Text style={styles.errorText}>{feedError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadPosts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No posts yet</Text>
      </View>
    )
  }

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.logo}>HeroJourney</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="mail-outline" size={24} color={theme.colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
      
      <StoryBar
        userAvatar={user?.photoURL || undefined}
        userName={user?.displayName || user?.email?.split('@')[0]}
        onAddStep={showModal}
      />
      
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        scrollable={true}
      />
    </>
  )

  const renderPost = ({ item }: { item: PostData }) => (
    <PostCard
      post={item}
      onLike={() => {}}
      onComment={() => {}}
      onRelate={() => {}}
      onUserPress={() => {}}
      onMorePress={() => {}}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id || `post-${index}`}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  logo: {
    ...theme.typography.logo,
    color: theme.colors.primaryText,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  headerButton: {
    padding: theme.spacing.xs,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.sm,
  },
  errorTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  retryButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
})
