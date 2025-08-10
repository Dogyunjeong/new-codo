import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { StepCard, StepData } from '../components/profile/StepCard'
import { theme } from '../constants/theme'

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

export const ProfileFeedScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-steps')
  const [steps] = useState(mockSteps)

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map(renderTab)}
      </View>
      
      <FlatList
        data={steps}
        keyExtractor={(item) => item.id}
        renderItem={renderStep}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
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