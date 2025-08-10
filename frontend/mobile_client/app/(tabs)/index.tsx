import React, { useState } from 'react'
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

// Mock data matching the design exactly
const mockPosts: PostData[] = [
  {
    id: '1',
    user: {
      name: 'Emma Chen',
      avatar: 'https://i.pravatar.cc/150?img=1',
      meta: 'Career • 2h ago',
    },
    categories: [
      { label: 'Call to Adventure', color: '#E5F4FF' },
      { label: 'Threshold', color: '#FFE5F0' },
      { label: 'Breakthrough', color: '#F0FFE5' },
    ],
    title: 'From Corporate to Creative: My Year of Change',
    content: '24 steps',
    engagement: {
      likes: 243,
      comments: 42,
      relates: 0,
      isLiked: false,
    },
    inspiredBy: {
      user: 'career_coach_mike',
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  },
  {
    id: '2',
    user: {
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      meta: 'Healing • 4h ago',
    },
    title: 'Finding Strength in Vulnerability Journey',
    content: 'Today I finally opened up to my support group about my struggles. The weight that lifted from my shoulders was incredible.',
    steps: '8 steps',
    media: {
      image: 'https://picsum.photos/400/300?random=1',
      caption: 'Photo from support group meeting',
    },
    tags: [
      { label: 'Mental Health', type: 'category' },
      { label: 'Community', type: 'category' },
    ],
    engagement: {
      likes: 128,
      comments: 36,
      relates: 0,
      isLiked: true,
    },
    inspiredBy: {
      user: 'mental_health_warrior',
      avatar: 'https://i.pravatar.cc/150?img=9',
    },
  },
  {
    id: '3',
    user: {
      name: 'Taylor Morgan',
      avatar: 'https://i.pravatar.cc/150?img=3',
      meta: 'Parenting • 1d ago',
    },
    title: 'Navigating Special Needs Education Journey',
    content: 'After months of anxiety, my son with autism had a smooth first day at his new school. The preparation and advocacy paid off!',
    steps: '15 steps',
    media: {
      image: 'https://picsum.photos/400/300?random=2',
      caption: 'Video of backpack preparation',
    },
    tags: [
      { label: 'Special Needs', type: 'category' },
      { label: 'Milestone', type: 'category' },
    ],
    engagement: {
      likes: 89,
      comments: 24,
      relates: 0,
      isLiked: false,
    },
    inspiredBy: {
      user: 'autism_parent_support',
      avatar: 'https://i.pravatar.cc/150?img=10',
    },
  },
]

const tabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'career', label: 'Career' },
  { id: 'healing', label: 'Healing' },
]

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('for-you')
  const [refreshing, setRefreshing] = useState(false)
  const [posts, setPosts] = useState(mockPosts)
  const { showModal } = useAddStepModal()

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
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
        userAvatar="https://i.pravatar.cc/150?img=5"
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