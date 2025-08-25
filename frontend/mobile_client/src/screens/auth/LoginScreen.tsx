import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'
import { theme } from '../../constants/theme'
import { getAppSettings } from '../../config/firebase.config'
import { MockAuthService } from '../../services/auth/MockAuthService'

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>
  onSignup: () => void
  onForgotPassword: () => void
  onGoogleLogin?: () => Promise<void>
  onAppleLogin?: () => Promise<void>
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSignup,
  onForgotPassword,
  onGoogleLogin,
  onAppleLogin,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [showMockUserModal, setShowMockUserModal] = useState(false)
  const [isMockLoading, setIsMockLoading] = useState(false)
  
  // Check if mock auth is enabled
  const isMockAuthEnabled = __DEV__ && getAppSettings().mockAuthEnabled

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await onLogin(email, password)
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Please check your credentials and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!onGoogleLogin) {
      Alert.alert('Error', 'Google Sign-In is not configured')
      return
    }
    
    setIsGoogleLoading(true)
    try {
      await onGoogleLogin()
    } catch (error: any) {
      Alert.alert(
        'Google Sign-In Failed',
        error.message || 'An error occurred during Google sign-in'
      )
    } finally {
      setIsGoogleLoading(false)
    }
  }
  
  const handleAppleLogin = async () => {
    if (onAppleLogin) {
      setIsAppleLoading(true)
      try {
        await onAppleLogin()
      } catch (error: any) {
        Alert.alert(
          'Apple Sign-In Failed',
          error.message || 'An error occurred during Apple sign-in'
        )
      } finally {
        setIsAppleLoading(false)
      }
    } else {
      Alert.alert('Coming Soon', 'Apple login will be available soon')
    }
  }
  
  const handleFacebookLogin = () => {
    Alert.alert('Coming Soon', 'Facebook login will be available soon')
  }
  
  const handleMockLogin = async (mockUserEmail: string) => {
    setIsMockLoading(true)
    setShowMockUserModal(false)
    try {
      // Use the default mock password
      await onLogin(mockUserEmail, MockAuthService.DEFAULT_PASSWORD)
    } catch (error: any) {
      Alert.alert(
        'Mock Login Failed',
        error.message || 'An error occurred during mock login'
      )
    } finally {
      setIsMockLoading(false)
    }
  }
  
  const renderMockUserModal = () => (
    <Modal
      visible={showMockUserModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMockUserModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Test User</Text>
            <TouchableOpacity
              onPress={() => setShowMockUserModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.primaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>Choose a test account to sign in:</Text>
            
            {MockAuthService.TEST_USERS.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.mockUserCard}
                onPress={() => handleMockLogin(user.email)}
              >
                <View style={styles.mockUserInfo}>
                  <Text style={styles.mockUserName}>{user.displayName}</Text>
                  <Text style={styles.mockUserEmail}>{user.email}</Text>
                  <Text style={styles.mockUserBio} numberOfLines={2}>{user.bio}</Text>
                  <View style={styles.mockUserStats}>
                    <Text style={styles.mockUserStat}>✅ {user.isVerified ? 'Verified' : 'Unverified'}</Text>
                    <Text style={styles.mockUserStat}>📚 {user.journeyCount} Journeys</Text>
                    <Text style={styles.mockUserStat}>👥 {user.followerCount} Followers</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>HeroJourney</Text>
            <Text style={styles.tagline}>Every step matters</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor={theme.colors.tertiaryText}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setErrors({ ...errors, email: undefined })
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.tertiaryText}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    setErrors({ ...errors, password: undefined })
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={theme.colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <GoogleSigninButton
                style={styles.googleButton}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
              />
              
              <View style={styles.otherSocialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, (isAppleLoading || isLoading) && styles.socialButtonDisabled]}
                  onPress={handleAppleLogin}
                  disabled={isAppleLoading || isLoading}
                >
                  {isAppleLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primaryText} />
                  ) : (
                    <Ionicons name="logo-apple" size={24} color={theme.colors.primaryText} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialButton, isLoading && styles.socialButtonDisabled]}
                  onPress={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-facebook" size={24} color={theme.colors.primaryText} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Mock Login Button for Development */}
            {isMockAuthEnabled && (
              <View style={styles.mockSection}>
                <View style={styles.mockDivider}>
                  <Text style={styles.mockBadge}>🧪 DEV MODE</Text>
                </View>
                <TouchableOpacity
                  style={[styles.mockButton, (isMockLoading || isLoading) && styles.mockButtonDisabled]}
                  onPress={() => setShowMockUserModal(true)}
                  disabled={isMockLoading || isLoading}
                >
                  {isMockLoading ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <>
                      <Ionicons name="bug-outline" size={20} color={theme.colors.white} />
                      <Text style={styles.mockButtonText}>Test Login (Mock Mode)</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.mockHint}>Sign in with a test account - No Firebase required!</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onSignup}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Mock User Selection Modal */}
      {renderMockUserModal()}
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl * 2,
  },
  logo: {
    ...theme.typography.logo,
    fontSize: 36,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
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
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: 15,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  loginButton: {
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginHorizontal: theme.spacing.lg,
  },
  socialButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  googleButton: {
    width: 260,
    height: 48,
    alignSelf: 'center',
  },
  otherSocialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
  },
  signupLink: {
    ...theme.typography.button,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  mockSection: {
    marginTop: theme.spacing.xl,
  },
  mockDivider: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  mockBadge: {
    ...theme.typography.caption,
    color: theme.colors.warning || '#FFA500',
    backgroundColor: theme.colors.warningBackground || '#FFF3CD',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    fontWeight: '600',
  },
  mockButton: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: theme.colors.warning || '#FFA500',
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  mockButtonDisabled: {
    opacity: 0.6,
  },
  mockButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  mockHint: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.primaryText,
  },
  modalCloseButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.lg,
  },
  mockUserCard: {
    backgroundColor: theme.colors.surface || '#F5F5F5',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mockUserInfo: {
    flex: 1,
  },
  mockUserName: {
    ...theme.typography.h4,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.xs,
  },
  mockUserEmail: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  mockUserBio: {
    ...theme.typography.caption,
    color: theme.colors.secondaryText,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  mockUserStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  mockUserStat: {
    ...theme.typography.caption,
    color: theme.colors.tertiaryText,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
})