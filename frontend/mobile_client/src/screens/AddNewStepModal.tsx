import React, { useState } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native'
import { CreateStepHeader } from '../components/create/CreateStepHeader'
import { JourneySelector } from '../components/create/JourneySelector'
import { StepContentInput } from '../components/create/StepContentInput'
import { MediaToolbar } from '../components/create/MediaToolbar'
import { MomentSelector, MomentType } from '../components/create/MomentSelector'
import { InspirationSection } from '../components/create/InspirationSection'
import { ReminderNote } from '../components/create/ReminderNote'
import { theme } from '../constants/theme'

interface AddNewStepModalProps {
  visible: boolean
  onClose: () => void
  onShare: (data: any) => void
}

export const AddNewStepModal: React.FC<AddNewStepModalProps> = ({
  visible,
  onClose,
  onShare,
}) => {
  const [content, setContent] = useState('')
  const [selectedMoment, setSelectedMoment] = useState<MomentType>(null)
  const [selectedJourney, setSelectedJourney] = useState({
    title: "Your Hero's Journey",
    subtitle: 'Personal growth journey',
    avatar: 'https://i.pravatar.cc/150?img=5',
  })

  const handleClose = () => {
    // Reset state when closing
    setContent('')
    setSelectedMoment(null)
    onClose()
  }

  const handleShare = () => {
    if (content.trim()) {
      onShare({
        content,
        moment: selectedMoment,
        journey: selectedJourney,
      })
      setContent('')
      setSelectedMoment(null)
    }
  }

  const handleSelectJourney = () => {
    console.log('Select journey')
  }

  const handleCamera = () => {
    console.log('Open camera')
  }

  const handleVideo = () => {
    console.log('Open video')
  }

  const handleLink = () => {
    console.log('Add link')
  }

  const handleGallery = () => {
    console.log('Open gallery')
  }

  const handleAddInspiration = () => {
    console.log('Add inspiration')
  }

  const isShareEnabled = content.trim().length > 0

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <CreateStepHeader
            onClose={handleClose}
            onShare={handleShare}
            shareEnabled={isShareEnabled}
          />
          
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <JourneySelector
              journeyTitle={selectedJourney.title}
              journeySubtitle={selectedJourney.subtitle}
              journeyAvatar={selectedJourney.avatar}
              onPress={handleSelectJourney}
            />
            
            <StepContentInput
              value={content}
              onChangeText={setContent}
              placeholder="What step would you add?"
            />
            
            <MediaToolbar
              onCamera={handleCamera}
              onVideo={handleVideo}
              onLink={handleLink}
              onGallery={handleGallery}
            />
            
            <MomentSelector
              selectedMoment={selectedMoment}
              onSelectMoment={setSelectedMoment}
            />
            
            <InspirationSection
              onAddInspiration={handleAddInspiration}
            />
            
            <ReminderNote />
            
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 50,
  },
})