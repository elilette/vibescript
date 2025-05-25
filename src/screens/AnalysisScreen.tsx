import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import GradientBackground from "../components/GradientBackground"
import { PersonalityTrait } from "../types"

const mockPersonalityTraits: PersonalityTrait[] = [
  { name: "Creativity", score: 87, color: "#EC4899", icon: "bulb" },
  {
    name: "Emotional Intelligence",
    score: 92,
    color: "#F97316",
    icon: "heart",
  },
  { name: "Leadership", score: 78, color: "#3B82F6", icon: "star" },
  { name: "Social Skills", score: 85, color: "#10B981", icon: "people" },
  {
    name: "Analytical Thinking",
    score: 90,
    color: "#8B5CF6",
    icon: "analytics",
  },
  { name: "Energy Level", score: 83, color: "#F59E0B", icon: "flash" },
]

interface TraitCardProps {
  trait: PersonalityTrait
}

const TraitCard: React.FC<TraitCardProps> = ({ trait }) => {
  return (
    <View style={styles.traitCard}>
      <View style={styles.traitHeader}>
        <View style={styles.traitIcon}>
          <Ionicons name={trait.icon as any} size={20} color="#ffffff" />
        </View>
        <Text style={styles.traitName}>{trait.name}</Text>
        <Text style={styles.traitScore}>{trait.score}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${trait.score}%`, backgroundColor: trait.color },
            ]}
          />
        </View>
      </View>
    </View>
  )
}

export default function AnalysisScreen() {
  const getScoreInterpretation = (score: number) => {
    if (score >= 90) return { text: "Exceptional", color: "#10B981" }
    if (score >= 80) return { text: "Strong", color: "#3B82F6" }
    if (score >= 70) return { text: "Good", color: "#F59E0B" }
    if (score >= 60) return { text: "Moderate", color: "#F97316" }
    return { text: "Developing", color: "#EF4444" }
  }

  const averageScore = Math.round(
    mockPersonalityTraits.reduce((sum, trait) => sum + trait.score, 0) /
      mockPersonalityTraits.length
  )

  const interpretation = getScoreInterpretation(averageScore)

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Personality Profile</Text>
            <Text style={styles.subtitle}>
              Here's what your handwriting reveals about your unique personality
            </Text>
          </View>

          <View style={styles.overallScoreCard}>
            <Text style={styles.overallScoreLabel}>
              Overall Personality Score
            </Text>
            <View style={styles.overallScoreContainer}>
              <Text style={styles.overallScoreValue}>{averageScore}%</Text>
              <Text
                style={[
                  styles.overallScoreInterpretation,
                  { color: interpretation.color },
                ]}
              >
                {interpretation.text}
              </Text>
            </View>
          </View>

          <View style={styles.traitsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color="#ffffff" />
              <Text style={styles.sectionTitle}>Personality Traits</Text>
            </View>

            {mockPersonalityTraits.map((trait, index) => (
              <TraitCard key={index} trait={trait} />
            ))}
          </View>

          <View style={styles.insightsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={24} color="#ffffff" />
              <Text style={styles.sectionTitle}>Key Insights</Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🎨 Creative Powerhouse</Text>
              <Text style={styles.insightText}>
                Your handwriting shows strong creative tendencies. You think
                outside the box and approach problems with innovative solutions.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>🧠 Analytical Mind</Text>
              <Text style={styles.insightText}>
                You possess excellent analytical skills, showing systematic
                thinking and attention to detail in your writing patterns.
              </Text>
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>
                ❤️ Emotionally Intelligent
              </Text>
              <Text style={styles.insightText}>
                High emotional intelligence is evident in your writing,
                suggesting strong empathy and social awareness.
              </Text>
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
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  overallScoreCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  overallScoreLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
  },
  overallScoreContainer: {
    alignItems: "center",
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
  },
  overallScoreInterpretation: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
  traitsSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 10,
  },
  traitCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  traitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  traitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  traitName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  traitScore: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  progressBarContainer: {
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
})
