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

-- Comments for documentation
COMMENT ON TABLE handwriting_checkins IS 'Daily handwriting analysis with quantified features and personality traits';
COMMENT ON COLUMN handwriting_checkins.features IS 'Quantified handwriting features (SLN, WSP, LSZ, BLN, MLM, PRT, LSP, LCR, CNT, RHM) normalized 0-1';
COMMENT ON COLUMN handwriting_checkins.traits IS 'Derived personality traits (CNF, EMX, CRT, DSC, SOC, NRG, INT, IND) normalized 0-1';
COMMENT ON COLUMN handwriting_checkins.overall_score IS 'Computed overall personality score from traits average';
COMMENT ON COLUMN handwriting_checkins.confidence_score IS 'AI confidence in analysis quality (0-1)'; 
