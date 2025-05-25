// Shared types for photo analysis functionality

export interface PhotoAnalysisRequest {
  imageBase64: string
  prompt?: string
}

export interface PhotoAnalysisResponse {
  success: boolean
  analysis?: any // Structured analysis object from server
  formatted_analysis?: string // Pre-formatted text from server
  raw_analysis?: string
  error?: string
  timestamp?: string
}

// If you need to work with the structured analysis on the client side,
// you can import these types (though formatting should be done server-side)
export interface GraphologyAnalysis {
  overall_assessment: {
    confidence_level: 'high' | 'medium' | 'low'
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
} 
