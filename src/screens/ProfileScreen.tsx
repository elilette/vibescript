import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import GradientBackground from "../components/GradientBackground"
import RadarChart from "../components/RadarChart"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabase"
import { PersonalityTraits } from "../types/analysis"

export default function ProfileScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
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
          averageScore: Math.round(data.average_score || 0), // Already converted to percentage in DB
        })
      }
    } catch (error) {
      console.error("Error fetching profile stats:", error)
    }
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

  // Extract user data from Supabase Auth
  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const avatarUrl = user.user_metadata?.avatar_url
  const email = user.email
  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* User Header */}
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              {avatarUrl && !imageError ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  onError={() => setImageError(true)}
                />
              ) : (
                <LinearGradient
                  colors={["#EC4899", "#8B5CF6", "#3B82F6"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userSubtitle}>
              VibeScript Explorer since {createdAt}
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {profileStats.totalAnalyses}
              </Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {profileStats.currentStreak}
              </Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {profileStats.averageScore}%
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>

          {/* Personality Radar Chart */}
          <View style={styles.radarSection}>
            <Text style={styles.sectionTitle}>
              {latestTraits ? "Latest Analysis" : "Your Personality Profile"}
            </Text>
            {latestTraits ? (
              <View style={styles.radarContainer}>
                <RadarChart traits={latestTraits} />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons
                  name="analytics-outline"
                  size={48}
                  color="rgba(255, 255, 255, 0.5)"
                />
                <Text style={styles.noDataText}>
                  Complete your first handwriting analysis to see your
                  personality radar!
                </Text>
                <TouchableOpacity style={styles.analyzeButton}>
                  <Text style={styles.analyzeButtonText}>Start Analysis</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  userHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  userSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  radarSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  radarContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  noDataContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  analyzeButton: {
    backgroundColor: "#EC4899",
    padding: 15,
    borderRadius: 10,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
})
