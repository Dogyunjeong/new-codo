import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Pill } from '../common/Pill'
import { theme } from '../../constants/theme'

interface ProfileTagsProps {
  tags: string[]
  onTagPress?: (tag: string) => void
}

export const ProfileTags: React.FC<ProfileTagsProps> = ({
  tags,
  onTagPress,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tags.map((tag, index) => (
        <View key={index} style={index > 0 && styles.tagSpacing}>
          <Pill
            label={tag}
            size="medium"
            onPress={() => onTagPress?.(tag)}
          />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  tagSpacing: {
    marginLeft: theme.spacing.sm,
  },
})