import { DatabaseConnection } from '../database/db.mts';
import { Profile, User, UpdateProfileRequest } from '../types/profile.types.mts';

export class ProfileService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async getProfile(userId: string, viewerId?: string): Promise<(Profile & User) | null> {
    const result = await this.db.query<Profile & User>(
      `SELECT 
         p.*,
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
        followersCount: profile.followersCount,
        followingCount: 0, // Hide following count for private profiles
        stepsCount: 0,     // Hide steps count for private profiles
        journeysCount: 0,     // Hide journeys count for private profiles
      };
    }

    return profile;
  }

  async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<Profile> {
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

    const result = await this.db.query<Profile>(
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
    const result = await this.db.query<Profile>(
      `INSERT INTO profiles (user_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING *`,
      [userId]
    );

    return result.rows[0];
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const offset = (page - 1) * limit;

    const result = await this.db.query<User>(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.is_verified, u.created_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const offset = (page - 1) * limit;

    const result = await this.db.query<User>(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.is_verified, u.created_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }
}
