import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native'
import { ProfileHeader } from '../../src/components/profile/ProfileHeader'
import { ProfileStats } from '../../src/components/profile/ProfileStats'
import { ProfileTags } from '../../src/components/profile/ProfileTags'
import { JourneySection } from '../../src/components/profile/JourneySection'
import { StepCard, StepData } from '../../src/components/profile/StepCard'
import { JourneyData } from '../../src/components/profile/JourneyCard'
import { theme } from '../../src/constants/theme'
import { useAuth } from '../../src/contexts/AuthContext'
import { PostService } from '../../src/services/PostService'
import { ProfileService } from '../../src/services/ProfileService'
import { Post, Goal } from '../../src/services/post/types'

const { height: screenHeight } = Dimensions.get('window')
const TAB_BAR_HEIGHT = 50


const tabs = [
  { id: 'my-steps', label: 'My Steps' },
  { id: 'saved', label: 'Saved' },
  { id: 'related', label: 'Related' },
]

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('my-steps')
  const [userSteps, setUserSteps] = useState<StepData[]>([])
  const [userJourneys, setUserJourneys] = useState<JourneyData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const { user, signOut, isAuthenticated } = useAuth()
  const postService = PostService.getInstance()
  const profileService = ProfileService.getInstance()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login')
      router.replace('/auth/login')
      return
    }
    
    if (user) {
      loadUserPosts()
      loadUserGoals()
    } else {
      setUserSteps([])
      setUserJourneys([])
    }
  }, [user, isAuthenticated])

  // Reload posts and goals when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserPosts()
      loadUserGoals()
    }, [user])
  )

  const loadUserGoals = async () => {
    if (!user) {
      console.log('No user found for loading goals')
      return
    }
    
    try {
      const goals = await profileService.getUserGoals(user.userId)
      console.log('Loaded goals:', goals.length, 'goals:', goals)
      
      // Convert goals to JourneyData format
      const journeys: JourneyData[] = goals.map((goal: Goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || '',
        date: new Date(goal.createdAt).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        steps: goal.progress || 0,
        status: goal.isPrivate ? 'Ongoing' : 'Active' as 'Active' | 'Ongoing',
        image: goal.emoji ? undefined : 'https://picsum.photos/200',
      }))
      
      setUserJourneys(journeys)
    } catch (error) {
      console.error('Failed to load goals:', error)
      setUserJourneys([])
    }
  }

  const loadUserPosts = async () => {
    if (!user) {
      console.log('No user found in auth context')
      return
    }
    
    try {
      console.log('Loading posts for user:', {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        fullUser: user
      })
      const posts = await postService.getPosts(user.userId)
      console.log('Loaded posts:', posts.length, 'posts:', posts)
      
      // Convert posts to StepData format
      const steps: StepData[] = posts.map(post => ({
        id: post.id,
        type: post.categories?.[0]?.label || 'Progress',
        date: new Date(post.createdAt).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        content: `${post.title}${post.content ? '\n\n' + post.content : ''}`,
        media: post.media ? {
          image: post.media.image || post.media.video,
          caption: post.media.caption,
        } : undefined,
        engagement: {
          likes: post.engagement.likes,
          comments: post.engagement.comments,
          isLiked: post.engagement.isLiked,
          isSaved: false,
        },
      }))
      
      setUserSteps(steps)
    } catch (error) {
      console.error('Failed to load user posts:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadUserPosts(), loadUserGoals()])
    setRefreshing(false)
  }

  // Use actual user data from auth context, with fallbacks
  const profileData = {
    user: {
      name: user?.displayName || user?.email?.split('@')[0] || 'User',
      username: user?.email ? '@' + user.email.split('@')[0] : '@user',
      bio: 'Welcome to HeroJourney! Share your story.',
      avatar: user?.photoURL || undefined,
    },
    stats: {
      steps: userSteps.length,
      following: 156,
      followers: 432,
    },
    tags: ['Career Change', 'Mindfulness', 'Writing'],
  }


  const handleStatPress = (stat: 'steps' | 'following' | 'followers') => {
    console.log('Stat pressed:', stat)
  }

  const handleTagPress = (tag: string) => {
    console.log('Tag pressed:', tag)
  }

  const handleEditPress = () => {
    console.log('Edit profile')
  }

  const handleSettingsPress = () => {
    Alert.alert(
      'Settings',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Logout', 
                  style: 'destructive', 
                  onPress: async () => {
                    await signOut()
                    // Force navigation to auth screen
                    router.replace('/auth/login')
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleViewAllJourneys = () => {
    console.log('View all journeys')
  }

  const handleJourneyPress = (journey: JourneyData) => {
    console.log('Journey pressed:', journey.title)
    router.push(`/goal-detail?goalId=${journey.id}`)
  }

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.id
    return (
      <TouchableOpacity
        key={tab.id}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(tab.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
      </TouchableOpacity>
    )
  }

  const renderStep = ({ item }: { item: StepData }) => (
    <StepCard
      step={item}
      onLike={() => console.log('Like', item.id)}
      onComment={() => console.log('Comment', item.id)}
      onSave={() => console.log('Save', item.id)}
      onShare={() => console.log('Share', item.id)}
      onMore={() => console.log('More', item.id)}
    />
  )

  const ListHeaderComponent = () => (
    <View style={styles.profileInfoContainer}>
      <ProfileHeader
        user={profileData.user}
        onEdit={handleEditPress}
        onSettings={handleSettingsPress}
      />
      
      <ProfileStats
        stats={profileData.stats}
        onStatPress={handleStatPress}
      />
      
      <ProfileTags
        tags={profileData.tags}
        onTagPress={handleTagPress}
      />
      
      <JourneySection
        title="My Journey"
        journeys={userJourneys}
        onViewAll={handleViewAllJourneys}
        onJourneyPress={handleJourneyPress}
      />
      
      <View style={styles.tabBar}>
        {tabs.map(renderTab)}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FlatList
        data={userSteps}
        keyExtractor={(item) => item.id}
        renderItem={renderStep}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Start sharing your journey!</Text>
          </View>
        }
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
  profileInfoContainer: {
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    height: TAB_BAR_HEIGHT,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.button,
    color: theme.colors.secondaryText,
  },
  activeTabText: {
    color: theme.colors.primaryText,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.primaryText,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.secondaryText,
  },
})