import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface MediaToolbarProps {
  onCamera?: () => void
  onVideo?: () => void
  onLink?: () => void
  onGallery?: () => void
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  onCamera,
  onVideo,
  onLink,
  onGallery,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onCamera} activeOpacity={0.7}>
        <Ionicons name="camera-outline" size={24} color={theme.colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onVideo} activeOpacity={0.7}>
        <Ionicons name="videocam-outline" size={24} color={theme.colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onLink} activeOpacity={0.7}>
        <Ionicons name="link-outline" size={24} color={theme.colors.secondaryText} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={onGallery} activeOpacity={0.7}>
        <Ionicons name="image-outline" size={24} color={theme.colors.secondaryText} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  button: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.lg,
  },
})