import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class RefreshTokenService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(data: CreateRefreshTokenData): Promise<RefreshToken> {
    const tokenHash = this.hashToken(data.token);
    
    const result = await this.pool.query<RefreshToken>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [data.userId, tokenHash, data.expiresAt]
    );

    return result.rows[0];
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenHash = this.hashToken(token);
    
    const result = await this.pool.query<RefreshToken>(
      `SELECT * FROM refresh_tokens 
       WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );

    return result.rows[0] || null;
  }

  async deleteByToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await this.pool.query(
      'DELETE FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash]
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
  }

  async deleteExpired(): Promise<void> {
    await this.pool.query(
      'DELETE FROM refresh_tokens WHERE expires_at <= NOW()'
    );
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const result = await this.pool.query<RefreshToken>(
      `SELECT * FROM refresh_tokens 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}