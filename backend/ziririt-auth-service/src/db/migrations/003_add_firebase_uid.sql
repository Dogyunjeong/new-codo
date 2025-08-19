-- Migration: Add Firebase UID and remove password columns
-- Date: 2025-08-12
-- Description: Migrate to GCP Identity Platform authentication

-- Add firebase_uid column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Add provider column to track auth provider
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50);

-- Add email_verified column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add photo_url column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add metadata column for additional user data
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add last_login_at column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Remove password-related columns (they're managed by Firebase now)
ALTER TABLE users 
DROP COLUMN IF EXISTS password_hash,
DROP COLUMN IF EXISTS password_salt,
DROP COLUMN IF EXISTS password_reset_token,
DROP COLUMN IF EXISTS password_reset_expires;

-- Create index for firebase_uid lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_id VARCHAR(255),
  device_type VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Add comment to document the migration
COMMENT ON COLUMN users.firebase_uid IS 'Firebase/GCP Identity Platform user ID';
COMMENT ON COLUMN users.provider IS 'Authentication provider: email, google, apple';
COMMENT ON COLUMN users.email_verified IS 'Whether email is verified in Firebase';
COMMENT ON COLUMN users.photo_url IS 'User profile photo URL from provider';
COMMENT ON COLUMN users.metadata IS 'Additional user metadata as JSON';
COMMENT ON TABLE user_sessions IS 'Active user sessions for refresh token management';