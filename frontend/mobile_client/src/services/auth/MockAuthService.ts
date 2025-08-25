import { AuthProvider } from '../AuthService';

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  isVerified: boolean;
  provider: AuthProvider;
  tags?: string[];
  journeyCount?: number;
  stepCount?: number;
  followerCount?: number;
  followingCount?: number;
}

export interface MockAuthToken {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Mock authentication service for testing purposes
 * Provides predefined test users and simulated auth flow
 */
export class MockAuthService {
  private static readonly MOCK_DELAY_MS = 800; // Simulate network delay

  /**
   * Predefined test users with different personas
   */
  static readonly TEST_USERS: MockUser[] = [
    {
      id: 'mock-user-001',
      email: 'john.hero@test.com',
      displayName: 'John Hero',
      photoURL: 'https://i.pravatar.cc/150?img=1',
      bio: 'On a journey to become the best version of myself. Every step counts! 🚀',
      isVerified: true,
      provider: AuthProvider.EMAIL,
      tags: ['fitness', 'coding', 'reading'],
      journeyCount: 3,
      stepCount: 127,
      followerCount: 342,
      followingCount: 189,
    },
    {
      id: 'mock-user-002',
      email: 'sarah.journey@test.com',
      displayName: 'Sarah Journey',
      photoURL: 'https://i.pravatar.cc/150?img=5',
      bio: 'Documenting my creative journey. Artist | Designer | Dreamer ✨',
      isVerified: true,
      provider: AuthProvider.GOOGLE,
      tags: ['art', 'design', 'travel'],
      journeyCount: 5,
      stepCount: 89,
      followerCount: 1024,
      followingCount: 456,
    },
    {
      id: 'mock-user-003',
      email: 'alex.newbie@test.com',
      displayName: 'Alex Newbie',
      photoURL: 'https://i.pravatar.cc/150?img=3',
      bio: 'Just started my journey!',
      isVerified: false,
      provider: AuthProvider.EMAIL,
      tags: [],
      journeyCount: 0,
      stepCount: 0,
      followerCount: 2,
      followingCount: 15,
    },
    {
      id: 'mock-user-004',
      email: 'premium.user@test.com',
      displayName: 'Premium User',
      photoURL: 'https://i.pravatar.cc/150?img=8',
      bio: 'Premium member | Life coach | Helping others achieve their dreams 🌟',
      isVerified: true,
      provider: AuthProvider.APPLE,
      tags: ['coaching', 'motivation', 'business', 'health'],
      journeyCount: 12,
      stepCount: 534,
      followerCount: 5678,
      followingCount: 234,
    },
    {
      id: 'mock-user-005',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: null,
      bio: 'Default test account for quick testing',
      isVerified: true,
      provider: AuthProvider.EMAIL,
      tags: ['test'],
      journeyCount: 1,
      stepCount: 5,
      followerCount: 10,
      followingCount: 10,
    },
  ];

  /**
   * Default test credentials
   */
  static readonly DEFAULT_PASSWORD = 'test123';
  static readonly DEFAULT_EMAIL = 'test@test.com';

  /**
   * Generate a mock JWT token
   */
  static generateMockToken(userId: string, email: string): MockAuthToken {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour
    
    // Create mock JWT payload
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    
    const payload = {
      userId,
      email,
      exp: now + expiresIn,
      iat: now,
      iss: 'mock-auth-service',
      aud: 'ziririt-app',
      sub: userId,
    };
    
    const refreshPayload = {
      userId,
      exp: now + (86400 * 7), // 7 days
      iat: now,
      type: 'refresh',
      iss: 'mock-auth-service',
    };
    
    // Create base64 encoded mock tokens (not cryptographically signed)
    const encodeBase64 = (obj: any) => {
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    const mockSignature = 'mock-signature-' + Math.random().toString(36).substr(2, 9);
    
    const token = `${encodeBase64(header)}.${encodeBase64(payload)}.${mockSignature}`;
    const refreshToken = `${encodeBase64(header)}.${encodeBase64(refreshPayload)}.${mockSignature}`;
    
    return {
      token,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Simulate authentication with delay
   */
  static async simulateAuth<T>(response: T): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    return response;
  }

  /**
   * Get user by email
   */
  static getUserByEmail(email: string): MockUser | undefined {
    return this.TEST_USERS.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Get user by ID
   */
  static getUserById(userId: string): MockUser | undefined {
    return this.TEST_USERS.find(user => user.id === userId);
  }

  /**
   * Authenticate with email and password
   */
  static async authenticateWithEmail(email: string, password: string): Promise<{
    user: MockUser;
    tokens: MockAuthToken;
  }> {
    // For mock mode, accept any password or use default
    const user = this.getUserByEmail(email) || this.TEST_USERS[4]; // Default to test user
    
    const tokens = this.generateMockToken(user.id, user.email);
    
    return this.simulateAuth({
      user,
      tokens,
    });
  }

  /**
   * Authenticate with OAuth provider (Google/Apple)
   */
  static async authenticateWithOAuth(provider: AuthProvider): Promise<{
    user: MockUser;
    tokens: MockAuthToken;
  }> {
    // Return different user based on provider for variety
    let user: MockUser;
    
    switch (provider) {
      case AuthProvider.GOOGLE:
        user = this.TEST_USERS[1]; // Sarah Journey
        break;
      case AuthProvider.APPLE:
        user = this.TEST_USERS[3]; // Premium User
        break;
      default:
        user = this.TEST_USERS[0]; // John Hero
    }
    
    const tokens = this.generateMockToken(user.id, user.email);
    
    return this.simulateAuth({
      user,
      tokens,
    });
  }

  /**
   * Create a new mock user (for signup)
   */
  static async createUser(
    email: string,
    displayName?: string
  ): Promise<{
    user: MockUser;
    tokens: MockAuthToken;
  }> {
    const userId = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    
    const newUser: MockUser = {
      id: userId,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: `https://i.pravatar.cc/150?u=${userId}`,
      bio: 'Just joined HeroJourney!',
      isVerified: false,
      provider: AuthProvider.EMAIL,
      tags: [],
      journeyCount: 0,
      stepCount: 0,
      followerCount: 0,
      followingCount: 0,
    };
    
    const tokens = this.generateMockToken(newUser.id, newUser.email);
    
    return this.simulateAuth({
      user: newUser,
      tokens,
    });
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(refreshToken: string): Promise<MockAuthToken> {
    // Parse the refresh token to get user ID
    try {
      const parts = refreshToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.userId;
      const user = this.getUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return this.simulateAuth(
        this.generateMockToken(user.id, user.email)
      );
    } catch (error) {
      // Return a default token if parsing fails
      const defaultUser = this.TEST_USERS[4];
      return this.simulateAuth(
        this.generateMockToken(defaultUser.id, defaultUser.email)
      );
    }
  }

  /**
   * Verify if a token is valid (mock implementation)
   */
  static isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Get a random test user
   */
  static getRandomUser(): MockUser {
    const index = Math.floor(Math.random() * this.TEST_USERS.length);
    return this.TEST_USERS[index];
  }

  /**
   * Mock Firebase ID token for backend exchange
   */
  static generateMockFirebaseToken(user: MockUser): string {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      iss: 'https://securetoken.google.com/mock-project',
      aud: 'mock-project',
      auth_time: now,
      user_id: user.id,
      sub: user.id,
      iat: now,
      exp: now + 3600,
      email: user.email,
      email_verified: user.isVerified,
      firebase: {
        identities: {
          email: [user.email],
        },
        sign_in_provider: user.provider,
      },
    };
    
    const header = { alg: 'RS256', typ: 'JWT' };
    
    const encodeBase64 = (obj: any) => {
      const json = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    return `${encodeBase64(header)}.${encodeBase64(payload)}.mock-firebase-signature`;
  }
}