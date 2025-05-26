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

-- Comments for documentation
COMMENT ON TABLE feature_correlations IS 'Statistical correlations between handwriting features and personality traits';
COMMENT ON COLUMN feature_correlations.correlation_strength IS 'Pearson correlation coefficient between feature and trait (-1 to 1)';
COMMENT ON COLUMN feature_correlations.sample_size IS 'Number of data points used to calculate correlation';
COMMENT ON COLUMN feature_correlations.confidence_interval IS 'Statistical confidence interval for correlation estimate'; 
