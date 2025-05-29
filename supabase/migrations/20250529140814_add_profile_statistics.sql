-- Add profile statistics columns for handwriting analysis tracking
-- This migration adds columns to track user analysis stats

-- Add statistics columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_analyses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_analysis_date DATE,
ADD COLUMN IF NOT EXISTS baseline_traits JSONB;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_total_analyses_idx ON profiles(total_analyses);
CREATE INDEX IF NOT EXISTS profiles_current_streak_idx ON profiles(current_streak);
CREATE INDEX IF NOT EXISTS profiles_last_analysis_date_idx ON profiles(last_analysis_date);

-- Add comments for documentation
COMMENT ON COLUMN profiles.total_analyses IS 'Total number of handwriting analyses completed by user';
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days with at least one analysis';
COMMENT ON COLUMN profiles.average_score IS 'Average overall score from all analyses (0-100)';
COMMENT ON COLUMN profiles.last_analysis_date IS 'Date of the most recent analysis';
COMMENT ON COLUMN profiles.baseline_traits IS 'Initial personality traits from first analysis for comparison';
