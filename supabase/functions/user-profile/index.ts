import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// TypeScript interfaces for request/response
interface CreateProfileRequest {
  full_name: string
  bio?: string
  avatar_url?: string
}

interface UpdateProfileRequest {
  full_name?: string
  bio?: string
  avatar_url?: string
}

interface ProfileResponse {
  id: string
  user_id: string
  email: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface ErrorResponse {
  error: string
  details?: string
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      })
    }

    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Extract and validate authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "No authorization header provided",
        } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Get user from JWT token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""))

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
          details: authError?.message,
        } as ErrorResponse),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const url = new URL(req.url)
    const method = req.method

    // Route handling based on HTTP method
    switch (method) {
      case "GET":
        return await handleGetProfile(supabase, user.id)

      case "POST":
        const createData: CreateProfileRequest = await req.json()
        return await handleCreateProfile(supabase, user, createData)

      case "PUT":
        const updateData: UpdateProfileRequest = await req.json()
        return await handleUpdateProfile(supabase, user.id, updateData)

      case "DELETE":
        return await handleDeleteProfile(supabase, user.id)

      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" } as ErrorResponse),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

// Handler functions for different operations
async function handleGetProfile(
  supabase: any,
  userId: string
): Promise<Response> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(
        JSON.stringify({ error: "Profile not found" } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: "Failed to fetch profile",
        details: error.message,
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  return new Response(JSON.stringify(profile as ProfileResponse), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function handleCreateProfile(
  supabase: any,
  user: any,
  data: CreateProfileRequest
): Promise<Response> {
  // Validate required fields
  if (!data.full_name || data.full_name.trim().length === 0) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: "full_name is required and cannot be empty",
      } as ErrorResponse),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existingProfile) {
    return new Response(
      JSON.stringify({
        error: "Profile already exists",
        details: "User already has a profile. Use PUT to update.",
      } as ErrorResponse),
      {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  // Create new profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: user.id,
        email: user.email,
        full_name: data.full_name.trim(),
        bio: data.bio?.trim() || null,
        avatar_url: data.avatar_url || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create profile",
        details: error.message,
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  return new Response(JSON.stringify(profile as ProfileResponse), {
    status: 201,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function handleUpdateProfile(
  supabase: any,
  userId: string,
  data: UpdateProfileRequest
): Promise<Response> {
  // Validate at least one field is provided
  if (!data.full_name && !data.bio && !data.avatar_url) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        details: "At least one field must be provided for update",
      } as ErrorResponse),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  // Prepare update data
  const updateData: any = {}
  if (data.full_name !== undefined) updateData.full_name = data.full_name.trim()
  if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null
  if (data.avatar_url !== undefined)
    updateData.avatar_url = data.avatar_url || null

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return new Response(
        JSON.stringify({ error: "Profile not found" } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: "Failed to update profile",
        details: error.message,
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  return new Response(JSON.stringify(profile as ProfileResponse), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function handleDeleteProfile(
  supabase: any,
  userId: string
): Promise<Response> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", userId)

  if (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to delete profile",
        details: error.message,
      } as ErrorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }

  return new Response(
    JSON.stringify({ message: "Profile deleted successfully" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  )
}
