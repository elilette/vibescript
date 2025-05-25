import { supabase } from "./supabase"
import { User } from "@supabase/supabase-js"

export interface ProfileData {
  id: string
  email: string | null
  name: string | null
  total_analyses: number
  current_streak: number
  average_score: number
  created_at: string
}

export interface ProfileStats {
  total_analyses: number
  current_streak: number
  average_score: number
}

export const profileService = {
  async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getProfile:", error)
      return null
    }
  },

  async createProfile(user: User): Promise<ProfileData | null> {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        total_analyses: 0,
        current_streak: 0,
        average_score: 0,
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert(profileData)
        .select("*")
        .single()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createProfile:", error)
      return null
    }
  },

  async getOrCreateProfile(user: User): Promise<ProfileData | null> {
    try {
      // First try to get existing profile
      let profile = await this.getProfile(user.id)

      if (profile) {
        return profile
      }

      // If no profile exists, create one using upsert to handle race conditions
      const profileData = {
        id: user.id,
        email: user.email,
        name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        total_analyses: 0,
        current_streak: 0,
        average_score: 0,
      }

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select("*")
        .single()

      if (error) {
        console.error("Error upserting profile:", error)
        // If upsert fails, try to get the existing profile
        return await this.getProfile(user.id)
      }

      return data
    } catch (error) {
      console.error("Error in getOrCreateProfile:", error)
      // Fallback: try to get existing profile
      return await this.getProfile(user.id)
    }
  },

  async updateProfileStats(
    userId: string,
    stats: Partial<ProfileStats>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(stats)
        .eq("id", userId)

      if (error) {
        console.error("Error updating profile stats:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in updateProfileStats:", error)
      return false
    }
  },

  async incrementAnalysisCount(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc("increment_analysis_count", {
        user_id: userId,
      })

      if (error) {
        console.error("Error incrementing analysis count:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in incrementAnalysisCount:", error)
      return false
    }
  },
}
