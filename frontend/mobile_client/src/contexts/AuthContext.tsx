import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getFirebaseAuth } from '../services/firebase/firebase.init'
import { SecureStorage } from '../services/storage/SecureStorage'
import { AuthService, AuthUser, AuthProvider as AuthProviderType, AuthResponse } from '../services/AuthService'
import { BiometricAuthService } from '../services/auth/BiometricAuthService'
import { TokenManager } from '../services/auth/TokenManager'
import { AuthInterceptor } from '../services/api/AuthInterceptor'
import { getAppSettings } from '../config/firebase.config'
import { Alert } from 'react-native'

interface User extends AuthUser {
  username?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  firebaseUser: FirebaseUser | null
  // Email/Password auth
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  // OAuth auth
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  // Auth management
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  // Password management
  sendPasswordReset: (email: string) => Promise<void>
  sendEmailVerification: () => Promise<void>
  // Biometric auth
  enableBiometric: () => Promise<boolean>
  disableBiometric: () => Promise<void>
  isBiometricEnabled: () => Promise<boolean>
  authenticateWithBiometric: () => Promise<boolean>
  // Provider management
  linkProvider: (provider: AuthProviderType) => Promise<void>
  unlinkProvider: (provider: AuthProviderType) => Promise<void>
  getLinkedProviders: () => string[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Use refs to ensure singleton instances are created only once
  const authService = React.useRef(AuthService.getInstance()).current
  const tokenManager = React.useRef(TokenManager.getInstance()).current
  const authInterceptor = React.useRef(AuthInterceptor.getInstance()).current

  // Initialize auth state and Firebase listener
  useEffect(() => {
    initializeAuth()
    
    // Set up auth interceptor handlers
    authInterceptor.setHandlers({
      onAuthenticationRequired: () => {
        // Navigate to login screen
        setIsAuthenticated(false)
        setUser(null)
      },
      onTokenRefresh: async () => {
        // Token refreshed successfully
        console.log('Token refreshed via interceptor')
      },
    })

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), handleAuthStateChange)
    
    return () => {
      unsubscribe()
      authService.cleanup()
    }
  }, [])

  const initializeAuth = async () => {
    try {
      setIsLoading(true)
      
      const isMockMode = __DEV__ && getAppSettings().mockAuthEnabled
      
      // Check for stored tokens
      const token = await SecureStorage.getAuthToken()
      const userData = await SecureStorage.getUserData()
      
      if (token && userData) {
        // Set token for API calls
        authService.setAccessToken(token)
        
        // In mock mode, skip token verification
        if (isMockMode) {
          console.log('[MockAuth] Loading mock user from storage:', userData)
          setUser(userData as User)
          setIsAuthenticated(true)
          await tokenManager.initialize()
        } else {
          // Verify token validity
          const isValid = await authService.verifyToken()
          
          if (isValid) {
            setUser(userData as User)
            setIsAuthenticated(true)
            
            // Initialize token manager
            await tokenManager.initialize()
          } else {
            // Try to refresh
            try {
              await refreshSession()
            } catch (error) {
              console.error('Failed to refresh session:', error)
              await clearAuthData()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthStateChange = async (firebaseUser: FirebaseUser | null) => {
    // In mock mode, skip Firebase auth state changes
    const isMockMode = __DEV__ && getAppSettings().mockAuthEnabled
    
    if (isMockMode) {
      console.log('[MockAuth] Skipping Firebase auth state change')
      return
    }
    
    setFirebaseUser(firebaseUser)
    
    if (firebaseUser) {
      console.log('Firebase user signed in:', firebaseUser.email)
      // User data will be set by sign-in methods
    } else {
      console.log('Firebase user signed out')
      // Clear auth data if not already cleared
      if (isAuthenticated) {
        await clearAuthData()
      }
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Skip biometric in mock mode
      const isMockMode = __DEV__ && getAppSettings().mockAuthEnabled
      
      if (!isMockMode) {
        // Check if biometric is enabled and use it
        const biometricEnabled = await BiometricAuthService.isBiometricEnabled()
        if (biometricEnabled) {
          const biometricResult = await BiometricAuthService.authenticate(
            'Authenticate to sign in'
          )
          if (!biometricResult.success) {
            throw new Error(biometricResult.error || 'Biometric authentication failed')
          }
        }
      }
      
      // Sign in with Firebase or Mock
      const response = await authService.signInWithEmail(email, password)
      await handleAuthSuccess(response)
      
      // Show mock mode indicator
      if (isMockMode) {
        console.log('[MockAuth] Successfully signed in with mock user:', response.user.email)
      }
    } catch (error: any) {
      console.error('Email sign-in error:', error)
      throw new Error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setIsLoading(true)
      
      // Sign up with Firebase
      const response = await authService.signUpWithEmail({
        email,
        password,
        displayName,
      })
      
      await handleAuthSuccess(response)
      
      // Send verification email
      try {
        await authService.sendEmailVerification()
        Alert.alert(
          'Verify Your Email',
          'A verification email has been sent to your email address. Please verify to access all features.',
          [{ text: 'OK' }]
        )
      } catch (error) {
        console.error('Failed to send verification email:', error)
      }
    } catch (error: any) {
      console.error('Email sign-up error:', error)
      throw new Error(error.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true)
      
      // Sign in with Google using native module
      const response = await authService.signInWithGoogle()
      await handleAuthSuccess(response)
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      throw new Error(error.message || 'Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithApple = async () => {
    try {
      setIsLoading(true)
      const response = await authService.signInWithApple()
      await handleAuthSuccess(response)
    } catch (error: any) {
      console.error('Apple sign-in error:', error)
      throw new Error(error.message || 'Failed to sign in with Apple')
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      await authService.signOut()
      await clearAuthData()
    } catch (error) {
      console.error('Sign-out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = async (response: AuthResponse) => {
    // Store tokens and user data
    await SecureStorage.setAuthToken(response.token)
    if (response.refreshToken) {
      await SecureStorage.setRefreshToken(response.refreshToken)
    }
    
    const userData: User = {
      ...response.user,
      username: response.user.displayName?.toLowerCase().replace(/\s+/g, '_'),
    }
    
    await SecureStorage.setUserData(userData)
    
    // Set token for API calls
    authService.setAccessToken(response.token)
    
    // Initialize token manager
    await tokenManager.initialize()
    
    setUser(userData)
    setIsAuthenticated(true)
  }

  const clearAuthData = async () => {
    await SecureStorage.clearAll()
    setUser(null)
    setIsAuthenticated(false)
  }

  const refreshSession = async () => {
    try {
      const response = await authService.refreshToken()
      await handleAuthSuccess(response)
    } catch (error) {
      console.error('Session refresh error:', error)
      await clearAuthData()
      throw error
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      SecureStorage.setUserData(updatedUser)
    }
  }

  const sendPasswordReset = async (email: string) => {
    await authService.sendPasswordResetEmail(email)
  }

  const sendEmailVerification = async () => {
    await authService.sendEmailVerification()
  }

  const enableBiometric = async (): Promise<boolean> => {
    const result = await BiometricAuthService.enableBiometric()
    return result.success
  }

  const disableBiometric = async () => {
    await BiometricAuthService.disableBiometric()
  }

  const isBiometricEnabled = async (): Promise<boolean> => {
    return await BiometricAuthService.isBiometricEnabled()
  }

  const authenticateWithBiometric = async (): Promise<boolean> => {
    const result = await BiometricAuthService.authenticate()
    return result.success
  }

  const linkProvider = async (provider: AuthProviderType) => {
    await authService.linkProvider(provider)
  }

  const unlinkProvider = async (provider: AuthProviderType) => {
    await authService.unlinkProvider(provider)
  }

  const getLinkedProviders = (): string[] => {
    if (!firebaseUser) return []
    return firebaseUser.providerData.map(p => p.providerId)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        firebaseUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        refreshSession,
        updateUser,
        sendPasswordReset,
        sendEmailVerification,
        enableBiometric,
        disableBiometric,
        isBiometricEnabled,
        authenticateWithBiometric,
        linkProvider,
        unlinkProvider,
        getLinkedProviders,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}