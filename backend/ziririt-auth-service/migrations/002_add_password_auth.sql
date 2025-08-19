-- Add password authentication fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'google',
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Update existing users to have auth_provider set
UPDATE users SET auth_provider = 'google' WHERE auth_provider IS NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_provider ON users(email, auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);