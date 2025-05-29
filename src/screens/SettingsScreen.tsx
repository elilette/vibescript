import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import GradientBackground from "../components/GradientBackground"
import { useAuth } from "../context/AuthContext"
import { triggerTapHaptic } from "../utils/haptics"
import { supabase } from "../services/supabase"

export default function SettingsScreen() {
  const { user, signOut } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [profileStats, setProfileStats] = useState({
    totalAnalyses: 0,
    currentStreak: 0,
    averageScore: 0,
  })

  useEffect(() => {
    if (user) {
      fetchProfileStats()
    }
  }, [user])

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

  const handleSignOut = () => {
    triggerTapHaptic()
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
          } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  if (!user) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  // Extract user data from Supabase Auth
  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const avatarUrl = user.user_metadata?.avatar_url
  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

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

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => triggerTapHaptic()}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => triggerTapHaptic()}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Privacy</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => triggerTapHaptic()}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="log-out" size={20} color="#EF4444" />
                <Text style={[styles.settingLabel, { color: "#EF4444" }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
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
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
    fontWeight: "500",
  },
})
