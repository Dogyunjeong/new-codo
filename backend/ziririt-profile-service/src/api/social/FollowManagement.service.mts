import { Pool } from 'pg';
import { User } from '@base/shared-services';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
}

export interface RelationshipResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export class FollowManagementService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      // Use transaction to ensure data consistency
      const result = await this.pool.query(
        `INSERT INTO follows (follower_id, following_id, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (follower_id, following_id) DO NOTHING
         RETURNING *`,
        [followerId, followingId]
      );

      if (result.rows.length > 0) {
        // Update follower counts
        await this.updateFollowCounts(followingId, followerId);
      }

      return { success: true, isFollowing: true };
    } catch (error) {
      console.error('Error following user:', error);
      throw new Error('Failed to follow user');
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<FollowResponse> {
    if (followerId === followingId) {
      throw new Error('Cannot unfollow yourself');
    }

    try {
      const result = await this.pool.query(
        `DELETE FROM follows 
         WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );

      if (result.rowCount > 0) {
        // Update follower counts
        await this.updateFollowCounts(followingId, followerId);
      }

      return { success: true, isFollowing: false };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw new Error('Failed to unfollow user');
    }
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<User[]> {
    const offset = (page - 1) * limit;

    const result = await this.pool.query<User>(
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

    const result = await this.pool.query<User>(
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

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT 1 FROM follows 
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    return result.rows.length > 0;
  }

  async getRelationship(userId: string, targetUserId: string): Promise<RelationshipResponse> {
    const result = await this.pool.query<{ following: boolean; followed_by: boolean }>(
      `SELECT 
         EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2) as following,
         EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND following_id = $1) as followed_by`,
      [userId, targetUserId]
    );

    const row = result.rows[0];
    
    return {
      isFollowing: row.following,
      isFollowedBy: row.followed_by,
    };
  }

  private async updateFollowCounts(followingId: string, followerId: string): Promise<void> {
    // Update followers count for the followed user
    await this.pool.query(
      `UPDATE profiles 
       SET followers_count = (
         SELECT COUNT(*) FROM follows WHERE following_id = $1
       ),
       updated_at = NOW()
       WHERE user_id = $1`,
      [followingId]
    );

    // Update following count for the follower
    await this.pool.query(
      `UPDATE profiles 
       SET following_count = (
         SELECT COUNT(*) FROM follows WHERE follower_id = $1
       ),
       updated_at = NOW()
       WHERE user_id = $1`,
      [followerId]
    );
  }
}