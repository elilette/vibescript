// Shared types for photo analysis functionality

export interface PhotoAnalysisResponse {
  success: boolean
  analysis?: any // Structured analysis object from server
  formatted_analysis?: string // Pre-formatted text from server
  raw_analysis?: string
  error?: string
  timestamp?: string
}

// Enhanced types for handwriting analysis functionality

// Quantified handwriting features (0-1 normalized)
export interface HandwritingFeatures {
  SLN: number // Slant angle
  WSP: number // Word spacing
  LSZ: number // Letter size
  BLN: number // Baseline stability
  MLM: number // Left margin
  PRT: number // Pressure
  LSP: number // Letter spacing
  LCR: number // Curvature
  CNT: number // Connectedness
  RHM: number // Rhythm/speed
}

// Derived personality traits (0-1 normalized)
export interface PersonalityTraits {
  CNF: number // Confidence
  EMX: number // Emotional expressiveness
  CRT: number // Creativity
  DSC: number // Discipline
  SOC: number // Social openness
  NRG: number // Mental energy
  INT: number // Intuition
  IND: number // Independence
}

// Enhanced analysis response from the new API
export interface EnhancedAnalysisResponse {
  success: boolean
  analysis_id?: string
  analysis?: {
    overall_assessment: {
      confidence_level: "high" | "medium" | "low"
      handwriting_quality: string
      overall_personality_summary: string
    }
    writing_characteristics: {
      size: string
      slant: string
      pressure: string
      spacing: string
      margins: string
      baseline: string
    }
    personality_traits: {
      emotional_stability: string
      social_orientation: string
      thinking_style: string
      confidence_level: string
      communication_style: string
      attention_to_detail: string
    }
    behavioral_indicators: {
      work_style: string
      decision_making: string
      stress_response: string
      leadership_potential: string
      creativity_level: string
    }
    specific_observations: Array<{
      feature: string
      observation: string
      interpretation: string
    }>
    recommendations: {
      strengths_to_leverage: string[]
      areas_for_development: string[]
      career_suggestions: string[]
    }
    quantified_features: HandwritingFeatures
    quantified_traits: PersonalityTraits
    confidence_score: number
  }
  formatted_analysis?: string
  features?: HandwritingFeatures
  traits?: PersonalityTraits
  overall_score?: number
  confidence_score?: number
  error?: string
  timestamp?: string
}

// Database record structure
export interface HandwritingCheckin {
  id: string
  user_id: string
  image_url: string
  features: HandwritingFeatures
  traits: PersonalityTraits
  overall_score: number
  confidence_score: number
  ai_analysis: any
  gpt_summary: string
  analysis_version: string
  processing_time_ms: number
  created_at: string
}

// Personality snapshot for time-series data
export interface PersonalitySnapshot {
  id: string
  user_id: string
  snapshot_date: string
  avg_traits: PersonalityTraits
  trait_changes?: Partial<PersonalityTraits>
  analysis_count: number
  created_at: string
  updated_at: string
}

// Chart data point for visualization
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

// Trait trend data for charts
export interface TraitTrend {
  trait_code: keyof PersonalityTraits
  trait_name: string
  current_value: number
  data_points: ChartDataPoint[]
  change_percentage?: number
  trend_direction: "up" | "down" | "stable"
  color: string
}
