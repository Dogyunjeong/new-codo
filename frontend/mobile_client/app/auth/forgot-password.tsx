import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { theme } from '../../src/constants/theme'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    Alert.alert(
      'Reset Email Sent',
      `Password reset instructions have been sent to ${email}`,
      [{ text: 'OK', onPress: () => router.back() }]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.tertiaryText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.title,
    fontSize: 28,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: 16,
    color: theme.colors.primaryText,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.xl,
  },
  button: {
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})