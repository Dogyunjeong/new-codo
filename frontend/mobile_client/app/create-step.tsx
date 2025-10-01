import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { theme } from '../src/constants/theme'
import { PostService } from '../src/services/PostService'
import { Journey } from '../src/services/post/types'
import { useAuth } from '../src/contexts/AuthContext'


export default function CreateStepScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { user } = useAuth()
  const postService = PostService.getInstance()
  const [availableJourneys, setAvailableJourneys] = useState<Journey[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string>('')
  const [stepTitle, setStepTitle] = useState('')
  const [stepDescription, setStepDescription] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    loadGoals()
  }, [])

  // Reload journeys when screen gains focus (e.g., after creating a new journey)
  useFocusEffect(
    useCallback(() => {
      loadGoals()
    }, [])
  )

  // Preselect goal if passed from journey page
  useEffect(() => {
    const passedGoalId = (params.goalId as string) || (params.journeyId as string)
    if (passedGoalId) {
      setSelectedGoal(passedGoalId)
    }
  }, [params.goalId, params.journeyId])

  const loadGoals = async () => {
    try {
      console.log('Loading journeys for user:', user?.userId, user?.email)
      const goals = await (postService.getUserJourneys?.() || postService.getUserGoals?.())
      console.log('Loaded journeys:', goals)
      
      // Add default emoji and color if not present
      const journeysWithDefaults = goals.map(goal => ({
        ...goal,
        emoji: goal.emoji || '🎯',
        color: goal.color || '#3B82F6',
        progress: goal.progress || 0
      }))
      
      setAvailableJourneys(journeysWithDefaults)
    } catch (error) {
      console.error('Failed to load journeys:', error)
    }
  }

  const handlePost = async () => {
    if (!selectedGoal || !stepTitle) return
    
    setIsPosting(true)
    try {
      console.log('Creating post with title:', stepTitle)
      const post = await postService.createPost({
        journeyId: selectedGoal,
        title: stepTitle,
        content: stepDescription,
      })
      console.log('Post created successfully:', post.id)
      
      // Brief delay to ensure state updates propagate
      setTimeout(() => {
        router.back()
      }, 100)
    } catch (error) {
      console.error('Failed to create post:', error)
      Alert.alert('Error', 'Failed to create post. Please try again.')
    } finally {
      setIsPosting(false)
    }
  }

  const handleAddImage = () => {
    console.log('Add image')
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
          <Text style={styles.headerTitle}>Add New Step</Text>
          <TouchableOpacity
            onPress={handlePost}
            style={[styles.postButton, (!selectedGoal || !stepTitle || isPosting) && styles.postButtonDisabled]}
            disabled={!selectedGoal || !stepTitle || isPosting}
          >
            <Text style={[styles.postButtonText, (!selectedGoal || !stepTitle || isPosting) && styles.postButtonTextDisabled]}>
              {isPosting ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Journey</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsScroll}>
              {availableJourneys.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    selectedGoal === goal.id && styles.goalCardSelected,
                    { borderColor: selectedGoal === goal.id ? goal.color : theme.colors.border }
                  ]}
                  onPress={() => setSelectedGoal(goal.id)}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={styles.goalName}>{goal.title}</Text>
                  <View style={styles.goalProgressContainer}>
                    <View style={styles.goalProgressBar}>
                      <View
                        style={[styles.goalProgressFill, { width: `${goal.progress}%`, backgroundColor: goal.color }]}
                      />
                    </View>
                    <Text style={styles.goalProgressText}>{goal.progress}%</Text>
                  </View>
                  {selectedGoal === goal.id && (
                    <View style={[styles.selectedBadge, { backgroundColor: goal.color }]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addGoalCard} onPress={() => router.push('/create-journey')}>
                <Ionicons name="add-circle-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.addGoalText}>Create Journey</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step Details</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What did you accomplish?"
              placeholderTextColor={theme.colors.textTertiary}
              value={stepTitle}
              onChangeText={setStepTitle}
              maxLength={100}
            />
            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Share more details about your progress..."
                placeholderTextColor={theme.colors.textTertiary}
                value={stepDescription}
                onChangeText={setStepDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {stepDescription.length}/500
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.addPhotoCard} onPress={handleAddImage}>
                <Ionicons name="camera" size={28} color={theme.colors.textSecondary} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageCard}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sharing Options</Text>
            <View style={styles.sharingOptions}>
              <TouchableOpacity style={styles.sharingOption}>
                <View style={styles.sharingIconContainer}>
                  <Ionicons name="earth" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.sharingTextContainer}>
                  <Text style={styles.sharingTitle}>Public</Text>
                  <Text style={styles.sharingDescription}>Anyone can see this step</Text>
                </View>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInner} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sharingOption}>
                <View style={styles.sharingIconContainer}>
                  <Ionicons name="people" size={20} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.sharingTextContainer}>
                  <Text style={styles.sharingTitle}>Followers Only</Text>
                  <Text style={styles.sharingDescription}>Only your followers can see</Text>
                </View>
                <View style={styles.radioOuter} />
              </TouchableOpacity>
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
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
  },
  postButtonDisabled: {
    backgroundColor: theme.colors.surfaceLight,
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.white,
  },
  postButtonTextDisabled: {
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
  goalsScroll: {
    paddingHorizontal: 16,
  },
  goalCard: {
    width: 140,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  goalCardSelected: {
    backgroundColor: theme.colors.surface,
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  goalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
  },
  goalProgressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalCard: {
    width: 140,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 8,
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
  addPhotoCard: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  imageCard: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  sharingOptions: {
    paddingHorizontal: 16,
  },
  sharingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sharingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sharingTextContainer: {
    flex: 1,
  },
  sharingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  sharingDescription: {
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
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  bottomSpacer: {
    height: 50,
  },
})
