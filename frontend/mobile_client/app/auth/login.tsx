import React from 'react'
import { useRouter } from 'expo-router'
import { LoginScreen } from '../../src/screens/auth/LoginScreen'
import { useAuth } from '../../src/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle, signInWithApple } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    await signInWithEmail(email, password)
    // Navigation is handled by the auth context
  }

  const handleGoogleLogin = async () => {
    try {
      // Directly use the native Google Sign-In
      await signInWithGoogle()
      // Navigation is handled by the auth context
    } catch (error) {
      // Error is handled by LoginScreen
      throw error
    }
  }

  const handleAppleLogin = async () => {
    await signInWithApple()
    // Navigation is handled by the auth context
  }

  const handleSignup = () => {
    router.push('/auth/signup')
  }

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password')
  }

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSignup={handleSignup}
      onForgotPassword={handleForgotPassword}
      onGoogleLogin={handleGoogleLogin}
      onAppleLogin={handleAppleLogin}
    />
  )
}