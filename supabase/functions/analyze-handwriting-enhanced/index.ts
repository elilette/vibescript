import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.5"

interface AnalyzeHandwritingRequest {
  imageBase64: string
  prompt?: string
}

// Enhanced feature extraction interface
interface HandwritingFeatures {
  SLN: number // Slant angle (-1 to 1, normalized to 0-1)
  WSP: number // Word spacing (0 to 1)
  LSZ: number // Letter size (0 to 1)
  BLN: number // Baseline stability (0 to 1)
  MLM: number // Left margin (0 to 1)
  PRT: number // Pressure (0 to 1)
  LSP: number // Letter spacing (0 to 1)
  LCR: number // Curvature (0 to 1)
  CNT: number // Connectedness (0 to 1)
  RHM: number // Rhythm/speed (0 to 1)
}

// Personality traits derived from features
interface PersonalityTraits {
  CNF: number // Confidence
  EMX: number // Emotional expressiveness
  CRT: number // Creativity
  DSC: number // Discipline
  SOC: number // Social openness
  NRG: number // Mental energy
  INT: number // Intuition
  IND: number // Independence
}

// Enhanced analysis response
interface EnhancedGraphologyAnalysis {
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
  // NEW: Quantified features and traits
  quantified_features: HandwritingFeatures
  quantified_traits: PersonalityTraits
  confidence_score: number // 0-1
}

interface AnalysisResponse {
  success: boolean
  analysis_id?: string
  analysis?: EnhancedGraphologyAnalysis
  formatted_analysis?: string
  features?: HandwritingFeatures
  traits?: PersonalityTraits
  overall_score?: number
  confidence_score?: number
  error?: string
  timestamp?: string
}

// Feature to trait mapping functions
function calculateTraitsFromFeatures(
  features: HandwritingFeatures
): PersonalityTraits {
  return {
    CNF: Math.min(1, features.LSZ * 0.6 + features.PRT * 0.4), // Confidence from size + pressure
    EMX: Math.min(
      1,
      Math.abs(features.SLN - 0.5) * 2 * 0.7 + features.RHM * 0.3
    ), // Emotional expr from slant + rhythm
    CRT: Math.min(1, features.LCR * 0.6 + (1 - features.BLN) * 0.4), // Creativity from curvature + irregularity
    DSC: Math.min(1, features.BLN * 0.6 + features.MLM * 0.4), // Discipline from baseline + margins
    SOC: Math.min(
      1,
      features.WSP * 0.5 +
        features.LSP * 0.3 +
        Math.abs(features.SLN - 0.5) * 2 * 0.2
    ), // Social from spacing + slant
    NRG: Math.min(1, features.PRT * 0.6 + features.RHM * 0.4), // Energy from pressure + rhythm
    INT: Math.min(1, (1 - features.CNT) * 0.6 + features.LCR * 0.4), // Intuition from disconnectedness + curvature
    IND: Math.min(1, (1 - features.CNT) * 0.5 + (1 - features.WSP) * 0.5), // Independence from disconnectedness + tight spacing
  }
}

function calculateOverallScore(traits: PersonalityTraits): number {
  const values = Object.values(traits)
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

// Enhanced schema for structured output
const enhancedGraphologySchema = {
  type: "object",
  properties: {
    overall_assessment: {
      type: "object",
      properties: {
        confidence_level: { type: "string", enum: ["high", "medium", "low"] },
        handwriting_quality: { type: "string" },
        overall_personality_summary: { type: "string" },
      },
      required: [
        "confidence_level",
        "handwriting_quality",
        "overall_personality_summary",
      ],
      additionalProperties: false,
    },
    writing_characteristics: {
      type: "object",
      properties: {
        size: { type: "string" },
        slant: { type: "string" },
        pressure: { type: "string" },
        spacing: { type: "string" },
        margins: { type: "string" },
        baseline: { type: "string" },
      },
      required: ["size", "slant", "pressure", "spacing", "margins", "baseline"],
      additionalProperties: false,
    },
    personality_traits: {
      type: "object",
      properties: {
        emotional_stability: { type: "string" },
        social_orientation: { type: "string" },
        thinking_style: { type: "string" },
        confidence_level: { type: "string" },
        communication_style: { type: "string" },
        attention_to_detail: { type: "string" },
      },
      required: [
        "emotional_stability",
        "social_orientation",
        "thinking_style",
        "confidence_level",
        "communication_style",
        "attention_to_detail",
      ],
      additionalProperties: false,
    },
    behavioral_indicators: {
      type: "object",
      properties: {
        work_style: { type: "string" },
        decision_making: { type: "string" },
        stress_response: { type: "string" },
        leadership_potential: { type: "string" },
        creativity_level: { type: "string" },
      },
      required: [
        "work_style",
        "decision_making",
        "stress_response",
        "leadership_potential",
        "creativity_level",
      ],
      additionalProperties: false,
    },
    specific_observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          feature: { type: "string" },
          observation: { type: "string" },
          interpretation: { type: "string" },
        },
        required: ["feature", "observation", "interpretation"],
        additionalProperties: false,
      },
    },
    recommendations: {
      type: "object",
      properties: {
        strengths_to_leverage: { type: "array", items: { type: "string" } },
        areas_for_development: { type: "array", items: { type: "string" } },
        career_suggestions: { type: "array", items: { type: "string" } },
      },
      required: [
        "strengths_to_leverage",
        "areas_for_development",
        "career_suggestions",
      ],
      additionalProperties: false,
    },
    // NEW: Quantified features
    quantified_features: {
      type: "object",
      properties: {
        SLN: { type: "number", minimum: 0, maximum: 1 },
        WSP: { type: "number", minimum: 0, maximum: 1 },
        LSZ: { type: "number", minimum: 0, maximum: 1 },
        BLN: { type: "number", minimum: 0, maximum: 1 },
        MLM: { type: "number", minimum: 0, maximum: 1 },
        PRT: { type: "number", minimum: 0, maximum: 1 },
        LSP: { type: "number", minimum: 0, maximum: 1 },
        LCR: { type: "number", minimum: 0, maximum: 1 },
        CNT: { type: "number", minimum: 0, maximum: 1 },
        RHM: { type: "number", minimum: 0, maximum: 1 },
      },
      required: [
        "SLN",
        "WSP",
        "LSZ",
        "BLN",
        "MLM",
        "PRT",
        "LSP",
        "LCR",
        "CNT",
        "RHM",
      ],
      additionalProperties: false,
    },
    // NEW: Quantified traits
    quantified_traits: {
      type: "object",
      properties: {
        CNF: { type: "number", minimum: 0, maximum: 1 },
        EMX: { type: "number", minimum: 0, maximum: 1 },
        CRT: { type: "number", minimum: 0, maximum: 1 },
        DSC: { type: "number", minimum: 0, maximum: 1 },
        SOC: { type: "number", minimum: 0, maximum: 1 },
        NRG: { type: "number", minimum: 0, maximum: 1 },
        INT: { type: "number", minimum: 0, maximum: 1 },
        IND: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["CNF", "EMX", "CRT", "DSC", "SOC", "NRG", "INT", "IND"],
      additionalProperties: false,
    },
    confidence_score: { type: "number", minimum: 0, maximum: 1 },
  },
  required: [
    "overall_assessment",
    "writing_characteristics",
    "personality_traits",
    "behavioral_indicators",
    "specific_observations",
    "recommendations",
    "quantified_features",
    "quantified_traits",
    "confidence_score",
  ],
  additionalProperties: false,
}

function formatAnalysisForDisplay(
  analysis: EnhancedGraphologyAnalysis
): string {
  const sections = [
    `🎯 **OVERALL ASSESSMENT** (Confidence: ${analysis.overall_assessment.confidence_level.toUpperCase()})`,
    `${analysis.overall_assessment.overall_personality_summary}`,
    ``,
    `📊 **QUANTIFIED PERSONALITY TRAITS**`,
    `• Confidence: ${Math.round(analysis.quantified_traits.CNF * 100)}%`,
    `• Creativity: ${Math.round(analysis.quantified_traits.CRT * 100)}%`,
    `• Emotional Expression: ${Math.round(
      analysis.quantified_traits.EMX * 100
    )}%`,
    `• Discipline: ${Math.round(analysis.quantified_traits.DSC * 100)}%`,
    `• Social Openness: ${Math.round(analysis.quantified_traits.SOC * 100)}%`,
    `• Mental Energy: ${Math.round(analysis.quantified_traits.NRG * 100)}%`,
    `• Intuition: ${Math.round(analysis.quantified_traits.INT * 100)}%`,
    `• Independence: ${Math.round(analysis.quantified_traits.IND * 100)}%`,
    ``,
    `📝 **HANDWRITING CHARACTERISTICS**`,
    `• Size: ${analysis.writing_characteristics.size}`,
    `• Slant: ${analysis.writing_characteristics.slant}`,
    `• Pressure: ${analysis.writing_characteristics.pressure}`,
    `• Spacing: ${analysis.writing_characteristics.spacing}`,
    `• Margins: ${analysis.writing_characteristics.margins}`,
    `• Baseline: ${analysis.writing_characteristics.baseline}`,
    ``,
    `🧠 **PERSONALITY INSIGHTS**`,
    `• Emotional Stability: ${analysis.personality_traits.emotional_stability}`,
    `• Social Orientation: ${analysis.personality_traits.social_orientation}`,
    `• Thinking Style: ${analysis.personality_traits.thinking_style}`,
    `• Communication: ${analysis.personality_traits.communication_style}`,
    `• Attention to Detail: ${analysis.personality_traits.attention_to_detail}`,
  ]

  if (
    analysis.specific_observations &&
    analysis.specific_observations.length > 0
  ) {
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
      analysis.recommendations.strengths_to_leverage.forEach((strength) => {
        sections.push(`• ${strength}`)
      })
    }

    if (analysis.recommendations.areas_for_development.length > 0) {
      sections.push(``, `**Areas for Development:**`)
      analysis.recommendations.areas_for_development.forEach((area) => {
        sections.push(`• ${area}`)
      })
    }
  }

  return sections.join("\n")
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured")
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (authError || !user) {
      throw new Error("Invalid authentication")
    }

    // Parse request
    const { imageBase64, prompt }: AnalyzeHandwritingRequest = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Image data is required",
        } as AnalysisResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Enhanced system prompt for quantified analysis
    const systemPrompt = `You are Dr. Sarah Mitchell, a world-renowned expert graphologist with over 20 years of experience in handwriting analysis. You hold a PhD in Psychology with a specialization in personality assessment through graphology.

Your task is to provide BOTH qualitative insights AND quantified measurements. For each handwriting sample, you must:

1. Extract quantified features (0-1 scale):
   - SLN (Slant): 0 = left slant, 0.5 = vertical, 1 = right slant
   - WSP (Word spacing): 0 = tight, 1 = wide
   - LSZ (Letter size): 0 = small, 1 = large
   - BLN (Baseline stability): 0 = stable, 1 = wavy/erratic
   - MLM (Left margin): 0 = narrow, 1 = wide
   - PRT (Pressure): 0 = light, 1 = dark/heavy
   - LSP (Letter spacing): 0 = tight, 1 = loose
   - LCR (Curvature): 0 = angular, 1 = rounded
   - CNT (Connectedness): 0 = disconnected, 1 = fully connected
   - RHM (Rhythm): 0 = slow/hesitant, 1 = fast/fluent

2. Derive personality traits (0-1 scale):
   - CNF (Confidence): from size + pressure
   - EMX (Emotional expressiveness): from slant + rhythm
   - CRT (Creativity): from curvature + irregularity
   - DSC (Discipline): from baseline + margins
   - SOC (Social openness): from spacing + slant
   - NRG (Mental energy): from pressure + rhythm
   - INT (Intuition): from disconnectedness + curvature
   - IND (Independence): from connectedness + spacing

3. Provide a confidence score (0-1) based on image quality and handwriting clarity.

Be precise with your quantified measurements while maintaining your professional qualitative analysis.`

    const userPrompt =
      prompt ||
      `Please analyze this handwriting sample and provide a comprehensive graphological assessment with both qualitative insights and precise quantified measurements.

Examine all aspects including letter formation, spacing, pressure, slant, baseline, and overall organization. Provide specific quantified values for all features and derived personality traits.`

    // OpenAI API request
    const openaiRequest = {
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "enhanced_graphology_analysis",
          schema: enhancedGraphologySchema,
        },
      },
      max_tokens: 3000,
      temperature: 0.2,
    }

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(openaiRequest),
      }
    )

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const rawAnalysis = openaiData.choices[0]?.message?.content

    if (!rawAnalysis) {
      throw new Error("No analysis received from OpenAI")
    }

    let structuredAnalysis: EnhancedGraphologyAnalysis
    try {
      structuredAnalysis = JSON.parse(rawAnalysis)
    } catch (parseError) {
      console.error("Failed to parse structured output:", parseError)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to parse analysis results",
          raw_analysis: rawAnalysis,
        } as AnalysisResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Calculate derived metrics
    const features = structuredAnalysis.quantified_features
    const traits = structuredAnalysis.quantified_traits
    const overallScore = calculateOverallScore(traits)
    const confidenceScore = structuredAnalysis.confidence_score
    const formattedAnalysis = formatAnalysisForDisplay(structuredAnalysis)
    const processingTime = Date.now() - startTime

    // Save to database
    const { data: analysisRecord, error: dbError } = await supabase
      .from("handwriting_checkins")
      .insert({
        user_id: user.id,
        image_url: `data:image/jpeg;base64,${imageBase64}`, // Store base64 for now
        features,
        traits,
        overall_score: overallScore,
        confidence_score: confidenceScore,
        ai_analysis: structuredAnalysis,
        gpt_summary: formattedAnalysis,
        processing_time_ms: processingTime,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      throw new Error(`Failed to save analysis: ${dbError.message}`)
    }

    // Update user profile stats
    await supabase.rpc("update_user_stats", {
      p_user_id: user.id,
      p_new_analysis: true,
    })

    // Update personality snapshot for today
    await supabase.rpc("update_personality_snapshot", {
      p_user_id: user.id,
    })

    // Set baseline traits if this is the user's first analysis
    const { data: profile } = await supabase
      .from("profiles")
      .select("baseline_traits, total_analyses")
      .eq("id", user.id)
      .single()

    if (profile && (!profile.baseline_traits || profile.total_analyses === 1)) {
      await supabase
        .from("profiles")
        .update({
          baseline_traits: traits,
          last_analysis_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", user.id)
    }

    // Return comprehensive response
    const response: AnalysisResponse = {
      success: true,
      analysis_id: analysisRecord.id,
      analysis: structuredAnalysis,
      formatted_analysis: formattedAnalysis,
      features,
      traits,
      overall_score: overallScore,
      confidence_score: confidenceScore,
      timestamp: new Date().toISOString(),
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in analyze-handwriting-enhanced function:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      } as AnalysisResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
