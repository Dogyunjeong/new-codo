import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { theme } from '../src/constants/theme'
import { PostService } from '../src/services/PostService'
import { useAuth } from '../src/contexts/AuthContext'

const EMOJI_OPTIONS = ['🎯', '💪', '📚', '🎨', '🏃', '🧘', '💼', '🎵', '✈️', '🌱', '💡', '🚀']
const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
]

export default function CreateJourneyScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const postService = PostService.getInstance()
  
  const [journeyTitle, setJourneyTitle] = useState('')
  const [journeyDescription, setJourneyDescription] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🎯')
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!journeyTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a journey title')
      return
    }

    setIsCreating(true)
    try {
      const goal = await postService.createJourney({
        title: journeyTitle,
        description: journeyDescription,
        isPrivate,
        emoji: selectedEmoji,
        color: selectedColor,
        progress: 0,
      })
      
      console.log('Journey created successfully:', goal.id)
      router.replace({ pathname: '/journey', params: { journeyId: goal.id } })
    } catch (error) {
      console.error('Failed to create journey:', error)
      Alert.alert('Error', 'Failed to create journey. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Journey</Text>
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.createButton, (!journeyTitle.trim() || isCreating) && styles.createButtonDisabled]}
            disabled={!journeyTitle.trim() || isCreating}
          >
            <Text style={[styles.createButtonText, (!journeyTitle.trim() || isCreating) && styles.createButtonTextDisabled]}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Journey Details</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your journey?"
              placeholderTextColor={theme.colors.textTertiary}
              value={journeyTitle}
              onChangeText={setJourneyTitle}
              maxLength={100}
            />
            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Describe your journey and milestones..."
                placeholderTextColor={theme.colors.textTertiary}
                value={journeyDescription}
                onChangeText={setJourneyDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {journeyDescription.length}/500
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose an Emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiOptionSelected]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose a Color</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setIsPrivate(false)}
            >
              <View style={styles.privacyIconContainer}>
                <Ionicons name="earth" size={20} color={!isPrivate ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyTitle}>Public Journey</Text>
                <Text style={styles.privacyDescription}>Anyone can see your progress</Text>
              </View>
              <View style={[styles.radioOuter, !isPrivate && styles.radioSelected]}>
                {!isPrivate && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.privacyOption}
              onPress={() => setIsPrivate(true)}
            >
              <View style={styles.privacyIconContainer}>
                <Ionicons name="lock-closed" size={20} color={isPrivate ? theme.colors.primary : theme.colors.textSecondary} />
              </View>
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyTitle}>Private Journey</Text>
                <Text style={styles.privacyDescription}>Only you can see this journey</Text>
              </View>
              <View style={[styles.radioOuter, isPrivate && styles.radioSelected]}>
                {isPrivate && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={[styles.previewCard, { borderColor: selectedColor }]}>
              <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
              <Text style={styles.previewJourneyTitle}>{journeyTitle || 'Your Journey Title'}</Text>
              {journeyDescription && (
                <Text style={styles.previewDescription} numberOfLines={2}>
                  {journeyDescription}
                </Text>
              )}
              <View style={styles.previewProgressContainer}>
                <View style={styles.previewProgressBar}>
                  <View style={[styles.previewProgressFill, { backgroundColor: selectedColor, width: '0%' }]} />
                </View>
                <Text style={styles.previewProgressText}>0%</Text>
              </View>
              {isPrivate && (
                <View style={styles.previewPrivateBadge}>
                  <Ionicons name="lock-closed" size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.previewPrivateText}>Private</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  createButtonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },
  createButtonTextDisabled: {
    color: theme.colors.secondaryText,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  titleInput: {
    fontSize: 16,
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  descriptionInput: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  emojiOption: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  emojiText: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  privacyDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  preview: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  previewCard: {
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 2,
  },
  previewEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  previewJourneyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  previewProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  previewProgressFill: {
    height: '100%',
  },
  previewProgressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  previewPrivateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  previewPrivateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bottomSpacer: {
    height: 50,
  },
})
