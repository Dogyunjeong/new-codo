-- Migration: Create user_sessions table for session management
-- This replaces the old refresh_tokens table with a more comprehensive session tracking system

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
  device_id VARCHAR(255),
  device_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Add comments to document the table
COMMENT ON TABLE user_sessions IS 'Active user sessions for refresh token management';
COMMENT ON COLUMN user_sessions.refresh_token_hash IS 'SHA256 hash of the refresh token';
COMMENT ON COLUMN user_sessions.device_type IS 'Device type: mobile, desktop, tablet, etc';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address of the client';
COMMENT ON COLUMN user_sessions.user_agent IS 'User agent string from client';

-- Verify the migration
SELECT 
    table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;