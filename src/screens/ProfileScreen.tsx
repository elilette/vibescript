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
          {/* User Header with Cover */}
          <View style={styles.profileCover}>
            <LinearGradient
              colors={[
                "rgba(236, 72, 153, 0.8)",
                "rgba(139, 92, 246, 0.8)",
                "rgba(59, 130, 246, 0.8)",
              ]}
              style={styles.coverGradient}
            />
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
                <View style={styles.statusBadge}>
                  <Ionicons name="sparkles" size={12} color="#ffffff" />
                </View>
              </View>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userSubtitle}>
                VibeScript Explorer since {createdAt}
              </Text>
              <View style={styles.userLevel}>
                <Ionicons name="trophy" size={16} color="#FFD700" />
                <Text style={styles.levelText}>
                  {profileStats.totalAnalyses < 5
                    ? "Beginner"
                    : profileStats.totalAnalyses < 15
                    ? "Explorer"
                    : profileStats.totalAnalyses < 30
                    ? "Expert"
                    : "Master"}
                </Text>
              </View>
            </View>
          </View>

          {/* Enhanced Stats Cards */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="document-text" size={24} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.totalAnalyses}
                </Text>
                <Text style={styles.statLabel}>Analyses</Text>
                <Text style={styles.statSubtext}>Total completed</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.currentStreak}
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
                <Text style={styles.statSubtext}>Keep it up!</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name="star" size={24} color="#8B5CF6" />
                </View>
                <Text style={styles.statNumber}>
                  {profileStats.averageScore}%
                </Text>
                <Text style={styles.statLabel}>Avg Score</Text>
                <Text style={styles.statSubtext}>Confidence level</Text>
              </View>
            </View>
          </View>

          {/* Personality Radar Chart */}
          <View style={styles.radarSection}>
            <Text style={styles.sectionTitle}>
              {latestTraits
                ? "Your unique personality signature"
                : "Your Personality Profile"}
            </Text>
            {latestTraits ? (
              <View style={styles.radarContainer}>
                <RadarChart traits={latestTraits} />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <View style={styles.noDataIcon}>
                  <Ionicons
                    name="analytics-outline"
                    size={48}
                    color="rgba(255, 255, 255, 0.5)"
                  />
                </View>
                <Text style={styles.noDataTitle}>
                  Discover Your Personality
                </Text>
                <Text style={styles.noDataText}>
                  Complete your first handwriting analysis to unlock your unique
                  personality radar and discover what your writing reveals about
                  you!
                </Text>
                <TouchableOpacity style={styles.analyzeButton}>
                  <Ionicons name="sparkles" size={16} color="#ffffff" />
                  <Text style={styles.analyzeButtonText}>
                    Start Your Journey
                  </Text>
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
  profileCover: {
    position: "relative",
    marginBottom: 30,
  },
  coverGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
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
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
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
  userLevel: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  levelText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 5,
  },
  statsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
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
  statIconContainer: {
    marginBottom: 10,
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
  statSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  radarSection: {
    marginBottom: 30,
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
  noDataIcon: {
    marginBottom: 15,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  analyzeButton: {
    backgroundColor: "#EC4899",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 5,
  },
})
