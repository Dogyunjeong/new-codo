import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getAppConfig } from '../configs/app.config.mts';
import { JWTPayload, RefreshTokenPayload, TokenVerificationResult } from '../types/auth.types.mts';

const config = getAppConfig();

export class JWTUtils {
  public static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
      issuer: config.serviceName,
    });
  }

  public static generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
      issuer: config.serviceName,
    });
  }

  public static verifyAccessToken(token: string): TokenVerificationResult {
    try {
      const payload = jwt.verify(token, config.jwtSecret, {
        issuer: config.serviceName,
      }) as JWTPayload;

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      };
    }
  }

  public static verifyRefreshToken(token: string): { valid: boolean; payload?: RefreshTokenPayload; error?: string } {
    try {
      const payload = jwt.verify(token, config.jwtRefreshSecret, {
        issuer: config.serviceName,
      }) as RefreshTokenPayload;

      return {
        valid: true,
        payload,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid refresh token',
      };
    }
  }

  public static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  public static getTokenExpirationTime(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      return decoded?.exp || null;
    } catch {
      return null;
    }
  }
}