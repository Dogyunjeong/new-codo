import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { theme } from '../../constants/theme'

interface PillProps {
  label: string
  active?: boolean
  onPress?: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  color?: string
  backgroundColor?: string
  size?: 'small' | 'medium'
}

export const Pill: React.FC<PillProps> = ({
  label,
  active = false,
  onPress,
  style,
  textStyle,
  color,
  backgroundColor,
  size = 'small',
}) => {
  const isSmall = size === 'small'
  
  const pillStyle = [
    styles.pill,
    isSmall ? styles.pillSmall : styles.pillMedium,
    active ? styles.pillActive : styles.pillInactive,
    backgroundColor && { backgroundColor },
    style,
  ]

  const labelStyle = [
    styles.label,
    isSmall ? styles.labelSmall : styles.labelMedium,
    active ? styles.labelActive : styles.labelInactive,
    color && { color },
    textStyle,
  ]

  if (onPress) {
    return (
      <TouchableOpacity
        style={pillStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={labelStyle}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity style={pillStyle} activeOpacity={1}>
      <Text style={labelStyle}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSmall: {
    height: 24,
  },
  pillMedium: {
    height: 28,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
  },
  pillInactive: {
    backgroundColor: theme.colors.surfaceLight,
  },
  label: {
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: 11,
  },
  labelMedium: {
    fontSize: 13,
  },
  labelActive: {
    color: theme.colors.white,
  },
  labelInactive: {
    color: theme.colors.secondaryText,
  },
})