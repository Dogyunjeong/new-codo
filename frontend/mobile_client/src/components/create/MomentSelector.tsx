import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { theme } from '../../constants/theme'

export type MomentType = 'up' | 'down' | null

interface MomentSelectorProps {
  selectedMoment: MomentType
  onSelectMoment: (moment: MomentType) => void
}

export const MomentSelector: React.FC<MomentSelectorProps> = ({
  selectedMoment,
  onSelectMoment,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling about this step?</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, selectedMoment === 'up' && styles.selectedOption]}
          onPress={() => onSelectMoment('up')}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>😊</Text>
          <Text style={styles.optionTitle}>Up Moment</Text>
          <Text style={styles.optionDescription}>Victory & Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.option, selectedMoment === 'down' && styles.selectedOption]}
          onPress={() => onSelectMoment('down')}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>😔</Text>
          <Text style={styles.optionTitle}>Down Moment</Text>
          <Text style={styles.optionDescription}>Challenge & Setback</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    fontWeight: '500',
    marginBottom: theme.spacing.lg,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  option: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  emoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  optionTitle: {
    ...theme.typography.button,
    color: theme.colors.primaryText,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
})