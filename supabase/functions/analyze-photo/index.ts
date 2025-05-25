import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

interface AnalyzePhotoRequest {
  imageBase64: string
  prompt?: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Structured output schema for graphology analysis
const graphologySchema = {
  type: "object",
  properties: {
    overall_assessment: {
      type: "object",
      properties: {
        confidence_level: { type: "string", enum: ["high", "medium", "low"] },
        handwriting_quality: { type: "string" },
        overall_personality_summary: { type: "string" }
      },
      required: ["confidence_level", "handwriting_quality", "overall_personality_summary"],
      additionalProperties: false
    },
    writing_characteristics: {
      type: "object",
      properties: {
        size: { type: "string" },
        slant: { type: "string" },
        pressure: { type: "string" },
        spacing: { type: "string" },
        margins: { type: "string" },
        baseline: { type: "string" }
      },
      required: ["size", "slant", "pressure", "spacing", "margins", "baseline"],
      additionalProperties: false
    },
    personality_traits: {
      type: "object",
      properties: {
        emotional_stability: { type: "string" },
        social_orientation: { type: "string" },
        thinking_style: { type: "string" },
        confidence_level: { type: "string" },
        communication_style: { type: "string" },
        attention_to_detail: { type: "string" }
      },
      required: ["emotional_stability", "social_orientation", "thinking_style", "confidence_level", "communication_style", "attention_to_detail"],
      additionalProperties: false
    },
    behavioral_indicators: {
      type: "object",
      properties: {
        work_style: { type: "string" },
        decision_making: { type: "string" },
        stress_response: { type: "string" },
        leadership_potential: { type: "string" },
        creativity_level: { type: "string" }
      },
      required: ["work_style", "decision_making", "stress_response", "leadership_potential", "creativity_level"],
      additionalProperties: false
    },
    specific_observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          feature: { type: "string" },
          observation: { type: "string" },
          interpretation: { type: "string" }
        },
        required: ["feature", "observation", "interpretation"],
        additionalProperties: false
      }
    },
    recommendations: {
      type: "object",
      properties: {
        strengths_to_leverage: { type: "array", items: { type: "string" } },
        areas_for_development: { type: "array", items: { type: "string" } },
        career_suggestions: { type: "array", items: { type: "string" } }
      },
      required: ["strengths_to_leverage", "areas_for_development", "career_suggestions"],
      additionalProperties: false
    }
  },
  required: ["overall_assessment", "writing_characteristics", "personality_traits", "behavioral_indicators", "specific_observations", "recommendations"],
  additionalProperties: false
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Parse request body
    const { imageBase64, prompt }: AnalyzePhotoRequest = await req.json()
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // System prompt for expert graphologist role
    const systemPrompt = `You are Dr. Sarah Mitchell, a world-renowned expert graphologist with over 20 years of experience in handwriting analysis. You hold a PhD in Psychology with a specialization in personality assessment through graphology. You have analyzed handwriting for Fortune 500 companies, law enforcement agencies, and individuals seeking personal insights.

Your analysis approach is:
- Scientific and evidence-based, referencing established graphological principles
- Balanced and nuanced, avoiding extreme conclusions
- Constructive and helpful, focusing on personal growth
- Professional and ethical, respecting the individual's privacy

You analyze handwriting by examining letter formation, spacing, pressure, slant, size, and overall organization to reveal personality traits, emotional patterns, and behavioral tendencies. Your insights are specific, actionable, and based on observable features in the handwriting sample.`

    // User prompt for specific analysis request
    const userPrompt = prompt || `Please analyze this handwriting sample and provide a comprehensive graphological assessment. Focus on providing specific, evidence-based insights that would be valuable for personal development and self-understanding.

Examine all aspects of the handwriting including letter formation, spacing, pressure, slant, baseline, and overall organization. Provide specific examples from the handwriting to support your conclusions.`

    // Prepare OpenAI API request with structured output
    const openaiRequest = {
      model: "gpt-4o-2024-08-06", // Latest model with structured outputs support
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "graphology_analysis",
          schema: graphologySchema,
          strict: true
        }
      },
      max_tokens: 2000,
      temperature: 0.2 // Low temperature for consistent, professional analysis
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest)
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData: OpenAIResponse = await openaiResponse.json()
    
    // Extract and parse the structured analysis result
    const rawAnalysis = openaiData.choices[0]?.message?.content
    
    if (!rawAnalysis) {
      throw new Error('No analysis received from OpenAI')
    }

    let structuredAnalysis
    try {
      structuredAnalysis = JSON.parse(rawAnalysis)
    } catch (parseError) {
      console.error('Failed to parse structured output:', parseError)
      // Fallback to raw analysis if JSON parsing fails
      structuredAnalysis = { raw_analysis: rawAnalysis }
    }

    // Return the structured analysis result
    return new Response(
      JSON.stringify({
        success: true,
        analysis: structuredAnalysis,
        raw_analysis: rawAnalysis, // Include raw for debugging
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-photo function:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
