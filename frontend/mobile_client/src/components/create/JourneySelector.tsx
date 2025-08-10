import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface JourneySelectorProps {
  journeyTitle: string
  journeySubtitle: string
  journeyAvatar?: string
  onPress: () => void
}

export const JourneySelector: React.FC<JourneySelectorProps> = ({
  journeyTitle,
  journeySubtitle,
  journeyAvatar,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {journeyAvatar ? (
          <Image source={{ uri: journeyAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color={theme.colors.white} />
          </View>
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>{journeyTitle}</Text>
        <Text style={styles.subtitle}>{journeySubtitle}</Text>
      </View>
      
      <Ionicons name="chevron-down" size={20} color={theme.colors.secondaryText} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.primaryText,
    fontWeight: '500',
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginTop: 2,
  },
})