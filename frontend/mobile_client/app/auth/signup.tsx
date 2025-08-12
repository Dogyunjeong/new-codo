import React from 'react'
import { useRouter } from 'expo-router'
import { SignupScreen } from '../../src/screens/auth/SignupScreen'
import { useAuth } from '../../src/contexts/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuth()

  const handleSignup = async (email: string, password: string, name: string) => {
    await signup(email, password, name)
    // Navigation is handled by the auth context
  }

  const handleLogin = () => {
    router.replace('/auth/login')
  }

  return (
    <SignupScreen
      onSignup={handleSignup}
      onLogin={handleLogin}
    />
  )
}