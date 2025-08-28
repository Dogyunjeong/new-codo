export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export interface AuthUser {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isVerified: boolean;
  provider: 'email' | 'google' | 'apple';
  firebaseUid?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  isNewUser?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}