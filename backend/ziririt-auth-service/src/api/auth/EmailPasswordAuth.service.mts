import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface EmailPasswordAuthData {
  email: string;
  password: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface EmailPasswordSignupData extends EmailPasswordAuthData {
  name: string;
  username?: string;
}

export class EmailPasswordAuthService {
  private pool: Pool;
  private readonly SALT_ROUNDS = 10;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async signup(signupData: EmailPasswordSignupData): Promise<any> {
    const { email, password, name, username } = signupData;
    
    // Check if user already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    
    // Create user
    const userId = uuidv4();
    const displayName = name;
    const userName = username || email.split('@')[0];
    
    const query = `
      INSERT INTO users (
        id, email, password_hash, display_name, username, 
        auth_provider, is_verified, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, email, display_name, username, is_verified, created_at
    `;
    
    const values = [
      userId,
      email.toLowerCase(),
      passwordHash,
      displayName,
      userName,
      'email',
      false // Email users need verification
    ];
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async login(authData: EmailPasswordAuthData): Promise<any> {
    const { email, password } = authData;
    
    // Find user by email
    const user = await this.findUserByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Update last login
    await this.updateLastLogin(user.id);
    
    // Return user without password hash
    delete user.password_hash;
    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Get current password hash
    const query = 'SELECT password_hash FROM users WHERE id = $1';
    const result = await this.pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const currentPasswordHash = result.rows[0].password_hash;
    
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, currentPasswordHash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    
    // Update password
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `;
    await this.pool.query(updateQuery, [newPasswordHash, userId]);
  }

  async resetPasswordRequest(email: string): Promise<string> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return 'If the email exists, a reset link has been sent';
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expiry = $2, updated_at = NOW() 
      WHERE id = $3
    `;
    await this.pool.query(query, [resetToken, resetTokenExpiry, user.id]);
    
    // In production, send email with reset link
    // For now, return the token (in production, this would be sent via email)
    return resetToken;
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const query = `
      SELECT id, reset_token_expiry 
      FROM users 
      WHERE reset_token = $1
    `;
    const result = await this.pool.query(query, [resetToken]);
    
    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }
    
    const user = result.rows[0];
    
    // Check if token is expired
    if (new Date() > new Date(user.reset_token_expiry)) {
      throw new Error('Reset token has expired');
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    
    // Update password and clear reset token
    const updateQuery = `
      UPDATE users 
      SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = NOW() 
      WHERE id = $2
    `;
    await this.pool.query(updateQuery, [newPasswordHash, user.id]);
  }

  private async findUserByEmail(email: string): Promise<any> {
    const query = `
      SELECT id, email, display_name, username, is_verified, created_at 
      FROM users 
      WHERE LOWER(email) = LOWER($1)
    `;
    const result = await this.pool.query(query, [email]);
    return result.rows[0];
  }

  private async findUserByEmailWithPassword(email: string): Promise<any> {
    const query = `
      SELECT id, email, password_hash, display_name, username, is_verified, created_at 
      FROM users 
      WHERE LOWER(email) = LOWER($1) AND auth_provider = 'email'
    `;
    const result = await this.pool.query(query, [email]);
    return result.rows[0];
  }

  private async updateLastLogin(userId: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
    await this.pool.query(query, [userId]);
  }
}