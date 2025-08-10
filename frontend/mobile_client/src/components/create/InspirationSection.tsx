import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface InspirationSectionProps {
  onAddInspiration: () => void
}

export const InspirationSection: React.FC<InspirationSectionProps> = ({
  onAddInspiration,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What inspired this step?</Text>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={onAddInspiration}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color={theme.colors.secondaryText} />
        <Text style={styles.addButtonText}>Add inspiring post or journey</Text>
      </TouchableOpacity>
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
    marginBottom: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
})