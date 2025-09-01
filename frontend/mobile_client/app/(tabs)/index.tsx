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
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StoryBar } from '../../src/components/feed/StoryBar'
import { TabBar } from '../../src/components/common/TabBar'
import { PostCard, PostData } from '../../src/components/feed/PostCard'
import { useAddStepModal } from '../../src/contexts/AddStepModalContext'
import { theme } from '../../src/constants/theme'
import { PostService } from '../../src/services/PostService'
import { FeedService } from '../../src/services/FeedService'
import { Post } from '../../src/services/post/types'
import { useAuth } from '../../src/contexts/AuthContext'


const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'career', label: 'Career' },
  { id: 'healing', label: 'Healing' },
]

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('for-you')
  const [refreshing, setRefreshing] = useState(false)
  const [posts, setPosts] = useState<PostData[]>([])
  const { showModal } = useAddStepModal()
  const { user, isAuthenticated } = useAuth()
  const postService = PostService.getInstance()
  const feedService = FeedService.getInstance()

  useEffect(() => {
    // Only load posts if user is authenticated
    if (isAuthenticated) {
      loadPosts()
    }
  }, [isAuthenticated])

  // Reload posts when screen comes into focus (e.g., after creating a post)
  useFocusEffect(
    useCallback(() => {
      // Only load posts if user is authenticated
      if (isAuthenticated) {
        loadPosts()
      }
    }, [isAuthenticated])
  )

  const loadPosts = async () => {
    try {
      // Try to fetch from feed service first, fallback to post service if needed
      let fetchedPosts: any[] = [];
      
      try {
        // Attempt to get feed from backend feed service
        fetchedPosts = await feedService.getHomeFeed();
      } catch (feedError) {
        console.log('Feed service not available, falling back to post service');
        // Fallback to post service if feed service fails
        fetchedPosts = await postService.getPosts();
      }
      
      const mappedPosts: PostData[] = fetchedPosts.map((post: any) => ({
        id: post.id || post._id,
        user: {
          // Handle both structures: post.user object or just post.userId
          name: post.user?.name || post.userName || 'Unknown User',
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
      console.error('Failed to load posts:', error)
      // Set empty posts array on error
      setPosts([])
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts()
    setRefreshing(false)
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
      onLike={() => console.log('Like', item.id)}
      onComment={() => console.log('Comment', item.id)}
      onRelate={() => console.log('Relate', item.id)}
      onUserPress={() => console.log('User press', item.user.name)}
      onMorePress={() => console.log('More', item.id)}
    />
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
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
})