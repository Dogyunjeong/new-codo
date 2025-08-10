import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

export const ReminderNote: React.FC = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="bulb-outline" size={16} color={theme.colors.secondaryText} />
      <Text style={styles.text}>
        Remember: Every hero faces ups and downs. Your authentic sharing - victories and struggles alike - lights the path for others on their journey.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  text: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    lineHeight: 18,
    flex: 1,
  },
})