import { Pool, QueryResult } from 'pg';
import { User, CreateUserData, UpdateUserData, UserFilters } from './User.model.mts';

export abstract class BaseUserService {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    const result = await this.pool.query<User>(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      [provider, providerId]
    );
    return result.rows[0] || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const { username, email, displayName, avatarUrl, provider, providerId } = userData;
    
    const result = await this.pool.query<User>(
      `INSERT INTO users (username, email, display_name, avatar_url, provider, provider_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [username, email, displayName, avatarUrl, provider, providerId]
    );

    return result.rows[0];
  }

  async update(id: string, updates: UpdateUserData): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }
    if (updates.displayName !== undefined) {
      fields.push(`display_name = $${paramIndex++}`);
      values.push(updates.displayName);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      values.push(updates.avatarUrl);
    }
    if (updates.lastLoginAt !== undefined) {
      fields.push(`last_login_at = $${paramIndex++}`);
      values.push(updates.lastLoginAt);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.pool.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const result = await this.pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  async findMany(filters: UserFilters = {}, limit: number = 20, offset: number = 0): Promise<User[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.email) {
      conditions.push(`email = $${paramIndex++}`);
      values.push(filters.email);
    }
    if (filters.provider) {
      conditions.push(`provider = $${paramIndex++}`);
      values.push(filters.provider);
    }
    if (filters.providerId) {
      conditions.push(`provider_id = $${paramIndex++}`);
      values.push(filters.providerId);
    }
    if (filters.isVerified !== undefined) {
      conditions.push(`is_verified = $${paramIndex++}`);
      values.push(filters.isVerified);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const result = await this.pool.query<User>(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    return result.rows;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.pool.query(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
      [id]
    );
  }
}