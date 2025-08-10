import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface AvatarProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  src?: string
  name?: string
  border?: boolean
  style?: any
}

const SIZES = {
  small: 24,
  medium: 32,
  large: 40,
  xlarge: 64,
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 'large',
  src,
  name,
  border = false,
  style,
}) => {
  const dimension = SIZES[size]
  
  const getInitials = (name: string) => {
    const parts = name.split(' ')
    return parts
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const containerStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
    },
    border && styles.border,
    style,
  ]

  if (src) {
    return (
      <View style={containerStyle}>
        <Image source={{ uri: src }} style={styles.image} />
      </View>
    )
  }

  if (name) {
    const fontSize = dimension * 0.4
    return (
      <View style={[containerStyle, styles.initialsContainer]}>
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      </View>
    )
  }

  return (
    <View style={[containerStyle, styles.iconContainer]}>
      <Ionicons name="person" size={dimension * 0.6} color={theme.colors.tertiaryText} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceLight,
  },
  border: {
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  initials: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})