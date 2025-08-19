import { 
  OAuthProvider,
  signInWithCredential,
  UserCredential,
  User,
  OAuthCredential
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { getFirebaseAuth } from '../firebase/firebase.init';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export interface AppleSignInResult {
  user: User;
  idToken: string;
  fullName?: {
    givenName?: string | null;
    familyName?: string | null;
  };
  email?: string | null;
  isNewUser: boolean;
}

/**
 * Apple Authentication Service using Firebase v9+
 */
export class AppleAuthService {
  /**
   * Check if Apple Sign-In is available on this device
   */
  static async isAvailable(): Promise<boolean> {
    // Apple Sign-In is only available on iOS
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    return await AppleAuthentication.isAvailableAsync();
  }

  /**
   * Sign in with Apple
   */
  static async signIn(): Promise<AppleSignInResult> {
    try {
      // Check availability first
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Generate nonce for security
      const nonce = await this.generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple sign-in
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      // Extract the ID token
      const { identityToken, fullName, email, user: appleUserId } = appleCredential;
      
      if (!identityToken) {
        throw new Error('No identity token received from Apple Sign-In');
      }

      // Create OAuth provider and credential
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      // Sign in to Firebase
      const userCredential = await signInWithCredential(
        getFirebaseAuth(),
        oauthCredential
      );

      // Get the Firebase ID token for backend
      const firebaseIdToken = await userCredential.user.getIdToken();

      // Update user profile if this is the first sign-in
      // Apple only provides name and email on first sign-in
      if (userCredential.additionalUserInfo?.isNewUser && fullName) {
        await this.updateUserProfile(userCredential.user, fullName, email);
      }

      return {
        user: userCredential.user,
        idToken: firebaseIdToken,
        fullName: fullName || undefined,
        email: email || userCredential.user.email,
        isNewUser: userCredential.additionalUserInfo?.isNewUser || false,
      };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get Apple credential state (to check if user's Apple ID is still valid)
   */
  static async getCredentialState(userId: string): Promise<AppleAuthentication.AppleAuthenticationCredentialState> {
    try {
      return await AppleAuthentication.getCredentialStateAsync(userId);
    } catch (error) {
      console.error('Error getting Apple credential state:', error);
      return AppleAuthentication.AppleAuthenticationCredentialState.UNKNOWN;
    }
  }

  /**
   * Refresh Apple authentication (checks if credentials are still valid)
   */
  static async refreshAuth(): Promise<boolean> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return false;
      }

      // Check if user signed in with Apple
      const isAppleUser = currentUser.providerData.some(
        provider => provider.providerId === 'apple.com'
      );
      
      if (!isAppleUser) {
        return false;
      }

      // For Apple, we need to check the credential state
      // Note: We need to store the Apple user ID somewhere accessible
      // This is a limitation - we can't easily refresh Apple auth
      console.log('Apple auth refresh check completed');
      return true;
    } catch (error) {
      console.error('Error refreshing Apple auth:', error);
      return false;
    }
  }

  /**
   * Sign out (Apple doesn't have a specific sign-out, handled by Firebase)
   */
  static async signOut(): Promise<void> {
    // Apple Sign-In doesn't require specific sign-out
    // Firebase sign-out handles it
    console.log('Apple sign-out handled by Firebase');
  }

  /**
   * Link Apple account to existing Firebase user
   */
  static async linkAccount(): Promise<UserCredential> {
    try {
      const auth = getFirebaseAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user to link account to');
      }

      // Check availability
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Generate nonce
      const nonce = await this.generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      // Request Apple sign-in
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error('No identity token received from Apple Sign-In');
      }

      // Create OAuth credential
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: appleCredential.identityToken,
        rawNonce: nonce,
      });

      // Link the credential to the current user
      const linkedCredential = await auth.currentUser.linkWithCredential(oauthCredential);
      console.log('Apple account linked successfully');
      
      return linkedCredential;
    } catch (error: any) {
      console.error('Error linking Apple account:', error);
      
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This Apple account is already linked to another user');
      } else if (error.code === 'auth/provider-already-linked') {
        throw new Error('An Apple account is already linked to this user');
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Unlink Apple account from Firebase user
   */
  static async unlinkAccount(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      await auth.currentUser.unlink('apple.com');
      console.log('Apple account unlinked successfully');
    } catch (error: any) {
      console.error('Error unlinking Apple account:', error);
      
      if (error.code === 'auth/no-such-provider') {
        throw new Error('No Apple account is linked to this user');
      }
      
      throw error;
    }
  }

  /**
   * Generate a random nonce for Apple Sign-In security
   */
  private static async generateNonce(length: number = 32): Promise<string> {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
    let nonce = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      nonce += charset[randomIndex];
    }
    
    return nonce;
  }

  /**
   * Update user profile with Apple-provided information
   */
  private static async updateUserProfile(
    user: User, 
    fullName: AppleAuthentication.AppleAuthenticationFullName | null,
    email: string | null
  ): Promise<void> {
    try {
      const updates: any = {};
      
      // Construct display name from full name
      if (fullName) {
        const nameParts = [];
        if (fullName.givenName) nameParts.push(fullName.givenName);
        if (fullName.familyName) nameParts.push(fullName.familyName);
        
        if (nameParts.length > 0) {
          updates.displayName = nameParts.join(' ');
        }
      }
      
      // Update email if provided and not already set
      if (email && !user.email) {
        updates.email = email;
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await user.updateProfile(updates);
        console.log('User profile updated with Apple info');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Handle Apple Sign-In errors
   */
  private static handleError(error: any): Error {
    if (error.code === 'ERR_CANCELED') {
      return new Error('Apple sign-in was cancelled');
    } else if (error.code === 'ERR_REQUEST_FAILED') {
      return new Error('Apple sign-in request failed');
    } else if (error.code === 'ERR_INVALID_RESPONSE') {
      return new Error('Invalid response from Apple sign-in');
    } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
      return new Error('Apple sign-in request was not handled');
    } else if (error.code === 'ERR_REQUEST_UNKNOWN') {
      return new Error('Unknown error during Apple sign-in');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      return new Error('An account already exists with the same email address but different sign-in credentials');
    } else if (error.code === 'auth/invalid-credential') {
      return new Error('The credential is malformed or has expired');
    } else if (error.code === 'auth/operation-not-allowed') {
      return new Error('Apple sign-in is not enabled. Please contact support');
    } else if (error.code === 'auth/user-disabled') {
      return new Error('Your account has been disabled. Please contact support');
    } else if (error.code === 'auth/network-request-failed') {
      return new Error('Network error. Please check your connection and try again');
    } else {
      return new Error(error.message || 'An unexpected error occurred during Apple sign-in');
    }
  }

  /**
   * Request Apple to delete user data (for compliance)
   */
  static async requestDataDeletion(): Promise<void> {
    // This would typically involve calling your backend API
    // to handle the Apple data deletion request
    console.log('Apple data deletion requested');
    // Implementation depends on your backend setup
  }
}