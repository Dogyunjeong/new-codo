import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { theme } from '../../constants/theme'

interface CreateStepHeaderProps {
  onClose: () => void
  onShare: () => void
  shareEnabled?: boolean
}

export const CreateStepHeader: React.FC<CreateStepHeaderProps> = ({
  onClose,
  onShare,
  shareEnabled = false,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={theme.colors.primaryText} />
        </TouchableOpacity>
        
        <Text style={styles.title}>New Journey Step</Text>
        
        <TouchableOpacity 
          style={[styles.shareButton, !shareEnabled && styles.shareButtonDisabled]} 
          onPress={onShare}
          disabled={!shareEnabled}
          activeOpacity={0.7}
        >
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
    zIndex: 10,
  },
  title: {
    ...theme.typography.sectionTitle,
    color: theme.colors.primaryText,
    fontWeight: '600',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    zIndex: 10,
  },
  shareButtonDisabled: {
    backgroundColor: theme.colors.secondaryText,
    opacity: 0.5,
  },
  shareButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontWeight: '600',
  },
})