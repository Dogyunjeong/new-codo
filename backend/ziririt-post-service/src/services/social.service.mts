import { DatabaseConnection } from '../database/db.mjs';
import { User, Follow, FollowResponse, RelationshipResponse } from '../types/profile.types.mjs';

export class SocialService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async followUser(followerId: string, followingId: string): Promise<FollowResponse> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      await this.db.transaction(async (client) => {
        // Insert follow relationship
        await client.query(
          `INSERT INTO follows (follower_id, following_id, created_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (follower_id, following_id) DO NOTHING`,
          [followerId, followingId]
        );

        // Update follower counts
        await this.updateFollowCounts(followingId, followerId);
      });

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
      await this.db.transaction(async (client) => {
        // Remove follow relationship
        const result = await client.query(
          `DELETE FROM follows 
           WHERE follower_id = $1 AND following_id = $2`,
          [followerId, followingId]
        );

        if (result.rowCount > 0) {
          // Update follower counts
          await this.updateFollowCounts(followingId, followerId);
        }
      });

      return { success: true, isFollowing: false };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw new Error('Failed to unfollow user');
    }
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

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM follows 
       WHERE follower_id = $1 AND following_id = $2`,
      [followerId, followingId]
    );

    return result.rows.length > 0;
  }

  async getRelationship(userId: string, targetUserId: string): Promise<RelationshipResponse> {
    const result = await this.db.query<{ direction: string }>(
      `SELECT 
         CASE 
           WHEN f1.follower_id IS NOT NULL THEN 'following'
           WHEN f2.follower_id IS NOT NULL THEN 'followed_by'
           ELSE 'none'
         END as direction
       FROM (SELECT 1) as dummy
       LEFT JOIN follows f1 ON f1.follower_id = $1 AND f1.following_id = $2
       LEFT JOIN follows f2 ON f2.follower_id = $2 AND f2.following_id = $1`,
      [userId, targetUserId]
    );

    const directions = result.rows.map(row => row.direction);
    
    return {
      isFollowing: directions.includes('following'),
      isFollowedBy: directions.includes('followed_by'),
    };
  }

  private async updateFollowCounts(followingId: string, followerId: string): Promise<void> {
    // Update followers count for the followed user
    await this.db.query(
      `UPDATE profiles 
       SET followers_count = (
         SELECT COUNT(*) FROM follows WHERE following_id = $1
       ),
       updated_at = NOW()
       WHERE user_id = $1`,
      [followingId]
    );

    // Update following count for the follower
    await this.db.query(
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