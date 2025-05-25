import * as FileSystem from 'expo-file-system'

export interface PhotoAnalysisRequest {
  imageBase64: string
  prompt?: string
}

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

export interface PhotoAnalysisResponse {
  success: boolean
  analysis?: GraphologyAnalysis | string // Can be structured or fallback string
  raw_analysis?: string
  error?: string
  timestamp?: string
}

export const photoAnalysisService = {
  /**
   * Analyze a photo using OpenAI vision API via Supabase Edge Function
   * @param imageBase64 - Base64 encoded image data
   * @param customPrompt - Optional custom prompt for analysis
   * @returns Analysis result from OpenAI
   */
  async analyzePhoto(imageBase64: string, customPrompt?: string): Promise<PhotoAnalysisResponse> {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          success: false,
          error: 'Supabase configuration missing'
        }
      }

      // Call edge function directly via HTTP
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          prompt: customPrompt
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge function error:', errorText)
        return {
          success: false,
          error: `Function call failed: ${response.status}`
        }
      }

      const result = await response.json()
      return result as PhotoAnalysisResponse

    } catch (error) {
      console.error('Error calling analyze-photo function:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  },

  /**
   * Convert image URI to base64 string using Expo FileSystem (React Native compatible)
   * @param imageUri - Local image URI from camera/gallery
   * @returns Base64 encoded image string
   */
  async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      return base64
    } catch (error) {
      console.error('Error converting image to base64:', error)
      throw new Error('Failed to process image')
    }
  },

  /**
   * Format structured graphology analysis for display
   * @param analysis - Structured analysis object
   * @returns Formatted string for UI display
   */
  formatAnalysisForDisplay(analysis: GraphologyAnalysis): string {
    const sections = [
      `🎯 **OVERALL ASSESSMENT** (Confidence: ${analysis.overall_assessment.confidence_level.toUpperCase()})`,
      `${analysis.overall_assessment.overall_personality_summary}`,
      ``,
      `📝 **HANDWRITING CHARACTERISTICS**`,
      `• Size: ${analysis.writing_characteristics.size}`,
      `• Slant: ${analysis.writing_characteristics.slant}`,
      `• Pressure: ${analysis.writing_characteristics.pressure}`,
      `• Spacing: ${analysis.writing_characteristics.spacing}`,
      `• Margins: ${analysis.writing_characteristics.margins}`,
      `• Baseline: ${analysis.writing_characteristics.baseline}`,
      ``,
      `🧠 **PERSONALITY TRAITS**`,
      `• Emotional Stability: ${analysis.personality_traits.emotional_stability}`,
      `• Social Orientation: ${analysis.personality_traits.social_orientation}`,
      `• Thinking Style: ${analysis.personality_traits.thinking_style}`,
      `• Confidence: ${analysis.personality_traits.confidence_level}`,
      `• Communication: ${analysis.personality_traits.communication_style}`,
      `• Attention to Detail: ${analysis.personality_traits.attention_to_detail}`,
      ``,
      `⚡ **BEHAVIORAL INDICATORS**`,
      `• Work Style: ${analysis.behavioral_indicators.work_style}`,
      `• Decision Making: ${analysis.behavioral_indicators.decision_making}`,
      `• Stress Response: ${analysis.behavioral_indicators.stress_response}`,
      `• Leadership: ${analysis.behavioral_indicators.leadership_potential}`,
      `• Creativity: ${analysis.behavioral_indicators.creativity_level}`,
    ]

    if (analysis.specific_observations && analysis.specific_observations.length > 0) {
      sections.push(``, `🔍 **SPECIFIC OBSERVATIONS**`)
      analysis.specific_observations.forEach((obs, index) => {
        sections.push(`${index + 1}. **${obs.feature}**: ${obs.observation}`)
        sections.push(`   → ${obs.interpretation}`)
      })
    }

    if (analysis.recommendations) {
      sections.push(``, `💡 **RECOMMENDATIONS**`)
      
      if (analysis.recommendations.strengths_to_leverage.length > 0) {
        sections.push(`**Strengths to Leverage:**`)
        analysis.recommendations.strengths_to_leverage.forEach(strength => {
          sections.push(`• ${strength}`)
        })
      }

      if (analysis.recommendations.areas_for_development.length > 0) {
        sections.push(``, `**Areas for Development:**`)
        analysis.recommendations.areas_for_development.forEach(area => {
          sections.push(`• ${area}`)
        })
      }

      if (analysis.recommendations.career_suggestions.length > 0) {
        sections.push(``, `**Career Suggestions:**`)
        analysis.recommendations.career_suggestions.forEach(suggestion => {
          sections.push(`• ${suggestion}`)
        })
      }
    }

    return sections.join('\n')
  }
} 
