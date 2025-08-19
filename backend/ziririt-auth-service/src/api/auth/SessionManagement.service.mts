import { Pool } from 'pg';
import crypto from 'crypto';

export interface SessionData {
  userId: string;
  refreshToken: string;
  deviceId?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceId?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
}

export class SessionManagementService {
  private pool: Pool;
  private sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new session
   */
  async createSession(data: SessionData): Promise<Session> {
    const client = await this.pool.connect();
    try {
      // Hash the refresh token for storage
      const refreshTokenHash = this.hashToken(data.refreshToken);
      
      // Calculate expiration date
      const expiresAt = new Date(Date.now() + this.sessionDuration);
      
      // Insert session
      const query = `
        INSERT INTO user_sessions (
          user_id, 
          refresh_token_hash, 
          device_id, 
          device_type, 
          ip_address, 
          user_agent, 
          expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const result = await client.query(query, [
        data.userId,
        refreshTokenHash,
        data.deviceId || null,
        data.deviceType || null,
        data.ipAddress || null,
        data.userAgent || null,
        expiresAt,
      ]);
      
      return this.mapToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Validate and get session by refresh token
   */
  async validateSession(refreshToken: string): Promise<Session | null> {
    const client = await this.pool.connect();
    try {
      const refreshTokenHash = this.hashToken(refreshToken);
      
      const query = `
        SELECT * FROM user_sessions 
        WHERE refresh_token_hash = $1 
        AND expires_at > NOW()
      `;
      
      const result = await client.query(query, [refreshTokenHash]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Update last used timestamp
      await client.query(
        'UPDATE user_sessions SET last_used_at = NOW() WHERE id = $1',
        [result.rows[0].id]
      );
      
      return this.mapToSession(result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(refreshToken: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const refreshTokenHash = this.hashToken(refreshToken);
      
      await client.query(
        'DELETE FROM user_sessions WHERE refresh_token_hash = $1',
        [refreshTokenHash]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [userId]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM user_sessions 
        WHERE user_id = $1 
        AND expires_at > NOW()
        ORDER BY last_used_at DESC
      `;
      
      const result = await client.query(query, [userId]);
      
      return result.rows.map(row => this.mapToSession(row));
    } finally {
      client.release();
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM user_sessions WHERE expires_at <= NOW()'
      );
      
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }

  /**
   * Rotate refresh token
   */
  async rotateRefreshToken(oldToken: string, newToken: string): Promise<Session | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Find existing session
      const oldTokenHash = this.hashToken(oldToken);
      const sessionResult = await client.query(
        'SELECT * FROM user_sessions WHERE refresh_token_hash = $1 AND expires_at > NOW()',
        [oldTokenHash]
      );
      
      if (sessionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      const session = sessionResult.rows[0];
      const newTokenHash = this.hashToken(newToken);
      const newExpiresAt = new Date(Date.now() + this.sessionDuration);
      
      // Update session with new token
      const updateResult = await client.query(
        `UPDATE user_sessions 
         SET refresh_token_hash = $1, expires_at = $2, last_used_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [newTokenHash, newExpiresAt, session.id]
      );
      
      await client.query('COMMIT');
      
      return this.mapToSession(updateResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if a device has an active session
   */
  async hasActiveSessionForDevice(userId: string, deviceId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM user_sessions 
        WHERE user_id = $1 
        AND device_id = $2
        AND expires_at > NOW()
      `;
      
      const result = await client.query(query, [userId, deviceId]);
      
      return parseInt(result.rows[0].count) > 0;
    } finally {
      client.release();
    }
  }

  /**
   * Hash a token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Map database row to Session object
   */
  private mapToSession(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenHash: row.refresh_token_hash,
      deviceId: row.device_id,
      deviceType: row.device_type,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
    };
  }
}