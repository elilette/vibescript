import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import GradientBackground from "../components/GradientBackground"
import { useApp } from "../context/AppContext"
import { Achievement, PersonalityVibe } from "../types"

const mockAchievements: Achievement[] = [
  {
    id: "1",
    title: "First Analysis",
    description: "Completed your first handwriting analysis",
    icon: "star",
    color: "#F59E0B",
    unlocked: true,
    unlocked_at: "2024-03-01",
  },
  {
    id: "2",
    title: "7-Day Streak",
    description: "Analyzed handwriting for 7 consecutive days",
    icon: "calendar",
    color: "#F59E0B",
    unlocked: true,
    unlocked_at: "2024-03-07",
  },
  {
    id: "3",
    title: "Creative Genius",
    description: "Achieved 90%+ creativity score",
    icon: "trophy",
    color: "#6B7280",
    unlocked: false,
  },
  {
    id: "4",
    title: "Journal Master",
    description: "Write 30 journal entries",
    icon: "medal",
    color: "#6B7280",
    unlocked: false,
  },
]

const mockPersonalityVibe: PersonalityVibe = {
  creativity: 88,
  confidence: 92,
  focus: 78,
}

export default function ProfileScreen() {
  const { user } = useApp()

  if (!user) {
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

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* User Header */}
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#EC4899", "#8B5CF6", "#3B82F6"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userSubtitle}>
              VibeScript Explorer since March 2024
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.total_analyses}</Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.current_streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.average_score}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>

          {/* Personality Vibe */}
          <View style={styles.vibeSection}>
            <Text style={styles.sectionTitle}>Your Personality Vibe</Text>
            <View style={styles.vibeCard}>
              <View style={styles.vibeItem}>
                <View style={styles.vibeHeader}>
                  <Text style={styles.vibeName}>Creativity</Text>
                  <Text style={styles.vibeScore}>
                    {mockPersonalityVibe.creativity}%
                  </Text>
                </View>
                <View style={styles.vibeBarContainer}>
                  <View style={styles.vibeBarBackground}>
                    <View
                      style={[
                        styles.vibeBarFill,
                        {
                          width: `${mockPersonalityVibe.creativity}%`,
                          backgroundColor: "#EC4899",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.vibeItem}>
                <View style={styles.vibeHeader}>
                  <Text style={styles.vibeName}>Confidence</Text>
                  <Text style={styles.vibeScore}>
                    {mockPersonalityVibe.confidence}%
                  </Text>
                </View>
                <View style={styles.vibeBarContainer}>
                  <View style={styles.vibeBarBackground}>
                    <View
                      style={[
                        styles.vibeBarFill,
                        {
                          width: `${mockPersonalityVibe.confidence}%`,
                          backgroundColor: "#3B82F6",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.vibeItem}>
                <View style={styles.vibeHeader}>
                  <Text style={styles.vibeName}>Focus</Text>
                  <Text style={styles.vibeScore}>
                    {mockPersonalityVibe.focus}%
                  </Text>
                </View>
                <View style={styles.vibeBarContainer}>
                  <View style={styles.vibeBarBackground}>
                    <View
                      style={[
                        styles.vibeBarFill,
                        {
                          width: `${mockPersonalityVibe.focus}%`,
                          backgroundColor: "#10B981",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {mockAchievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.lockedAchievement,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementIcon,
                      {
                        backgroundColor: achievement.unlocked
                          ? achievement.color
                          : "#6B7280",
                      },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as any}
                      size={24}
                      color="#ffffff"
                    />
                  </View>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !achievement.unlocked && styles.lockedText,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      !achievement.unlocked && styles.lockedText,
                    ]}
                  >
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </View>
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
  },
  avatarText: {
    fontSize: 32,
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
  vibeSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  vibeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  vibeItem: {
    marginBottom: 20,
  },
  vibeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  vibeName: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  vibeScore: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "bold",
  },
  vibeBarContainer: {
    width: "100%",
  },
  vibeBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  vibeBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  achievementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 15,
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 5,
  },
  achievementDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 16,
  },
  lockedText: {
    color: "rgba(255, 255, 255, 0.5)",
  },
})
