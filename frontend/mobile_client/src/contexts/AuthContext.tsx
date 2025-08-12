import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SecureStorage } from '../services/storage/SecureStorage'
import { AuthService } from '../services/AuthService'

interface User {
  id: string
  email: string
  name: string
  username?: string
  avatar?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
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
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const authService = new AuthService()

  // Initialize auth state on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const token = await SecureStorage.getAuthToken()
      const userData = await SecureStorage.getUserData()
      
      if (token && userData) {
        // Verify token is still valid
        authService.setAccessToken(token)
        const isValid = await authService.verifyToken()
        
        if (isValid) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          // Token might be expired, try to refresh
          await refreshSession()
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // Call auth service
      const response = await authService.login({ email, password })
      
      // Store tokens and user data
      await SecureStorage.setAuthToken(response.token)
      if (response.refreshToken) {
        await SecureStorage.setRefreshToken(response.refreshToken)
      }
      await SecureStorage.setUserData(response.user)
      
      // Set token for future requests
      authService.setAccessToken(response.token)
      
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Failed to login')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      
      // Call auth service
      const response = await authService.signup({ email, password, name })
      
      // Store tokens and user data
      await SecureStorage.setAuthToken(response.token)
      if (response.refreshToken) {
        await SecureStorage.setRefreshToken(response.refreshToken)
      }
      await SecureStorage.setUserData(response.user)
      
      // Set token for future requests
      authService.setAccessToken(response.token)
      
      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      
      // Call logout endpoint if needed
      const refreshToken = await SecureStorage.getRefreshToken()
      if (refreshToken) {
        try {
          await authService.logout(refreshToken)
        } catch (error) {
          // Continue with local logout even if server logout fails
          console.error('Server logout error:', error)
        }
      }
      
      // Clear local storage
      await SecureStorage.clearAll()
      
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const refreshToken = await SecureStorage.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await authService.refreshToken(refreshToken)
      
      // Update stored tokens
      await SecureStorage.setAuthToken(response.token)
      if (response.refreshToken) {
        await SecureStorage.setRefreshToken(response.refreshToken)
      }
      
      // Set new token for future requests
      authService.setAccessToken(response.token)
      
      if (response.user) {
        await SecureStorage.setUserData(response.user)
        setUser(response.user)
      }
      
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Session refresh error:', error)
      // If refresh fails, logout the user
      await logout()
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshSession,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}