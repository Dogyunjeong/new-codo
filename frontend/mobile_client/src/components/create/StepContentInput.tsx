import React, { useState } from 'react'
import { TextInput, StyleSheet, View } from 'react-native'
import { theme } from '../../constants/theme'

interface StepContentInputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

export const StepContentInput: React.FC<StepContentInputProps> = ({
  value,
  onChangeText,
  placeholder = 'What step would you add?',
}) => {
  const [height, setHeight] = useState(100)

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { height: Math.max(100, height) }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.tertiaryText}
        multiline
        textAlignVertical="top"
        onContentSizeChange={(event) => {
          setHeight(event.nativeEvent.contentSize.height)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  input: {
    ...theme.typography.title,
    color: theme.colors.primaryText,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 100,
  },
})