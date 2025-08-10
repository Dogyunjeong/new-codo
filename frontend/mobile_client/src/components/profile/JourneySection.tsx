import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { JourneyCard, JourneyData } from './JourneyCard'
import { theme } from '../../constants/theme'

interface JourneySectionProps {
  title: string
  journeys: JourneyData[]
  onViewAll?: () => void
  onJourneyPress?: (journey: JourneyData) => void
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  title,
  journeys,
  onViewAll,
  onJourneyPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {journeys.map((journey) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            onPress={() => onJourneyPress?.(journey)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryText,
  },
  viewAll: {
    ...theme.typography.button,
    color: theme.colors.secondaryText,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
})