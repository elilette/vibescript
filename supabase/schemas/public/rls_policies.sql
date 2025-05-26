-- Row Level Security Policies for Enhanced Handwriting Analysis System

-- Enable RLS on all tables
ALTER TABLE handwriting_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_correlations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HANDWRITING_CHECKINS POLICIES
-- ============================================================================

-- Users can only view their own handwriting analyses
CREATE POLICY "Users can view own handwriting analyses" ON handwriting_checkins
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own handwriting analyses
CREATE POLICY "Users can insert own handwriting analyses" ON handwriting_checkins
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own handwriting analyses
CREATE POLICY "Users can update own handwriting analyses" ON handwriting_checkins
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own handwriting analyses
CREATE POLICY "Users can delete own handwriting analyses" ON handwriting_checkins
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role can access all handwriting analyses (for admin/analytics)
CREATE POLICY "Service role can manage all handwriting analyses" ON handwriting_checkins
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================================================
-- PERSONALITY_SNAPSHOTS POLICIES
-- ============================================================================

-- Users can only view their own personality snapshots
CREATE POLICY "Users can view own personality snapshots" ON personality_snapshots
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own personality snapshots
CREATE POLICY "Users can insert own personality snapshots" ON personality_snapshots
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own personality snapshots
CREATE POLICY "Users can update own personality snapshots" ON personality_snapshots
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own personality snapshots
CREATE POLICY "Users can delete own personality snapshots" ON personality_snapshots
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role can access all personality snapshots
CREATE POLICY "Service role can manage all personality snapshots" ON personality_snapshots
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================================================
-- FEATURE_CORRELATIONS POLICIES
-- ============================================================================

-- All authenticated users can view feature correlations (read-only public data)
CREATE POLICY "Authenticated users can view feature correlations" ON feature_correlations
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only service role can manage feature correlations (admin-only data)
CREATE POLICY "Service role can manage feature correlations" ON feature_correlations
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================================================
-- PROFILES TABLE UPDATES (if needed)
-- ============================================================================

-- Ensure profiles table has proper RLS policies
-- Users can only view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Service role can access all profiles
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON handwriting_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON personality_snapshots TO authenticated;
GRANT SELECT ON feature_correlations TO authenticated;
GRANT SELECT, UPDATE, INSERT ON profiles TO authenticated;

-- Grant permissions on views
GRANT SELECT ON user_personality_trends TO authenticated;
GRANT SELECT ON strong_feature_correlations TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION calculate_personality_change(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_personality_snapshot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_feature_correlation(TEXT, TEXT, DECIMAL, INTEGER, JSONB) TO service_role;

-- ============================================================================
-- SECURITY COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own handwriting analyses" ON handwriting_checkins IS 
'Ensures users can only access their own handwriting analysis data for privacy';

COMMENT ON POLICY "Service role can manage all handwriting analyses" ON handwriting_checkins IS 
'Allows backend services to perform analytics and data management operations';

COMMENT ON POLICY "Authenticated users can view feature correlations" ON feature_correlations IS 
'Feature correlations are public research data that can help users understand the analysis';

COMMENT ON POLICY "Service role can manage feature correlations" ON feature_correlations IS 
'Only backend services can update correlation data based on statistical analysis'; 
