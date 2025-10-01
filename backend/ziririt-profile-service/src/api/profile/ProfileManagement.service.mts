import { Pool } from 'pg';
import { BaseUserService } from '@base/server-services';

export interface Profile {
  userId: string;
  bio?: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  stepsCount: number;
  journeysCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  bio?: string;
  isPrivate?: boolean;
}

export interface ProfileWithUser extends Profile {
  email: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  userCreatedAt: Date;
  lastLoginAt?: Date;
}

export class ProfileManagementService extends BaseUserService {
  constructor(pool: Pool) {
    super(pool);
  }

  async getProfile(userId: string, viewerId?: string): Promise<ProfileWithUser | null> {
    const result = await this.pool.query<ProfileWithUser>(
      `SELECT 
         p.user_id as user_id,
         p.bio,
         p.is_private as is_private,
         p.followers_count as followers_count,
         p.following_count as following_count,
         p.steps_count as steps_count,
         p.journeys_count as journeys_count,
         p.created_at as created_at,
         p.updated_at as updated_at,
         u.email,
         u.display_name,
         u.avatar_url,
         u.is_verified,
         u.created_at as user_created_at,
         u.last_login_at
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const profile = result.rows[0];

    // Check privacy permissions
    if (profile.isPrivate && viewerId !== userId) {
      // Return limited public info for private profiles
      return {
        ...profile,
        bio: undefined,
        followingCount: 0, // Hide following count for private profiles
        stepsCount: 0,     // Hide steps count for private profiles
        journeysCount: 0,     // Hide journeys count for private profiles
      };
    }

    return profile;
  }

  async updateProfile(userId: string, updates: UpdateProfileData): Promise<Profile> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      params.push(updates.bio);
    }
    if (updates.isPrivate !== undefined) {
      updateFields.push(`is_private = $${paramIndex++}`);
      params.push(updates.isPrivate);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(userId);

    const result = await this.pool.query<Profile>(
      `UPDATE profiles 
       SET ${updateFields.join(', ')}
       WHERE user_id = $${paramIndex++}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Profile not found');
    }

    return result.rows[0];
  }

  async createProfile(userId: string): Promise<Profile> {
    const result = await this.pool.query<Profile>(
      `INSERT INTO profiles (user_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }

  async ensureProfileExists(userId: string): Promise<Profile> {
    // Try to get existing profile
    const existing = await this.pool.query<Profile>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Create profile if it doesn't exist
    return this.createProfile(userId);
  }
}
