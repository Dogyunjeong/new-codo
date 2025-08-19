import { Pool } from 'pg';
import { BaseUserService, User, CreateUserData } from '@base/server-services';
import { GoogleUserInfo } from '../oauth/GoogleOAuth.service.mts';
import { AppleUserInfo } from '../oauth/AppleOAuth.service.mts';
import { FirebaseUserData } from './UserAuthentication.service.mts';

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

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE firebase_uid = $1';
      const result = await client.query(query, [firebaseUid]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updateFirebaseUid(userId: string, firebaseUid: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = 'UPDATE users SET firebase_uid = $1, updated_at = NOW() WHERE id = $2';
      await client.query(query, [firebaseUid, userId]);
    } finally {
      client.release();
    }
  }

  async createFromFirebase(userData: FirebaseUserData): Promise<User> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO users (
          firebase_uid, 
          email, 
          display_name, 
          photo_url, 
          provider, 
          email_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await client.query(query, [
        userData.firebaseUid,
        userData.email,
        userData.displayName,
        userData.photoUrl,
        userData.provider,
        userData.emailVerified,
      ]);
      
      return this.mapToUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updateFromFirebase(userId: string, userData: FirebaseUserData): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE users 
        SET 
          display_name = COALESCE($1, display_name),
          photo_url = COALESCE($2, photo_url),
          email_verified = $3,
          provider = COALESCE($4, provider),
          updated_at = NOW(),
          last_login_at = NOW()
        WHERE id = $5
      `;
      
      await client.query(query, [
        userData.displayName,
        userData.photoUrl,
        userData.emailVerified,
        userData.provider,
        userId,
      ]);
    } finally {
      client.release();
    }
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      displayName: row.display_name,
      avatar_url: row.avatar_url || row.photo_url,
      avatarUrl: row.avatar_url || row.photo_url,
      photoUrl: row.photo_url,
      provider: row.provider,
      provider_id: row.provider_id,
      providerId: row.provider_id,
      firebase_uid: row.firebase_uid,
      firebaseUid: row.firebase_uid,
      email_verified: row.email_verified,
      emailVerified: row.email_verified,
      is_verified: row.is_verified || row.email_verified,
      isVerified: row.is_verified || row.email_verified,
      created_at: row.created_at,
      createdAt: row.created_at,
      updated_at: row.updated_at,
      updatedAt: row.updated_at,
      last_login_at: row.last_login_at,
      lastLoginAt: row.last_login_at,
    };
  }
}