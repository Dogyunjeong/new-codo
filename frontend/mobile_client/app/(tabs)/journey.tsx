import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { theme } from '../../src/constants/theme'
import { PostService } from '../../src/services/PostService'
import { useAuth } from '../../src/contexts/AuthContext'
import { JourneyCard, JourneyData } from '../../src/components/profile/JourneyCard'
import { mapJourneysToJourneyData } from '../../src/utils/journeyMapper'

export default function JourneyScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const postService = PostService.getInstance()
  const [journeys, setJourneys] = useState<JourneyData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadJourneys()
  }, [user])

  const loadJourneys = async () => {
    try {
      const journeysRaw = await postService.getUserJourneys()
      setJourneys(mapJourneysToJourneyData(journeysRaw))
    } catch (error) {
      console.error('Failed to load journeys:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadJourneys()
  }

  const handleCreateJourney = () => {
    router.push('/create-journey')
  }

  const handleJourneyPress = (journey: JourneyData) => {
    router.push(`/journey?journeyId=${journey.id}`)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading journeys...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journeys</Text>
        <TouchableOpacity onPress={handleCreateJourney} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {journeys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="compass-outline" size={64} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Journeys Yet</Text>
            <Text style={styles.emptySubtitle}>Start your first journey and track your progress</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateJourney}>
              <Text style={styles.createButtonText}>Create Your First Journey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.journeyGrid}>
            {journeys.map((journey) => (
              <View key={journey.id} style={styles.journeyCardWrapper}>
                <JourneyCard
                  journey={journey}
                  onPress={() => handleJourneyPress(journey)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.logo,
    color: theme.colors.primaryText,
  },
  addButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryText,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  createButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontWeight: '600',
  },
  journeyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.md,
  },
  journeyCardWrapper: {
    width: '50%',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
})
