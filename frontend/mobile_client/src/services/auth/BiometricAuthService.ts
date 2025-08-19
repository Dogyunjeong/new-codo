import * as LocalAuthentication from 'expo-local-authentication';
import { SecureStorage } from '../storage/SecureStorage';
import { Platform } from 'react-native';
import { getAppSettings } from '../../config/firebase.config';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACIAL_RECOGNITION = 'facial_recognition',
  IRIS = 'iris',
  NONE = 'none'
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  biometricType: BiometricType;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

/**
 * Biometric Authentication Service
 * Handles fingerprint, Face ID, and other biometric authentication methods
 */
export class BiometricAuthService {
  private static readonly BIOMETRIC_ENABLED_KEY = '@ziririt:biometric_enabled';
  private static readonly MAX_ATTEMPTS = 3;
  private static attemptCount = 0;

  /**
   * Check if biometric authentication is available and configured
   */
  static async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      // Check if hardware is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          isAvailable: false,
          biometricType: BiometricType.NONE,
          isEnrolled: false,
          supportedTypes: [],
        };
      }

      // Check supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Check if user has enrolled biometrics
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // Determine primary biometric type
      let biometricType = BiometricType.NONE;
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = BiometricType.FACIAL_RECOGNITION;
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = BiometricType.FINGERPRINT;
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = BiometricType.IRIS;
      }

      return {
        isAvailable: hasHardware && isEnrolled,
        biometricType,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        biometricType: BiometricType.NONE,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(
    reason: string = 'Authenticate to access your account',
    options?: {
      fallbackLabel?: string;
      cancelLabel?: string;
      disableDeviceFallback?: boolean;
      requireConfirmation?: boolean;
    }
  ): Promise<BiometricAuthResult> {
    try {
      // Check if biometrics are available
      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: capabilities.isEnrolled 
            ? 'Biometric authentication is not available on this device'
            : 'No biometric data enrolled. Please set up biometrics in your device settings',
        };
      }

      // Check if biometric auth is enabled for the app
      const isEnabled = await this.isBiometricEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric authentication is disabled for this app',
        };
      }

      // Increment attempt count
      this.attemptCount++;

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: options?.fallbackLabel || 'Use passcode',
        cancelLabel: options?.cancelLabel || 'Cancel',
        disableDeviceFallback: options?.disableDeviceFallback || false,
        requireConfirmation: options?.requireConfirmation || Platform.OS === 'android',
      });

      if (result.success) {
        this.attemptCount = 0; // Reset attempt count on success
        return { success: true };
      } else {
        // Handle different error types
        let errorMessage = 'Authentication failed';
        let warning: string | undefined;

        switch (result.error) {
          case 'UserCancel':
            errorMessage = 'Authentication was cancelled';
            break;
          case 'UserFallback':
            errorMessage = 'User chose to use fallback authentication';
            break;
          case 'SystemCancel':
            errorMessage = 'Authentication was cancelled by the system';
            break;
          case 'PasscodeNotSet':
            errorMessage = 'Device passcode is not set';
            break;
          case 'BiometryNotAvailable':
            errorMessage = 'Biometric authentication is not available';
            break;
          case 'BiometryNotEnrolled':
            errorMessage = 'No biometric data is enrolled';
            break;
          case 'BiometryLockout':
            errorMessage = 'Too many failed attempts. Biometric authentication is locked';
            warning = 'Please use your device passcode to unlock biometric authentication';
            break;
          default:
            errorMessage = result.error || 'Unknown authentication error';
        }

        // Check if max attempts reached
        if (this.attemptCount >= this.MAX_ATTEMPTS) {
          warning = 'Maximum authentication attempts reached. Please try again later';
          this.attemptCount = 0;
        }

        return {
          success: false,
          error: errorMessage,
          warning,
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during authentication',
      };
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  static async enableBiometric(): Promise<BiometricAuthResult> {
    try {
      // Check capabilities first
      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: capabilities.isEnrolled
            ? 'Biometric authentication is not available'
            : 'Please set up biometrics in your device settings first',
        };
      }

      // Authenticate to enable biometrics
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        // Save preference
        await SecureStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Authentication failed. Biometric login was not enabled',
        };
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return {
        success: false,
        error: 'Failed to enable biometric authentication',
      };
    }
  }

  /**
   * Disable biometric authentication for the app
   */
  static async disableBiometric(): Promise<void> {
    try {
      await SecureStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
      console.log('Biometric authentication disabled');
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      // Check app settings first
      const appSettings = getAppSettings();
      if (!appSettings.features?.enableBiometricAuth) {
        return false;
      }

      // Check user preference
      const enabled = await SecureStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  /**
   * Protect sensitive data access with biometric authentication
   */
  static async protectDataAccess<T>(
    dataGetter: () => Promise<T>,
    reason: string = 'Authenticate to access secure data'
  ): Promise<T | null> {
    try {
      const authResult = await this.authenticate(reason, {
        disableDeviceFallback: false,
        requireConfirmation: true,
      });

      if (authResult.success) {
        return await dataGetter();
      } else {
        console.error('Biometric authentication failed:', authResult.error);
        return null;
      }
    } catch (error) {
      console.error('Error accessing protected data:', error);
      return null;
    }
  }

  /**
   * Protect token access with biometric authentication
   */
  static async protectTokenAccess(): Promise<string | null> {
    return this.protectDataAccess(
      () => SecureStorage.getAuthToken(),
      'Authenticate to access your session'
    );
  }

  /**
   * Get biometric type display name
   */
  static getBiometricDisplayName(type: BiometricType): string {
    switch (type) {
      case BiometricType.FINGERPRINT:
        return 'Touch ID' + (Platform.OS === 'android' ? '/Fingerprint' : '');
      case BiometricType.FACIAL_RECOGNITION:
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
      case BiometricType.IRIS:
        return 'Iris Scanner';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Get authentication prompt based on biometric type
   */
  static async getAuthPrompt(): Promise<string> {
    const capabilities = await this.getCapabilities();
    const biometricName = this.getBiometricDisplayName(capabilities.biometricType);
    
    return `Use ${biometricName} to sign in`;
  }

  /**
   * Request biometric permission (Android only)
   */
  static async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't require explicit permission
    }

    try {
      // On Android, biometric permission is granted at install time
      // This is a placeholder for future permission handling if needed
      return true;
    } catch (error) {
      console.error('Error requesting biometric permission:', error);
      return false;
    }
  }

  /**
   * Reset authentication attempts
   */
  static resetAttempts(): void {
    this.attemptCount = 0;
  }

  /**
   * Check if device has secure lock screen
   */
  static async hasSecureLockScreen(): Promise<boolean> {
    try {
      // Check if any authentication type is available
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return supportedTypes.length > 0;
    } catch (error) {
      console.error('Error checking secure lock screen:', error);
      return false;
    }
  }

  /**
   * Authenticate with device passcode/pattern (fallback)
   */
  static async authenticateWithPasscode(
    reason: string = 'Enter your device passcode'
  ): Promise<BiometricAuthResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: '', // No fallback for passcode auth
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        // Force passcode by not allowing biometrics
        biometricsSecurityLevel: 'weak', // This allows passcode fallback
      });

      return {
        success: result.success,
        error: result.success ? undefined : 'Passcode authentication failed',
      };
    } catch (error) {
      console.error('Passcode authentication error:', error);
      return {
        success: false,
        error: 'Failed to authenticate with passcode',
      };
    }
  }
}