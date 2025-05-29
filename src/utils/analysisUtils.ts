import { supabase } from "../services/supabase"
import {
  HandwritingCheckin,
  PersonalitySnapshot,
  TraitTrend,
  PersonalityTraits,
  ChartDataPoint,
} from "../types/analysis"

// Get comprehensive analysis data using Data API
export async function getAnalysisData(userId: string) {
  try {
    // Get latest analysis
    const { data: latestAnalysis, error: latestError } = await supabase
      .from("handwriting_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (latestError && latestError.code !== "PGRST116") {
      console.error("Error fetching latest analysis:", latestError)
    }

    // Get personality snapshots for the last 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const { data: snapshots, error: snapshotsError } = await supabase
      .from("personality_snapshots")
      .select("*")
      .eq("user_id", userId)
      .gte("snapshot_date", startDate.toISOString().split("T")[0])
      .order("snapshot_date", { ascending: true })

    if (snapshotsError) {
      console.error("Error fetching snapshots:", snapshotsError)
    }

    // Get recent checkins for trend calculation if snapshots are empty
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from("handwriting_checkins")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (checkinsError) {
      console.error("Error fetching recent checkins:", checkinsError)
    }

    // Calculate trait trends - use snapshots if available, otherwise use checkins
    let traitTrends: TraitTrend[] = []
    if (snapshots && snapshots.length > 0) {
      console.log("Using snapshots for trends:", snapshots.length)
      traitTrends = calculateTraitTrends(snapshots)
    } else if (recentCheckins && recentCheckins.length > 0) {
      console.log("Using checkins for trends:", recentCheckins.length)
      traitTrends = calculateTraitTrendsFromCheckins(recentCheckins)
    } else {
      console.log("No data available for trends")
    }

    console.log("Generated trait trends:", traitTrends.length)

    return {
      success: true,
      latestAnalysis: latestAnalysis || null,
      snapshots: snapshots || [],
      traitTrends,
      recentCheckins: recentCheckins || [],
      hasData: latestAnalysis !== null,
    }
  } catch (error) {
    console.error("Error getting analysis data:", error)
    return {
      success: false,
      latestAnalysis: null,
      snapshots: [],
      traitTrends: [],
      recentCheckins: [],
      hasData: false,
    }
  }
}

// Calculate trait trends from personality snapshots
function calculateTraitTrends(snapshots: PersonalitySnapshot[]): TraitTrend[] {
  if (snapshots.length === 0) return []

  const traitNames: Record<keyof PersonalityTraits, string> = {
    CNF: "Confidence",
    EMX: "Emotional Expression",
    CRT: "Creativity",
    DSC: "Discipline",
    SOC: "Social Openness",
    NRG: "Mental Energy",
    INT: "Intuition",
    IND: "Independence",
  }

  const traitColors: Record<keyof PersonalityTraits, string> = {
    CNF: "#3B82F6", // Blue
    EMX: "#EC4899", // Pink
    CRT: "#8B5CF6", // Purple
    DSC: "#10B981", // Green
    SOC: "#F59E0B", // Orange
    NRG: "#EF4444", // Red
    INT: "#06B6D4", // Cyan
    IND: "#84CC16", // Lime
  }

  const trends: TraitTrend[] = []

  // Process each trait
  Object.keys(traitNames).forEach((traitCode) => {
    const trait = traitCode as keyof PersonalityTraits
    const dataPoints: ChartDataPoint[] = snapshots.map((snapshot) => ({
      date: snapshot.snapshot_date,
      value: snapshot.avg_traits[trait] || 0,
    }))

    if (dataPoints.length === 0) return

    const currentValue = dataPoints[dataPoints.length - 1].value
    let changePercentage = 0
    let trendDirection: "up" | "down" | "stable" = "stable"

    // Calculate trend if we have multiple data points
    if (dataPoints.length >= 2) {
      const firstValue = dataPoints[0].value
      const lastValue = dataPoints[dataPoints.length - 1].value

      if (firstValue > 0) {
        changePercentage = ((lastValue - firstValue) / firstValue) * 100

        if (Math.abs(changePercentage) < 2) {
          trendDirection = "stable"
        } else if (changePercentage > 0) {
          trendDirection = "up"
        } else {
          trendDirection = "down"
        }
      }
    }

    trends.push({
      trait_code: trait,
      trait_name: traitNames[trait],
      current_value: currentValue,
      data_points: dataPoints,
      change_percentage: changePercentage,
      trend_direction: trendDirection,
      color: traitColors[trait],
    })
  })

  return trends
}

// Calculate trait trends from handwriting checkins
function calculateTraitTrendsFromCheckins(
  checkins: HandwritingCheckin[]
): TraitTrend[] {
  if (checkins.length === 0) return []

  // Sort checkins by date (ascending) for proper trend visualization
  const sortedCheckins = [...checkins].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const traitNames: Record<keyof PersonalityTraits, string> = {
    CNF: "Confidence",
    EMX: "Emotional Expression",
    CRT: "Creativity",
    DSC: "Discipline",
    SOC: "Social Openness",
    NRG: "Mental Energy",
    INT: "Intuition",
    IND: "Independence",
  }

  const traitColors: Record<keyof PersonalityTraits, string> = {
    CNF: "#3B82F6", // Blue
    EMX: "#EC4899", // Pink
    CRT: "#8B5CF6", // Purple
    DSC: "#10B981", // Green
    SOC: "#F59E0B", // Orange
    NRG: "#EF4444", // Red
    INT: "#06B6D4", // Cyan
    IND: "#84CC16", // Lime
  }

  const trends: TraitTrend[] = []

  // Process each trait
  Object.keys(traitNames).forEach((traitCode) => {
    const trait = traitCode as keyof PersonalityTraits
    const dataPoints: ChartDataPoint[] = sortedCheckins.map((checkin) => ({
      date: checkin.created_at,
      value: checkin.traits[trait] || 0,
    }))

    if (dataPoints.length === 0) return

    const currentValue = dataPoints[dataPoints.length - 1].value
    let changePercentage = 0
    let trendDirection: "up" | "down" | "stable" = "stable"

    // Calculate trend if we have multiple data points
    if (dataPoints.length >= 2) {
      const firstValue = dataPoints[0].value
      const lastValue = dataPoints[dataPoints.length - 1].value

      if (firstValue > 0) {
        changePercentage = ((lastValue - firstValue) / firstValue) * 100

        if (Math.abs(changePercentage) < 2) {
          trendDirection = "stable"
        } else if (changePercentage > 0) {
          trendDirection = "up"
        } else {
          trendDirection = "down"
        }
      }
    }

    trends.push({
      trait_code: trait,
      trait_name: traitNames[trait],
      current_value: currentValue,
      data_points: dataPoints,
      change_percentage: changePercentage,
      trend_direction: trendDirection,
      color: traitColors[trait],
    })
  })

  return trends
}

// Convert quantified traits to display format for UI
export function convertTraitsToDisplay(traits: PersonalityTraits) {
  const traitMappings = [
    { code: "CNF", name: "Confidence", icon: "star", color: "#3B82F6" },
    {
      code: "EMX",
      name: "Emotional Expression",
      icon: "heart",
      color: "#EC4899",
    },
    { code: "CRT", name: "Creativity", icon: "bulb", color: "#8B5CF6" },
    {
      code: "DSC",
      name: "Discipline",
      icon: "checkmark-circle",
      color: "#10B981",
    },
    { code: "SOC", name: "Social Openness", icon: "people", color: "#F59E0B" },
    { code: "NRG", name: "Mental Energy", icon: "flash", color: "#EF4444" },
    { code: "INT", name: "Intuition", icon: "eye", color: "#06B6D4" },
    { code: "IND", name: "Independence", icon: "person", color: "#84CC16" },
  ]

  return traitMappings.map((mapping) => ({
    name: mapping.name,
    score: Math.round(
      (traits[mapping.code as keyof PersonalityTraits] || 0) * 100
    ),
    color: mapping.color,
    icon: mapping.icon,
  }))
}
