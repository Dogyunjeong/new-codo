-- PostgreSQL initialization script for Ziririt Goal Sharing App
-- This script sets up the initial database schema for auth and profile services

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE,  -- Made nullable for Firebase users
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    photo_url VARCHAR(500),
    firebase_uid VARCHAR(255) UNIQUE,  -- Firebase Authentication UID
    email_verified BOOLEAN DEFAULT false,  -- Email verification status
    provider VARCHAR(20) NOT NULL, -- 'google', 'apple', 'email'
    provider_id VARCHAR(255),  -- Legacy OAuth provider ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    UNIQUE(provider, provider_id)
);

-- Create refresh_tokens table for JWT token management (legacy - kept for compatibility)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

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

-- Create profiles table for user profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    is_private BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    steps_count INTEGER DEFAULT 0,
    goals_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create goals table for user goals
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    steps_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create follows table for social relationships
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_created ON goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Insert sample data for development
-- Insert users with a stable UUID for alice to satisfy tests
INSERT INTO users (id, username, email, display_name, firebase_uid, email_verified, provider, provider_id) VALUES
    ('3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f', 'alice_goals', 'alice@example.com', 'Alice Johnson', 'firebase_alice_123', true, 'google', 'google_alice_123'),
    (uuid_generate_v4(), 'bob_progress', 'bob@example.com', 'Bob Smith', 'firebase_bob_456', true, 'apple', 'apple_bob_456'),
    (uuid_generate_v4(), 'charlie_journey', 'charlie@example.com', 'Charlie Brown', 'firebase_charlie_789', true, 'google', 'google_charlie_789')
ON CONFLICT (email) DO NOTHING;

-- Insert corresponding profiles
INSERT INTO profiles (user_id, bio, is_private, followers_count, following_count, steps_count, goals_count)
SELECT 
    u.id,
    CASE 
        WHEN u.username = 'alice_goals' THEN 'Fitness enthusiast working on mindfulness and strength training'
        WHEN u.username = 'bob_progress' THEN 'Learning new skills and documenting my journey'
        WHEN u.username = 'charlie_journey' THEN 'Building healthy habits one step at a time'
    END as bio,
    false as is_private,
    CASE 
        WHEN u.username = 'alice_goals' THEN 25
        WHEN u.username = 'bob_progress' THEN 18
        WHEN u.username = 'charlie_journey' THEN 12
    END as followers_count,
    CASE 
        WHEN u.username = 'alice_goals' THEN 15
        WHEN u.username = 'bob_progress' THEN 22
        WHEN u.username = 'charlie_journey' THEN 8
    END as following_count,
    CASE 
        WHEN u.username = 'alice_goals' THEN 47
        WHEN u.username = 'bob_progress' THEN 32
        WHEN u.username = 'charlie_journey' THEN 19
    END as steps_count,
    CASE 
        WHEN u.username = 'alice_goals' THEN 3
        WHEN u.username = 'bob_progress' THEN 2
        WHEN u.username = 'charlie_journey' THEN 2
    END as goals_count
FROM users u
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample goals
-- Insert goals; assign a stable UUID for "Strength Training Journey" to satisfy tests
INSERT INTO goals (id, user_id, title, description, is_private, steps_count)
SELECT 
    CASE 
      WHEN goal_data.title = 'Strength Training Journey' THEN 'f679548c-09c9-468c-a02d-44ab598e35bc'::uuid
      ELSE uuid_generate_v4()
    END AS id,
    u.id,
    goal_data.title,
    goal_data.description,
    goal_data.is_private,
    goal_data.steps_count
FROM users u
CROSS JOIN (
    VALUES 
        ('alice_goals', 'Morning Meditation Practice', 'Build a consistent 10-minute daily meditation practice to improve focus and reduce stress', false, 15),
        ('alice_goals', 'Strength Training Journey', 'Progressive strength training 3x per week with focus on compound movements', false, 22),
        ('alice_goals', 'Healthy Meal Prep', 'Meal prep healthy lunches every Sunday for the work week', true, 10),
        ('bob_progress', 'Learn Spanish', 'Achieve conversational Spanish through daily practice and immersion', false, 18),
        ('bob_progress', 'Photography Skills', 'Improve portrait photography techniques and build a portfolio', false, 14),
        ('charlie_journey', 'Daily Reading Habit', 'Read for 30 minutes every day before bed', false, 12),
        ('charlie_journey', 'Home Workout Routine', 'Establish a consistent home workout routine 4x per week', false, 7)
) AS goal_data(username, title, description, is_private, steps_count)
WHERE u.username = goal_data.username
ON CONFLICT DO NOTHING;

-- Insert sample follow relationships
INSERT INTO follows (follower_id, following_id)
SELECT 
    follower.id,
    following.id
FROM users follower
CROSS JOIN users following
WHERE follower.username = 'alice_goals' AND following.username IN ('bob_progress', 'charlie_journey')
   OR follower.username = 'bob_progress' AND following.username IN ('alice_goals', 'charlie_journey')
   OR follower.username = 'charlie_journey' AND following.username = 'alice_goals'
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
