import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  UserCredential,
  User,
  AuthError,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode
} from 'firebase/auth';
import { getFirebaseAuth } from '../firebase/firebase.init';
import { VALIDATION_RULES } from '../../config/app.config';

export interface EmailSignInResult {
  user: User;
  idToken: string;
  isNewUser: boolean;
  emailVerified: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
}

/**
 * Email/Password Authentication Service using Firebase v9+
 */
export class EmailAuthService {
  /**
   * Sign up with email and password
   */
  static async signUp(data: SignUpData): Promise<EmailSignInResult> {
    try {
      // Validate input
      this.validateEmail(data.email);
      this.validatePassword(data.password);

      const auth = getFirebaseAuth();
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update profile if display name or photo provided
      if (data.displayName || data.photoURL) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
        });
      }

      // Send email verification
      await this.sendVerificationEmail(userCredential.user);

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: true,
        emailVerified: userCredential.user.emailVerified,
      };
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<EmailSignInResult> {
    try {
      // Validate input
      this.validateEmail(email);
      this.validatePassword(password);

      const auth = getFirebaseAuth();
      
      // Sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      return {
        user: userCredential.user,
        idToken,
        isNewUser: false,
        emailVerified: userCredential.user.emailVerified,
      };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      this.validateEmail(email);
      
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email, {
        // You can customize the email here
        url: 'https://ziririt.com/auth/action', // Continue URL after reset
        handleCodeInApp: false, // Handle in web by default
      });
      
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Verify password reset code (from email link)
   */
  static async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      const auth = getFirebaseAuth();
      const email = await verifyPasswordResetCode(auth, code);
      return email;
    } catch (error) {
      console.error('Error verifying password reset code:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Confirm password reset with new password
   */
  static async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);
      
      const auth = getFirebaseAuth();
      await confirmPasswordReset(auth, code, newPassword);
      
      console.log('Password reset confirmed');
    } catch (error) {
      console.error('Error confirming password reset:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Send email verification
   */
  static async sendVerificationEmail(user?: User): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      const currentUser = user || auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(currentUser, {
        url: 'https://ziririt.com/auth/verify-success', // Continue URL after verification
        handleCodeInApp: false,
      });
      
      console.log('Verification email sent');
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Verify email with action code (from email link)
   */
  static async verifyEmail(actionCode: string): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      await applyActionCode(auth, actionCode);
      
      // Reload user to get updated emailVerified status
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }
      
      console.log('Email verified successfully');
    } catch (error) {
      console.error('Error verifying email:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);
      
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Re-authenticate user (for sensitive operations)
   */
  static async reauthenticate(password: string): Promise<UserCredential> {
    try {
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      const userCredential = await reauthenticateWithCredential(user, credential);
      
      console.log('User re-authenticated');
      return userCredential;
    } catch (error) {
      console.error('Error re-authenticating:', error);
      throw this.handleError(error as AuthError);
    }
  }

  /**
   * Link email/password to existing account
   */
  static async linkAccount(email: string, password: string): Promise<UserCredential> {
    try {
      this.validateEmail(email);
      this.validatePassword(password);
      
      const auth = getFirebaseAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user to link account to');
      }

      const credential = EmailAuthProvider.credential(email, password);
      const linkedCredential = await auth.currentUser.linkWithCredential(credential);
      
      console.log('Email/password account linked successfully');
      return linkedCredential;
    } catch (error: any) {
      console.error('Error linking email/password account:', error);
      
      if (error.code === 'auth/credential-already-in-use') {
        throw new Error('This email is already linked to another account');
      } else if (error.code === 'auth/provider-already-linked') {
        throw new Error('An email/password account is already linked to this user');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already in use');
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Unlink email/password from account
   */
  static async unlinkAccount(): Promise<void> {
    try {
      const auth = getFirebaseAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      // Check if user has other providers before unlinking
      const providers = auth.currentUser.providerData;
      if (providers.length <= 1) {
        throw new Error('Cannot unlink the only authentication method');
      }

      await auth.currentUser.unlink(EmailAuthProvider.PROVIDER_ID);
      console.log('Email/password account unlinked successfully');
    } catch (error: any) {
      console.error('Error unlinking email/password account:', error);
      
      if (error.code === 'auth/no-such-provider') {
        throw new Error('No email/password account is linked to this user');
      }
      
      throw error;
    }
  }

  /**
   * Validate email format
   */
  private static validateEmail(email: string): void {
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): void {
    if (!password) {
      throw new Error('Password is required');
    }
    
    if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`);
    }
    
    // Additional password strength checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      throw new Error('Password must contain uppercase, lowercase, and numbers');
    }
  }

  /**
   * Handle Firebase Auth errors
   */
  private static handleError(error: AuthError): Error {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('This email address is already registered');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/operation-not-allowed':
        return new Error('Email/password sign-in is not enabled');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please use a stronger password');
      case 'auth/user-disabled':
        return new Error('This account has been disabled');
      case 'auth/user-not-found':
        return new Error('No account found with this email address');
      case 'auth/wrong-password':
        return new Error('Incorrect password');
      case 'auth/invalid-verification-code':
        return new Error('Invalid verification code');
      case 'auth/invalid-verification-id':
        return new Error('Invalid verification ID');
      case 'auth/missing-verification-code':
        return new Error('Verification code is required');
      case 'auth/missing-verification-id':
        return new Error('Verification ID is required');
      case 'auth/expired-action-code':
        return new Error('This link has expired. Please request a new one');
      case 'auth/invalid-action-code':
        return new Error('Invalid or already used action code');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your connection');
      case 'auth/requires-recent-login':
        return new Error('Please log in again to perform this action');
      case 'auth/invalid-credential':
        return new Error('Invalid credentials provided');
      default:
        return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Check if email is already registered
   */
  static async isEmailRegistered(email: string): Promise<boolean> {
    try {
      this.validateEmail(email);
      
      // Try to create a user with a dummy password
      // If email exists, it will throw an error
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, 'dummy_check_123456');
      
      // If we get here, email doesn't exist (but we created a user, so delete it)
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      return false;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return true;
      }
      // For other errors, assume email doesn't exist
      return false;
    }
  }
}