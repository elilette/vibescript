import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import GradientBackground from "../components/GradientBackground"
import RadarChart from "../components/RadarChart"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabase"
import { PersonalityTraits } from "../types/analysis"
import { triggerTapHaptic } from "../utils/haptics"

// Trait explanations
const traitExplanations = {
  CNF: {
    name: "Confidence",
    description:
      "Your self-assurance and belief in your abilities. Higher confidence shows in clearer, more assertive handwriting with consistent pressure and bold strokes.",
  },
  CRT: {
    name: "Creativity",
    description:
      "Your imaginative thinking and artistic expression. Creative individuals show unique flourishes, unconventional letter formations, and expressive writing styles.",
  },
  EMX: {
    name: "Emotional",
    description:
      "Your emotional expressiveness and sensitivity. This reflects how openly you express feelings, often shown through varied pressure and flowing connections.",
  },
  DSC: {
    name: "Discipline",
    description:
      "Your self-control and organizational abilities. Disciplined writers show consistent letter spacing, uniform sizing, and structured writing patterns.",
  },
  SOC: {
    name: "Social",
    description:
      "Your interpersonal skills and social engagement. Social individuals have flowing, connected handwriting that reflects their desire to communicate and connect.",
  },
  NRG: {
    name: "Energy",
    description:
      "Your vitality and drive for action. High energy manifests as dynamic pressure variations, animated letter forms, and enthusiastic writing rhythm.",
  },
  INT: {
    name: "Intuition",
    description:
      "Your instinctive understanding and insight. Intuitive thinkers show abstract or flowing elements, creative connections, and unique personal style markers.",
  },
  IND: {
    name: "Independence",
    description:
      "Your self-reliance and autonomous thinking. Independent individuals have distinctive, personalized handwriting that stands apart from conventional styles.",
  },
}

const getGeneralAnalysis = (traits: PersonalityTraits) => {
  const traitKeys = Object.keys(traits) as (keyof PersonalityTraits)[]
  const values = traitKeys.map((key) => ({ key, value: traits[key] }))
  const sortedTraits = values.sort((a, b) => b.value - a.value)

  const topTraits = sortedTraits.slice(0, 3)
  const topTraitNames = topTraits
    .map((t) => traitExplanations[t.key].name)
    .join(", ")

  return {
    title: "Your Personality Overview",
    description: `Your handwriting reveals a unique blend of ${topTraitNames}. This combination creates a distinctive personality profile that influences how you approach life, relationships, and challenges.`,
  }
}

export default function ProfileScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedTrait, setSelectedTrait] = useState<
    keyof PersonalityTraits | "general"
  >("general")
  const [latestTraits, setLatestTraits] = useState<PersonalityTraits | null>(
    null
  )
  const [profileStats, setProfileStats] = useState({
    totalAnalyses: 0,
    currentStreak: 0,
    averageScore: 0,
  })

  useEffect(() => {
    if (user) {
      fetchLatestAnalysis()
      fetchProfileStats()
    }
  }, [user])

  // Refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchLatestAnalysis()
        fetchProfileStats()
      }
    }, [user])
  )

  const fetchLatestAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from("handwriting_checkins")
        .select("traits, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching latest analysis:", error)
        return
      }

      if (data) {
        setLatestTraits(data.traits)
      }
    } catch (error) {
      console.error("Error fetching latest analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileStats = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("total_analyses, current_streak, average_score")
        .eq("id", user?.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile stats:", error)
        return
      }

      if (data) {
        setProfileStats({
          totalAnalyses: data.total_analyses || 0,
          currentStreak: data.current_streak || 0,
          averageScore: Math.round(data.average_score || 0),
        })
      }
    } catch (error) {
      console.error("Error fetching profile stats:", error)
    }
  }

  const handleTraitSelect = (traitKey: keyof PersonalityTraits | "general") => {
    triggerTapHaptic()
    setSelectedTrait(selectedTrait === traitKey ? "general" : traitKey)
  }

  const handleCenterTap = () => {
    triggerTapHaptic()
    setSelectedTrait("general")
  }

  if (!user || loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  const generalAnalysis = latestTraits ? getGeneralAnalysis(latestTraits) : null

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Personality</Text>
        </View>

        <View style={styles.content}>
          {/* Personality Radar Chart */}
          <View style={styles.radarSection}>
            {latestTraits ? (
              <View style={styles.radarContainer}>
                <RadarChart
                  traits={latestTraits}
                  onTraitSelect={handleTraitSelect}
                  onCenterTap={handleCenterTap}
                  selectedTrait={
                    selectedTrait === "general" ? null : selectedTrait
                  }
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons
                  name="analytics-outline"
                  size={48}
                  color="rgba(255, 255, 255, 0.3)"
                />
                <Text style={styles.sectionTitle}>No Data Available</Text>
                <Text style={styles.loadingText}>
                  Complete a handwriting analysis to see your personality radar
                </Text>
              </View>
            )}
          </View>

          {/* Trait Explanation */}
          {latestTraits && (
            <View style={styles.explanationSection}>
              {selectedTrait === "general" && generalAnalysis ? (
                <>
                  <Text style={styles.explanationTitle}>
                    {generalAnalysis.title}
                  </Text>
                  <Text style={styles.explanationText}>
                    {generalAnalysis.description}
                  </Text>
                </>
              ) : selectedTrait && selectedTrait !== "general" ? (
                <>
                  <Text style={styles.explanationTitle}>
                    {traitExplanations[selectedTrait].name}
                  </Text>
                  <Text style={styles.explanationText}>
                    {traitExplanations[selectedTrait].description}
                  </Text>
                </>
              ) : null}
            </View>
          )}

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="analytics" size={24} color="#4ECDC4" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.totalAnalyses}
                </Text>
                <Text style={styles.statLabel}>Analyses</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="trending-up" size={24} color="#45B7D1" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.averageScore
                    ? `${profileStats.averageScore}%`
                    : "–"}
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="calendar" size={24} color="#96CEB4" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.currentStreak || "–"}
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 120, // Space for tab navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#ffffff",
  },
  radarSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
    textAlign: "center",
  },
  statsSection: {
    marginBottom: 0,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    aspectRatio: 1,
  },
  statIconContainer: {
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    textAlign: "center",
  },
  radarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },
  noDataContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },
  noDataIcon: {
    marginBottom: 15,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  analyzeButton: {
    backgroundColor: "#EC4899",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 5,
  },
  explanationSection: {
    marginBottom: 20,
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
    height: 22,
  },
  explanationText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
    height: 60,
  },
})
