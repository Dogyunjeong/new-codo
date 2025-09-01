-- Migration: Rename avatar_url to photo_url to match Firebase/backend naming
-- Run this migration to update existing database schema

-- Rename the column from avatar_url to photo_url
ALTER TABLE users 
RENAME COLUMN avatar_url TO photo_url;

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;