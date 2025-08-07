import { Pool } from 'pg';
import { BaseUserService, User, CreateUserData } from '@base/shared-services';
import { GoogleUserInfo } from '../oauth/GoogleOAuth.service.mts';
import { AppleUserInfo } from '../oauth/AppleOAuth.service.mts';

export class UserRegistrationService extends BaseUserService {
  constructor(pool: Pool) {
    super(pool);
  }

  async registerFromGoogle(googleUser: GoogleUserInfo): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByProvider('google', googleUser.id);
    if (existingUser) {
      return existingUser;
    }

    // Check if email already exists with different provider
    const emailUser = await this.findByEmail(googleUser.email);
    if (emailUser) {
      throw new Error('Email already registered with different provider');
    }

    const userData: CreateUserData = {
      email: googleUser.email,
      displayName: googleUser.name,
      avatarUrl: googleUser.picture,
      provider: 'google',
      providerId: googleUser.id,
    };

    return this.create(userData);
  }

  async registerFromApple(appleUser: AppleUserInfo): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByProvider('apple', appleUser.id);
    if (existingUser) {
      return existingUser;
    }

    // Check if email already exists with different provider
    const emailUser = await this.findByEmail(appleUser.email);
    if (emailUser) {
      throw new Error('Email already registered with different provider');
    }

    const userData: CreateUserData = {
      email: appleUser.email,
      displayName: appleUser.name || appleUser.email.split('@')[0],
      provider: 'apple',
      providerId: appleUser.id,
    };

    return this.create(userData);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await super.updateLastLogin(userId);
  }
}