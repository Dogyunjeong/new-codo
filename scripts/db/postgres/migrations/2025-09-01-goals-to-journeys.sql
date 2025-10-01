-- Migration: Rename goals -> journeys and goals_count -> journeys_count
-- Safe to run multiple times.

DO $$
BEGIN
  -- Rename table goals to journeys if exists and journeys not already present
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'goals'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'journeys'
  ) THEN
    EXECUTE 'ALTER TABLE goals RENAME TO journeys';
  END IF;

  -- Rename column goals_count to journeys_count on profiles if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'goals_count'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'journeys_count'
  ) THEN
    EXECUTE 'ALTER TABLE profiles RENAME COLUMN goals_count TO journeys_count';
  END IF;

  -- Rename indexes if they exist
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_goals_user') THEN
    EXECUTE 'ALTER INDEX idx_goals_user RENAME TO idx_journeys_user';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_goals_created') THEN
    EXECUTE 'ALTER INDEX idx_goals_created RENAME TO idx_journeys_created';
  END IF;

  -- Drop old trigger if exists and create journeys trigger
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_goals_updated_at'
  ) THEN
    EXECUTE 'DROP TRIGGER update_goals_updated_at ON journeys';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_journeys_updated_at'
  ) THEN
    EXECUTE 'CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END$$;

