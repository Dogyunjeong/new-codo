-- Migration: Add Firebase Authentication support to users table
-- Run this migration to update existing database schema

-- Add firebase_uid column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;

-- Add email_verified column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add last_login_at column for tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Make username nullable (Firebase users might not have usernames initially)
ALTER TABLE users 
ALTER COLUMN username DROP NOT NULL;

-- Make provider_id nullable (Firebase uses firebase_uid instead)
ALTER TABLE users 
ALTER COLUMN provider_id DROP NOT NULL;

-- Create index for firebase_uid for better query performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Update existing users to have email_verified = false if not set
UPDATE users 
SET email_verified = false 
WHERE email_verified IS NULL;

-- For development: Map existing test users to Firebase UIDs
-- This is optional and only for maintaining test data continuity
UPDATE users SET firebase_uid = 'firebase_' || provider_id 
WHERE firebase_uid IS NULL AND provider_id IS NOT NULL;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;