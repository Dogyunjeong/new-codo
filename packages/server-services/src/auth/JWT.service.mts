import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  displayName: string;
  isVerified: boolean;
  firebaseUid?: string;
  provider?: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat: number;
  exp: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    userId?: string;
    email: string;
    displayName: string;
    isVerified: boolean;
    firebaseUid?: string;
  };
}

export interface JWTVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

export class JWTService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor(config: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiresIn?: string;
    refreshTokenExpiresIn?: string;
  }) {
    this.accessTokenSecret = config.accessTokenSecret;
    this.refreshTokenSecret = config.refreshTokenSecret;
    this.accessTokenExpiresIn = config.accessTokenExpiresIn || '15m';
    this.refreshTokenExpiresIn = config.refreshTokenExpiresIn || '7d';
  }

  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  generateTokenPair(user: {
    id: string;
    email: string;
    displayName: string;
    isVerified: boolean;
    firebaseUid?: string;
    provider?: string;
  }, tokenId: string): TokenResponse {
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isVerified: user.isVerified,
      firebaseUid: user.firebaseUid,
      provider: user.provider,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      tokenId,
    });

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpiresIn(this.accessTokenExpiresIn);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isVerified: user.isVerified,
        userId: user.id,
        firebaseUid: user.firebaseUid,
      },
    };
  }

  verifyAccessToken(token: string): JWTVerificationResult {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as JWTPayload;
      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  verifyRefreshToken(token: string): { valid: boolean; payload?: RefreshTokenPayload; error?: string } {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid refresh token',
      };
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900; // 15 minutes default
    }
  }
}
