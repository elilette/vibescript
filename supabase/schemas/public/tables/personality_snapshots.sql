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

-- Comments for documentation
COMMENT ON TABLE personality_snapshots IS 'Daily aggregated personality trait snapshots for tracking evolution over time';
COMMENT ON COLUMN personality_snapshots.avg_traits IS 'Average personality traits for the day (CNF, EMX, CRT, DSC, SOC, NRG, INT, IND)';
COMMENT ON COLUMN personality_snapshots.trait_changes IS 'Percentage changes from previous snapshot';
COMMENT ON COLUMN personality_snapshots.analysis_count IS 'Number of handwriting analyses that contributed to this snapshot'; 
