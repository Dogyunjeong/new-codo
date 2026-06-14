import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User } from 'firebase/auth';
import { GoogleAuthProvider, linkWithCredential, unlink } from 'firebase/auth';
import { getFirebaseAuth } from '../firebase/firebase.init';

/**
 * Google Authentication Service
 * Handles Google Sign-In operations and account linking
 */
export class GoogleAuthService {
  /**
   * Sign out from Google
   */
  static async signOut(): Promise<void> {
    try {
      // Check if user is signed in by checking current user
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.signOut();
        console.log('Google Sign-Out successful');
      }
    } catch (error) {
      console.error('Google Sign-Out error:', error);
      // Don't throw - allow Firebase sign-out to continue
    }
  }

  /**
   * Link Google account to existing Firebase user
   */
  static async linkAccount(currentUser: User): Promise<void> {
    try {
      // Check if already linked
      const hasGoogleProvider = currentUser.providerData.some(
        (provider) => provider.providerId === 'google.com'
      );
      
      if (hasGoogleProvider) {
        console.log('Google account already linked');
        return;
      }

      // Sign in with Google to get credentials
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (!tokens.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create Google credential
      const credential = GoogleAuthProvider.credential(tokens.idToken);
      
      // Link with current user
      await linkWithCredential(currentUser, credential);
      
      console.log('Google account linked successfully');
    } catch (error: any) {
      console.error('Google account linking error:', error);
      throw new Error(error.message || 'Failed to link Google account');
    }
  }

  /**
   * Unlink Google account from Firebase user
   */
  static async unlinkAccount(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if Google provider is linked
      const hasGoogleProvider = currentUser.providerData.some(
        (provider) => provider.providerId === 'google.com'
      );
      
      if (!hasGoogleProvider) {
        console.log('Google account not linked');
        return;
      }

      // Check if user has other providers
      if (currentUser.providerData.length <= 1) {
        throw new Error('Cannot unlink the only authentication method');
      }

      // Unlink Google provider
      await unlink(currentUser, 'google.com');

      // Sign out from Google if signed in
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser) {
        await GoogleSignin.signOut();
      }
      
      console.log('Google account unlinked successfully');
    } catch (error: any) {
      console.error('Google account unlinking error:', error);
      throw new Error(error.message || 'Failed to unlink Google account');
    }
  }

  /**
   * Revoke Google access (removes app from Google account)
   */
  static async revokeAccess(): Promise<void> {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        await GoogleSignin.revokeAccess();
        console.log('Google access revoked');
      }
    } catch (error) {
      console.error('Google revoke access error:', error);
      // Don't throw - this is optional cleanup
    }
  }

  /**
   * Check if Google Play Services are available (Android only)
   */
  static async checkPlayServices(): Promise<boolean> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (error: any) {
      console.error('Play Services not available:', error);
      return false;
    }
  }

  /**
   * Get current Google user (if signed in)
   */
  static async getCurrentUser(): Promise<any> {
    try {
      return await GoogleSignin.getCurrentUser();
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  }
}

export default GoogleAuthService;