import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { ProfileHeader } from '../../src/components/profile/ProfileHeader'
import { ProfileStats } from '../../src/components/profile/ProfileStats'
import { ProfileTags } from '../../src/components/profile/ProfileTags'
import { JourneySection } from '../../src/components/profile/JourneySection'
import { StepCard, StepData } from '../../src/components/profile/StepCard'
import { JourneyData } from '../../src/components/profile/JourneyCard'
import { theme } from '../../src/constants/theme'

const { height: screenHeight } = Dimensions.get('window')
const HEADER_HEIGHT = 400
const TAB_BAR_HEIGHT = 50

// Mock data matching the design exactly
const profileData = {
  user: {
    name: 'Jamie Wilson',
    username: '@jamiewilson',
    bio: 'Documenting my journey through career change, mindfulness, and personal growth. Finding my path one step at a time.',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  stats: {
    steps: 24,
    following: 156,
    followers: 432,
  },
  tags: ['Career Change', 'Mindfulness', 'Writing'],
}

const journeys: JourneyData[] = [
  {
    id: '1',
    title: 'From Burnout to Balance',
    description: 'Career transition from corporate to freelance design',
    date: 'May 12, 2025',
    steps: 42,
    status: 'Active',
    image: 'https://picsum.photos/200/160?random=1',
    imageCaption: 'Career transition workspace',
  },
  {
    id: '2',
    title: 'Mindful Living',
    description: 'Daily practices for mental wellness and self-care',
    date: 'Jan 15, 2025',
    steps: 12,
    status: 'Ongoing',
    image: 'https://picsum.photos/200/160?random=2',
    imageCaption: 'Meditation and wellness',
  },
]

const mockSteps: StepData[] = [
  {
    id: '1',
    type: 'Breakthrough',
    date: 'June 4, 2025',
    content: 'After months of preparation, I finally completed my first paid design project. The client was thrilled with the results!',
    media: {
      image: 'https://picsum.photos/400/240?random=3',
      caption: 'Project completion celebration',
    },
    engagement: {
      likes: 87,
      comments: 14,
      isLiked: true,
      isSaved: false,
    },
  },
  {
    id: '2',
    type: 'Challenge',
    date: 'May 28, 2025',
    content: "Today I almost gave up on the project. Feeling like I'm not qualified enough, but pushing through anyway.",
    media: {
      image: 'https://picsum.photos/400/240?random=4',
      caption: 'Journal entry about self-doubt',
    },
    engagement: {
      likes: 124,
      comments: 32,
      isLiked: false,
      isSaved: true,
    },
  },
  {
    id: '3',
    type: 'Threshold',
    date: 'May 12, 2025',
    content: 'I finally did it. After 7 years at the same company, I handed in my resignation to pursue my passion.',
    engagement: {
      likes: 201,
      comments: 46,
      isLiked: true,
      isSaved: true,
    },
  },
]

const tabs = [
  { id: 'my-steps', label: 'My Steps' },
  { id: 'saved', label: 'Saved' },
  { id: 'related', label: 'Related' },
]

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('my-steps')
  const scrollY = useRef(new Animated.Value(0)).current

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  })

  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - TAB_BAR_HEIGHT],
    outputRange: [HEADER_HEIGHT, TAB_BAR_HEIGHT],
    extrapolate: 'clamp',
  })

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
    console.log('Settings')
  }

  const handleViewAllJourneys = () => {
    console.log('View all journeys')
  }

  const handleJourneyPress = (journey: JourneyData) => {
    console.log('Journey pressed:', journey.title)
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
    <>
      <Animated.View
        style={[
          styles.profileInfoContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
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
          title="Jamie's Journey"
          journeys={journeys}
          onViewAll={handleViewAllJourneys}
          onJourneyPress={handleJourneyPress}
        />
      </Animated.View>

      <View style={{ height: TAB_BAR_HEIGHT }} />
    </>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <Animated.View
        style={[
          styles.stickyTabBar,
          {
            transform: [{ translateY: tabBarTranslateY }],
          },
        ]}
      >
        <View style={styles.tabBar}>
          {tabs.map(renderTab)}
        </View>
      </Animated.View>

      <Animated.FlatList
        data={mockSteps}
        keyExtractor={(item) => item.id}
        renderItem={renderStep}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
  stickyTabBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
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
})