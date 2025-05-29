-- Enhanced Handwriting Analysis System Migration
-- This migration creates the complete schema for quantified handwriting analysis

-- ============================================================================
-- ENHANCED HANDWRITING CHECKINS TABLE
-- ============================================================================

-- Enhanced handwriting analysis table with quantified features and traits
CREATE TABLE handwriting_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  
  -- Quantified features (0-1 normalized values)
  -- SLN: Slant angle, WSP: Word spacing, LSZ: Letter size, BLN: Baseline stability
  -- MLM: Left margin, PRT: Pressure, LSP: Letter spacing, LCR: Curvature
  -- CNT: Connectedness, RHM: Rhythm/speed
  features JSONB NOT NULL,
  
  -- Derived personality traits (0-1 normalized values)
  -- CNF: Confidence, EMX: Emotional expressiveness, CRT: Creativity, DSC: Discipline
  -- SOC: Social openness, NRG: Mental energy, INT: Intuition, IND: Independence
  traits JSONB NOT NULL,
  
  -- Computed scores
  overall_score DECIMAL(3,2) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  
  -- Rich AI analysis (existing format for backward compatibility)
  ai_analysis JSONB,
  gpt_summary TEXT,
  
  -- Metadata
  analysis_version TEXT DEFAULT '2.0',
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_scores CHECK (
    overall_score >= 0 AND overall_score <= 1 AND
    confidence_score >= 0 AND confidence_score <= 1
  ),
  
  CONSTRAINT valid_features CHECK (
    features ? 'SLN' AND features ? 'WSP' AND features ? 'LSZ' AND 
    features ? 'BLN' AND features ? 'MLM' AND features ? 'PRT' AND
    features ? 'LSP' AND features ? 'LCR' AND features ? 'CNT' AND features ? 'RHM'
  ),
  
  CONSTRAINT valid_traits CHECK (
    traits ? 'CNF' AND traits ? 'EMX' AND traits ? 'CRT' AND 
    traits ? 'DSC' AND traits ? 'SOC' AND traits ? 'NRG' AND
    traits ? 'INT' AND traits ? 'IND'
  )
);

-- Indexes for efficient querying
CREATE INDEX idx_handwriting_user_date ON handwriting_checkins(user_id, created_at);
CREATE INDEX idx_handwriting_features ON handwriting_checkins USING GIN(features);
CREATE INDEX idx_handwriting_traits ON handwriting_checkins USING GIN(traits);
CREATE INDEX idx_handwriting_overall_score ON handwriting_checkins(overall_score);
CREATE INDEX idx_handwriting_confidence ON handwriting_checkins(confidence_score);

-- ============================================================================
-- PERSONALITY SNAPSHOTS TABLE
-- ============================================================================

-- Personality evolution tracking table
CREATE TABLE personality_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  
  -- Aggregated traits over time period (daily snapshots)
  avg_traits JSONB NOT NULL,
  
  -- Change from previous period (percentage changes)
  trait_changes JSONB,
  
  -- Number of analyses that contributed to this snapshot
  analysis_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one snapshot per user per day
  UNIQUE(user_id, snapshot_date),
  
  -- Validation constraints
  CONSTRAINT valid_analysis_count CHECK (analysis_count >= 0),
  CONSTRAINT valid_avg_traits CHECK (
    avg_traits ? 'CNF' AND avg_traits ? 'EMX' AND avg_traits ? 'CRT' AND 
    avg_traits ? 'DSC' AND avg_traits ? 'SOC' AND avg_traits ? 'NRG' AND
    avg_traits ? 'INT' AND avg_traits ? 'IND'
  )
);

-- Indexes for efficient time-series queries
CREATE INDEX idx_personality_snapshots_user_date ON personality_snapshots(user_id, snapshot_date);
CREATE INDEX idx_personality_snapshots_date ON personality_snapshots(snapshot_date);
CREATE INDEX idx_personality_snapshots_traits ON personality_snapshots USING GIN(avg_traits);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personality_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_personality_snapshots_updated_at
  BEFORE UPDATE ON personality_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_personality_snapshots_updated_at();

-- ============================================================================
-- FEATURE CORRELATIONS TABLE
-- ============================================================================

-- Feature importance and correlation tracking table
CREATE TABLE feature_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Feature and trait codes
  feature_code TEXT NOT NULL, -- SLN, WSP, LSZ, BLN, MLM, PRT, LSP, LCR, CNT, RHM
  trait_code TEXT NOT NULL,   -- CNF, EMX, CRT, DSC, SOC, NRG, INT, IND
  
  -- Statistical measures
  correlation_strength DECIMAL(4,3), -- Pearson correlation coefficient (-1 to 1)
  sample_size INTEGER DEFAULT 0,
  confidence_interval JSONB, -- {"lower": -0.1, "upper": 0.8}
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique feature-trait pairs
  UNIQUE(feature_code, trait_code),
  
  -- Validation constraints
  CONSTRAINT valid_correlation CHECK (
    correlation_strength >= -1 AND correlation_strength <= 1
  ),
  CONSTRAINT valid_sample_size CHECK (sample_size >= 0),
  CONSTRAINT valid_feature_code CHECK (
    feature_code IN ('SLN', 'WSP', 'LSZ', 'BLN', 'MLM', 'PRT', 'LSP', 'LCR', 'CNT', 'RHM')
  ),
  CONSTRAINT valid_trait_code CHECK (
    trait_code IN ('CNF', 'EMX', 'CRT', 'DSC', 'SOC', 'NRG', 'INT', 'IND')
  )
);

-- Indexes for efficient querying
CREATE INDEX idx_feature_correlations_feature ON feature_correlations(feature_code);
CREATE INDEX idx_feature_correlations_trait ON feature_correlations(trait_code);
CREATE INDEX idx_feature_correlations_strength ON feature_correlations(correlation_strength);
CREATE INDEX idx_feature_correlations_updated ON feature_correlations(last_updated);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to update user profile statistics
CREATE OR REPLACE FUNCTION update_user_stats(
  p_user_id UUID,
  p_new_analysis BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  -- Update total analyses count and last analysis date
  IF p_new_analysis THEN
    UPDATE profiles 
    SET 
      total_analyses = COALESCE(total_analyses, 0) + 1,
      last_analysis_date = CURRENT_DATE,
      updated_at = now()
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update or create daily personality snapshot
CREATE OR REPLACE FUNCTION update_personality_snapshot(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_snapshot_date DATE := CURRENT_DATE;
  v_avg_traits JSONB;
  v_analysis_count INTEGER;
  v_previous_traits JSONB;
  v_trait_changes JSONB;
BEGIN
  -- Calculate average traits for today
  SELECT 
    jsonb_build_object(
      'CNF', AVG((traits->>'CNF')::DECIMAL),
      'EMX', AVG((traits->>'EMX')::DECIMAL),
      'CRT', AVG((traits->>'CRT')::DECIMAL),
      'DSC', AVG((traits->>'DSC')::DECIMAL),
      'SOC', AVG((traits->>'SOC')::DECIMAL),
      'NRG', AVG((traits->>'NRG')::DECIMAL),
      'INT', AVG((traits->>'INT')::DECIMAL),
      'IND', AVG((traits->>'IND')::DECIMAL)
    ),
    COUNT(*)
  INTO v_avg_traits, v_analysis_count
  FROM handwriting_checkins 
  WHERE user_id = p_user_id 
    AND DATE(created_at) = v_snapshot_date;

  -- Get previous day's traits for change calculation
  SELECT avg_traits INTO v_previous_traits
  FROM personality_snapshots
  WHERE user_id = p_user_id 
    AND snapshot_date = v_snapshot_date - INTERVAL '1 day';

  -- Calculate trait changes if previous data exists
  IF v_previous_traits IS NOT NULL THEN
    v_trait_changes := jsonb_build_object(
      'CNF', ROUND(((v_avg_traits->>'CNF')::DECIMAL - (v_previous_traits->>'CNF')::DECIMAL) * 100, 2),
      'EMX', ROUND(((v_avg_traits->>'EMX')::DECIMAL - (v_previous_traits->>'EMX')::DECIMAL) * 100, 2),
      'CRT', ROUND(((v_avg_traits->>'CRT')::DECIMAL - (v_previous_traits->>'CRT')::DECIMAL) * 100, 2),
      'DSC', ROUND(((v_avg_traits->>'DSC')::DECIMAL - (v_previous_traits->>'DSC')::DECIMAL) * 100, 2),
      'SOC', ROUND(((v_avg_traits->>'SOC')::DECIMAL - (v_previous_traits->>'SOC')::DECIMAL) * 100, 2),
      'NRG', ROUND(((v_avg_traits->>'NRG')::DECIMAL - (v_previous_traits->>'NRG')::DECIMAL) * 100, 2),
      'INT', ROUND(((v_avg_traits->>'INT')::DECIMAL - (v_previous_traits->>'INT')::DECIMAL) * 100, 2),
      'IND', ROUND(((v_avg_traits->>'IND')::DECIMAL - (v_previous_traits->>'IND')::DECIMAL) * 100, 2)
    );
  END IF;

  -- Insert or update personality snapshot
  INSERT INTO personality_snapshots (
    user_id,
    snapshot_date,
    avg_traits,
    trait_changes,
    analysis_count
  )
  VALUES (
    p_user_id,
    v_snapshot_date,
    v_avg_traits,
    v_trait_changes,
    v_analysis_count
  )
  ON CONFLICT (user_id, snapshot_date)
  DO UPDATE SET
    avg_traits = EXCLUDED.avg_traits,
    trait_changes = EXCLUDED.trait_changes,
    analysis_count = EXCLUDED.analysis_count,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate personality change over time periods
CREATE OR REPLACE FUNCTION calculate_personality_change(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  trait_code TEXT,
  current_value DECIMAL,
  previous_value DECIMAL,
  change_percentage DECIMAL,
  trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_avg AS (
    SELECT 
      AVG((avg_traits->>'CNF')::DECIMAL) as cnf,
      AVG((avg_traits->>'EMX')::DECIMAL) as emx,
      AVG((avg_traits->>'CRT')::DECIMAL) as crt,
      AVG((avg_traits->>'DSC')::DECIMAL) as dsc,
      AVG((avg_traits->>'SOC')::DECIMAL) as soc,
      AVG((avg_traits->>'NRG')::DECIMAL) as nrg,
      AVG((avg_traits->>'INT')::DECIMAL) as int,
      AVG((avg_traits->>'IND')::DECIMAL) as ind
    FROM personality_snapshots
    WHERE user_id = p_user_id 
      AND snapshot_date >= CURRENT_DATE - INTERVAL '7 days'
  ),
  previous_avg AS (
    SELECT 
      AVG((avg_traits->>'CNF')::DECIMAL) as cnf,
      AVG((avg_traits->>'EMX')::DECIMAL) as emx,
      AVG((avg_traits->>'CRT')::DECIMAL) as crt,
      AVG((avg_traits->>'DSC')::DECIMAL) as dsc,
      AVG((avg_traits->>'SOC')::DECIMAL) as soc,
      AVG((avg_traits->>'NRG')::DECIMAL) as nrg,
      AVG((avg_traits->>'INT')::DECIMAL) as int,
      AVG((avg_traits->>'IND')::DECIMAL) as ind
    FROM personality_snapshots
    WHERE user_id = p_user_id 
      AND snapshot_date >= CURRENT_DATE - INTERVAL '14 days'
      AND snapshot_date < CURRENT_DATE - INTERVAL '7 days'
  )
  SELECT * FROM (
    VALUES 
      ('CNF', (SELECT cnf FROM current_avg), (SELECT cnf FROM previous_avg)),
      ('EMX', (SELECT emx FROM current_avg), (SELECT emx FROM previous_avg)),
      ('CRT', (SELECT crt FROM current_avg), (SELECT crt FROM previous_avg)),
      ('DSC', (SELECT dsc FROM current_avg), (SELECT dsc FROM previous_avg)),
      ('SOC', (SELECT soc FROM current_avg), (SELECT soc FROM previous_avg)),
      ('NRG', (SELECT nrg FROM current_avg), (SELECT nrg FROM previous_avg)),
      ('INT', (SELECT int FROM current_avg), (SELECT int FROM previous_avg)),
      ('IND', (SELECT ind FROM current_avg), (SELECT ind FROM previous_avg))
  ) AS traits(trait_code, current_value, previous_value)
  WHERE traits.current_value IS NOT NULL AND traits.previous_value IS NOT NULL
  ORDER BY 
    CASE 
      WHEN traits.current_value > traits.previous_value THEN 
        ROUND(((traits.current_value - traits.previous_value) / traits.previous_value * 100)::DECIMAL, 2)
      ELSE 
        ROUND(((traits.previous_value - traits.current_value) / traits.previous_value * 100)::DECIMAL, 2)
    END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update correlation statistics
CREATE OR REPLACE FUNCTION update_feature_correlation(
  p_feature_code TEXT,
  p_trait_code TEXT,
  p_correlation DECIMAL(4,3),
  p_sample_size INTEGER,
  p_confidence_interval JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO feature_correlations (
    feature_code, 
    trait_code, 
    correlation_strength, 
    sample_size, 
    confidence_interval
  )
  VALUES (
    p_feature_code, 
    p_trait_code, 
    p_correlation, 
    p_sample_size, 
    p_confidence_interval
  )
  ON CONFLICT (feature_code, trait_code)
  DO UPDATE SET
    correlation_strength = EXCLUDED.correlation_strength,
    sample_size = EXCLUDED.sample_size,
    confidence_interval = EXCLUDED.confidence_interval,
    last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's personality evolution summary
CREATE OR REPLACE FUNCTION get_personality_evolution_summary(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_analyses INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  strongest_trait TEXT,
  strongest_trait_value DECIMAL,
  most_improved_trait TEXT,
  improvement_percentage DECIMAL,
  consistency_score DECIMAL,
  recent_trends JSONB
) AS $$
DECLARE
  v_total_analyses INTEGER;
  v_date_start DATE;
  v_date_end DATE;
  v_strongest_trait TEXT;
  v_strongest_value DECIMAL;
  v_most_improved TEXT;
  v_improvement_pct DECIMAL;
  v_consistency DECIMAL;
  v_trends JSONB;
BEGIN
  -- Get basic stats
  SELECT 
    SUM(analysis_count),
    MIN(snapshot_date),
    MAX(snapshot_date)
  INTO v_total_analyses, v_date_start, v_date_end
  FROM personality_snapshots
  WHERE user_id = p_user_id 
    AND snapshot_date >= CURRENT_DATE - INTERVAL '1 day' * p_days_back;

  -- Find strongest current trait
  WITH latest_traits AS (
    SELECT avg_traits
    FROM personality_snapshots
    WHERE user_id = p_user_id
    ORDER BY snapshot_date DESC
    LIMIT 1
  ),
  trait_values AS (
    SELECT 
      'CNF' as trait, (avg_traits->>'CNF')::DECIMAL as value FROM latest_traits
    UNION ALL SELECT 'EMX', (avg_traits->>'EMX')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'CRT', (avg_traits->>'CRT')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'DSC', (avg_traits->>'DSC')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'SOC', (avg_traits->>'SOC')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'NRG', (avg_traits->>'NRG')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'INT', (avg_traits->>'INT')::DECIMAL FROM latest_traits
    UNION ALL SELECT 'IND', (avg_traits->>'IND')::DECIMAL FROM latest_traits
  )
  SELECT trait, value INTO v_strongest_trait, v_strongest_value
  FROM trait_values
  ORDER BY value DESC
  LIMIT 1;

  -- Calculate consistency (inverse of standard deviation)
  SELECT 
    1 - (STDDEV((avg_traits->>'CNF')::DECIMAL) + 
         STDDEV((avg_traits->>'EMX')::DECIMAL) + 
         STDDEV((avg_traits->>'CRT')::DECIMAL) + 
         STDDEV((avg_traits->>'DSC')::DECIMAL) + 
         STDDEV((avg_traits->>'SOC')::DECIMAL) + 
         STDDEV((avg_traits->>'NRG')::DECIMAL) + 
         STDDEV((avg_traits->>'INT')::DECIMAL) + 
         STDDEV((avg_traits->>'IND')::DECIMAL)) / 8
  INTO v_consistency
  FROM personality_snapshots
  WHERE user_id = p_user_id 
    AND snapshot_date >= CURRENT_DATE - INTERVAL '1 day' * p_days_back;

  -- Return summary
  RETURN QUERY SELECT 
    v_total_analyses,
    v_date_start,
    v_date_end,
    v_strongest_trait,
    v_strongest_value,
    v_most_improved,
    v_improvement_pct,
    COALESCE(v_consistency, 0.5),
    '{"trend": "stable"}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for user personality trends over time
CREATE OR REPLACE VIEW user_personality_trends AS
SELECT 
  ps.user_id,
  ps.snapshot_date,
  ps.avg_traits,
  ps.trait_changes,
  ps.analysis_count,
  -- Calculate 7-day moving averages
  AVG((ps.avg_traits->>'CNF')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as cnf_7day_avg,
  AVG((ps.avg_traits->>'EMX')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as emx_7day_avg,
  AVG((ps.avg_traits->>'CRT')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as crt_7day_avg,
  AVG((ps.avg_traits->>'DSC')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as dsc_7day_avg,
  AVG((ps.avg_traits->>'SOC')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as soc_7day_avg,
  AVG((ps.avg_traits->>'NRG')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as nrg_7day_avg,
  AVG((ps.avg_traits->>'INT')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as int_7day_avg,
  AVG((ps.avg_traits->>'IND')::DECIMAL) OVER (
    PARTITION BY ps.user_id 
    ORDER BY ps.snapshot_date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as ind_7day_avg
FROM personality_snapshots ps
ORDER BY ps.user_id, ps.snapshot_date;

-- View for strong correlations (|r| > 0.3)
CREATE OR REPLACE VIEW strong_feature_correlations AS
SELECT 
  feature_code,
  trait_code,
  correlation_strength,
  sample_size,
  confidence_interval,
  CASE 
    WHEN correlation_strength > 0.7 THEN 'Very Strong'
    WHEN correlation_strength > 0.5 THEN 'Strong'
    WHEN correlation_strength > 0.3 THEN 'Moderate'
    WHEN correlation_strength < -0.7 THEN 'Very Strong (Negative)'
    WHEN correlation_strength < -0.5 THEN 'Strong (Negative)'
    WHEN correlation_strength < -0.3 THEN 'Moderate (Negative)'
  END as strength_category,
  last_updated
FROM feature_correlations
WHERE ABS(correlation_strength) > 0.3
ORDER BY ABS(correlation_strength) DESC;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE handwriting_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_correlations ENABLE ROW LEVEL SECURITY;

-- HANDWRITING_CHECKINS POLICIES
CREATE POLICY "Users can view own handwriting analyses" ON handwriting_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own handwriting analyses" ON handwriting_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own handwriting analyses" ON handwriting_checkins
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own handwriting analyses" ON handwriting_checkins
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all handwriting analyses" ON handwriting_checkins
  FOR ALL USING (auth.role() = 'service_role');

-- PERSONALITY_SNAPSHOTS POLICIES
CREATE POLICY "Users can view own personality snapshots" ON personality_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality snapshots" ON personality_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality snapshots" ON personality_snapshots
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own personality snapshots" ON personality_snapshots
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all personality snapshots" ON personality_snapshots
  FOR ALL USING (auth.role() = 'service_role');

-- FEATURE_CORRELATIONS POLICIES
CREATE POLICY "Authenticated users can view feature correlations" ON feature_correlations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage feature correlations" ON feature_correlations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON handwriting_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON personality_snapshots TO authenticated;
GRANT SELECT ON feature_correlations TO authenticated;

-- Grant permissions on views
GRANT SELECT ON user_personality_trends TO authenticated;
GRANT SELECT ON strong_feature_correlations TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_user_stats(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_personality_snapshot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_personality_change(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_personality_evolution_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_feature_correlation(TEXT, TEXT, DECIMAL, INTEGER, JSONB) TO service_role;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE handwriting_checkins IS 'Daily handwriting analysis with quantified features and personality traits';
COMMENT ON COLUMN handwriting_checkins.features IS 'Quantified handwriting features (SLN, WSP, LSZ, BLN, MLM, PRT, LSP, LCR, CNT, RHM) normalized 0-1';
COMMENT ON COLUMN handwriting_checkins.traits IS 'Derived personality traits (CNF, EMX, CRT, DSC, SOC, NRG, INT, IND) normalized 0-1';
COMMENT ON COLUMN handwriting_checkins.overall_score IS 'Computed overall personality score from traits average';
COMMENT ON COLUMN handwriting_checkins.confidence_score IS 'AI confidence in analysis quality (0-1)';

COMMENT ON TABLE personality_snapshots IS 'Daily aggregated personality trait snapshots for tracking evolution over time';
COMMENT ON COLUMN personality_snapshots.avg_traits IS 'Average personality traits for the day (CNF, EMX, CRT, DSC, SOC, NRG, INT, IND)';
COMMENT ON COLUMN personality_snapshots.trait_changes IS 'Percentage changes from previous snapshot';
COMMENT ON COLUMN personality_snapshots.analysis_count IS 'Number of handwriting analyses that contributed to this snapshot';

COMMENT ON TABLE feature_correlations IS 'Statistical correlations between handwriting features and personality traits';
COMMENT ON COLUMN feature_correlations.correlation_strength IS 'Pearson correlation coefficient between feature and trait (-1 to 1)';
COMMENT ON COLUMN feature_correlations.sample_size IS 'Number of data points used to calculate correlation';
COMMENT ON COLUMN feature_correlations.confidence_interval IS 'Statistical confidence interval for correlation estimate';

COMMENT ON FUNCTION update_user_stats(UUID, BOOLEAN) IS 'Updates user profile statistics after new analysis';
COMMENT ON FUNCTION update_personality_snapshot(UUID) IS 'Creates or updates daily personality snapshot with trait averages';
COMMENT ON FUNCTION calculate_personality_change(UUID, INTEGER) IS 'Calculates personality trait changes over specified time period';
COMMENT ON FUNCTION get_personality_evolution_summary(UUID, INTEGER) IS 'Provides comprehensive personality evolution summary for user dashboard'; 
