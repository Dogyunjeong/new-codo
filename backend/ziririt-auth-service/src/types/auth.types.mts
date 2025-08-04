export interface User {
  id: string; // UUID in the database
  username?: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider?: string;
  providerId?: string;
  googleId?: string;
  appleId?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface RefreshToken {
  id: string; // UUID in the database
  tokenHash: string;
  userId: string; // UUID reference
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface JWTPayload {
  userId: string; // UUID
  email: string;
  displayName: string;
  isVerified?: boolean;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string; // UUID
  tokenId: string; // UUID
  iat?: number;
  exp?: number;
}

export interface GoogleOAuthRequest {
  idToken: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AppleOAuthRequest {
  idToken: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResponse {
  user: {
    id: string; // UUID
    email: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}