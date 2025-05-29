-- Database functions for enhanced handwriting analysis system

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_user_stats(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION update_personality_snapshot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_personality_change(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_personality_evolution_summary(UUID, INTEGER) TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION update_user_stats(UUID, BOOLEAN) IS 'Updates user profile statistics after new analysis';
COMMENT ON FUNCTION update_personality_snapshot(UUID) IS 'Creates or updates daily personality snapshot with trait averages';
COMMENT ON FUNCTION calculate_personality_change(UUID, INTEGER) IS 'Calculates personality trait changes over specified time period';
COMMENT ON FUNCTION get_personality_evolution_summary(UUID, INTEGER) IS 'Provides comprehensive personality evolution summary for user dashboard'; 
