import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { theme } from '../../constants/theme'

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = (screenWidth - theme.spacing.lg * 3) / 2

export interface JourneyData {
  id: string
  title: string
  description: string
  date: string
  steps: number
  status?: 'Active' | 'Ongoing' | 'Completed'
  image?: string
  imageCaption?: string
}

interface JourneyCardProps {
  journey: JourneyData
  onPress?: () => void
}

export const JourneyCard: React.FC<JourneyCardProps> = ({
  journey,
  onPress,
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return theme.colors.success
      case 'Ongoing':
        return theme.colors.info
      case 'Completed':
        return theme.colors.secondaryText
      default:
        return theme.colors.secondaryText
    }
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {journey.image ? (
          <Image source={{ uri: journey.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {journey.imageCaption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText}>{journey.imageCaption}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{journey.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{journey.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.metadata}>
            <Text style={styles.date}>{journey.date}</Text>
            <Text style={styles.steps}>{journey.steps} steps</Text>
          </View>
          
          {journey.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(journey.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(journey.status) }]}>
                {journey.status}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginRight: theme.spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceLight,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4B5563',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: theme.spacing.md,
  },
  captionText: {
    ...theme.typography.small,
    color: theme.colors.white,
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.userName,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.small,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  footer: {
    gap: theme.spacing.sm,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.tertiaryText,
  },
  steps: {
    ...theme.typography.caption,
    color: theme.colors.tertiaryText,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...theme.typography.label,
    fontWeight: '600',
  },
})