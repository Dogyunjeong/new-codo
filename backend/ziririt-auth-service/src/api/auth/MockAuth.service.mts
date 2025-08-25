import { User } from '@base/shared-types';
import { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { getAppConfig } from '../../configs/app.config.mts';

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  emailVerified: boolean;
  provider: string;
  firebaseUid: string;
  createdAt: Date;
  lastLoginAt: Date;
}

/**
 * Mock Authentication Service for Development/Testing
 * Provides test users and authentication without Firebase
 */
export class MockAuthService {
  private config = getAppConfig();
  
  /**
   * Predefined mock users matching frontend MockAuthService
   */
  private static readonly MOCK_USERS: MockUser[] = [
    {
      id: 'mock-user-001',
      email: 'john.hero@test.com',
      displayName: 'John Hero',
      photoUrl: 'https://i.pravatar.cc/150?img=1',
      emailVerified: true,
      provider: 'password',
      firebaseUid: 'mock-firebase-001',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
    },
    {
      id: 'mock-user-002',
      email: 'sarah.journey@test.com',
      displayName: 'Sarah Journey',
      photoUrl: 'https://i.pravatar.cc/150?img=5',
      emailVerified: true,
      provider: 'google.com',
      firebaseUid: 'mock-firebase-002',
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date(),
    },
    {
      id: 'mock-user-003',
      email: 'alex.newbie@test.com',
      displayName: 'Alex Newbie',
      photoUrl: 'https://i.pravatar.cc/150?img=3',
      emailVerified: false,
      provider: 'password',
      firebaseUid: 'mock-firebase-003',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    },
    {
      id: 'mock-user-004',
      email: 'premium.user@test.com',
      displayName: 'Premium User',
      photoUrl: 'https://i.pravatar.cc/150?img=8',
      emailVerified: true,
      provider: 'apple.com',
      firebaseUid: 'mock-firebase-004',
      createdAt: new Date('2023-12-01'),
      lastLoginAt: new Date(),
    },
    {
      id: 'mock-user-005',
      email: 'test@test.com',
      displayName: 'Test User',
      photoUrl: null,
      emailVerified: true,
      provider: 'password',
      firebaseUid: 'mock-firebase-005',
      createdAt: new Date('2024-01-01'),
      lastLoginAt: new Date(),
    },
  ];

  /**
   * Verify mock Firebase ID token
   */
  async verifyMockIdToken(idToken: string): Promise<any> {
    // Parse the mock token (not cryptographically secure, just for testing)
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid mock token format');
      }
      
      // Decode the payload (base64)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      // Find the corresponding mock user
      const user = MockAuthService.MOCK_USERS.find(u => 
        u.firebaseUid === payload.sub || u.email === payload.email
      );
      
      if (!user) {
        // Return a default mock user if not found
        const defaultUser = MockAuthService.MOCK_USERS[4]; // Test User
        return {
          uid: defaultUser.firebaseUid,
          email: defaultUser.email,
          name: defaultUser.displayName,
          picture: defaultUser.photoUrl,
          email_verified: defaultUser.emailVerified,
          firebase: {
            sign_in_provider: defaultUser.provider,
          },
        };
      }
      
      return {
        uid: user.firebaseUid,
        email: user.email,
        name: user.displayName,
        picture: user.photoUrl,
        email_verified: user.emailVerified,
        firebase: {
          sign_in_provider: user.provider,
        },
      };
    } catch (error) {
      console.error('[MockAuth] Error parsing mock token:', error);
      
      // Return default test user on any error
      const defaultUser = MockAuthService.MOCK_USERS[4];
      return {
        uid: defaultUser.firebaseUid,
        email: defaultUser.email,
        name: defaultUser.displayName,
        picture: defaultUser.photoUrl,
        email_verified: defaultUser.emailVerified,
        firebase: {
          sign_in_provider: defaultUser.provider,
        },
      };
    }
  }

  /**
   * Get mock user by Firebase UID
   */
  getMockUserByFirebaseUid(firebaseUid: string): MockUser | undefined {
    return MockAuthService.MOCK_USERS.find(u => u.firebaseUid === firebaseUid);
  }

  /**
   * Get mock user by email
   */
  getMockUserByEmail(email: string): MockUser | undefined {
    return MockAuthService.MOCK_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Create or get mock user data
   */
  async findOrCreateMockUser(data: {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
    provider: string;
    emailVerified: boolean;
  }): Promise<MockUser> {
    // Try to find existing mock user
    let user = this.getMockUserByFirebaseUid(data.firebaseUid);
    if (user) {
      return user;
    }
    
    // Try to find by email
    if (data.email) {
      user = this.getMockUserByEmail(data.email);
      if (user) {
        return user;
      }
    }
    
    // Create new mock user
    const newUser: MockUser = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email: data.email || `user${Date.now()}@test.com`,
      displayName: data.displayName || 'Mock User',
      photoUrl: data.photoUrl || null,
      emailVerified: data.emailVerified,
      provider: data.provider,
      firebaseUid: data.firebaseUid,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
    
    // In a real implementation, you might want to store this
    // For now, just return it
    return newUser;
  }

  /**
   * Generate mock JWT access token
   */
  generateMockAccessToken(user: MockUser): string {
    const payload = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isVerified: user.emailVerified,
      type: 'access',
    };
    
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn || '15m',
      issuer: 'mock-auth-service',
      subject: user.id,
    });
  }

  /**
   * Generate mock JWT refresh token
   */
  generateMockRefreshToken(user: MockUser): string {
    const payload = {
      userId: user.id,
      type: 'refresh',
    };
    
    return jwt.sign(payload, this.config.jwtRefreshSecret, {
      expiresIn: this.config.jwtRefreshExpiresIn || '7d',
      issuer: 'mock-auth-service',
      subject: user.id,
    });
  }

  /**
   * Check if mock auth is enabled
   */
  static isMockAuthEnabled(config: any): boolean {
    return config.mockAuthEnabled === true || config.mockAuthEnabled === 'true';
  }

  /**
   * Log mock authentication event
   */
  static logMockAuth(message: string, data?: any): void {
    console.log(`[MockAuth] ${message}`, data || '');
  }
}