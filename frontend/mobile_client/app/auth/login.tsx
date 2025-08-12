import React from 'react'
import { useRouter } from 'expo-router'
import { LoginScreen } from '../../src/screens/auth/LoginScreen'
import { useAuth } from '../../src/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
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
    />
  )
}