import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import GradientBackground from "../components/GradientBackground"
import PersonalityChart from "../components/PersonalityChart"
import { PersonalityTrait } from "../types"
import {
  HandwritingCheckin,
  TraitTrend,
  PersonalitySnapshot,
} from "../types/analysis"
import { getAnalysisData, convertTraitsToDisplay } from "../utils/analysisUtils"
import { supabase } from "../services/supabase"

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
  const [loading, setLoading] = useState(true)
  const [analysisData, setAnalysisData] = useState<{
    latestAnalysis: HandwritingCheckin | null
    traitTrends: TraitTrend[]
    snapshots: PersonalitySnapshot[]
    hasData: boolean
  }>({
    latestAnalysis: null,
    traitTrends: [],
    snapshots: [],
    hasData: false,
  })
  const [selectedTrait, setSelectedTrait] = useState<string>("CNF")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysisData()
  }, [])

  const loadAnalysisData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to view your analysis")
        return
      }

      const data = await getAnalysisData(user.id)

      if (!data.success) {
        setError("Failed to load analysis data")
        return
      }

      setAnalysisData(data)

      // Set default selected trait to the first available trend
      if (data.traitTrends.length > 0) {
        setSelectedTrait(data.traitTrends[0].trait_code)
      }
    } catch (err) {
      console.error("Error loading analysis data:", err)
      setError("An error occurred while loading your analysis")
    } finally {
      setLoading(false)
    }
  }

  const getScoreInterpretation = (score: number) => {
    if (score >= 90) return { text: "Exceptional", color: "#10B981" }
    if (score >= 80) return { text: "Strong", color: "#3B82F6" }
    if (score >= 70) return { text: "Good", color: "#F59E0B" }
    if (score >= 60) return { text: "Moderate", color: "#F97316" }
    return { text: "Developing", color: "#EF4444" }
  }

  const getInsightsFromAnalysis = (analysis: HandwritingCheckin) => {
    const insights = []

    if (analysis.ai_analysis?.recommendations?.strengths_to_leverage) {
      insights.push({
        title: "💪 Key Strengths",
        text: analysis.ai_analysis.recommendations.strengths_to_leverage.join(
          ", "
        ),
      })
    }

    if (analysis.ai_analysis?.behavioral_indicators?.creativity_level) {
      insights.push({
        title: "🎨 Creativity Level",
        text: analysis.ai_analysis.behavioral_indicators.creativity_level,
      })
    }

    if (analysis.ai_analysis?.personality_traits?.thinking_style) {
      insights.push({
        title: "🧠 Thinking Style",
        text: analysis.ai_analysis.personality_traits.thinking_style,
      })
    }

    return insights
  }

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>
              Loading your personality analysis...
            </Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (error) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadAnalysisData}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  if (!analysisData.hasData) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text"
              size={64}
              color="rgba(255, 255, 255, 0.5)"
            />
            <Text style={styles.emptyTitle}>No Analysis Yet</Text>
            <Text style={styles.emptyText}>
              Upload your first handwriting sample to see your personality
              analysis and trends over time.
            </Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  const { latestAnalysis, traitTrends } = analysisData
  const personalityTraits = latestAnalysis
    ? convertTraitsToDisplay(latestAnalysis.traits)
    : []
  const averageScore =
    personalityTraits.length > 0
      ? Math.round(
          personalityTraits.reduce((sum, trait) => sum + trait.score, 0) /
            personalityTraits.length
        )
      : 0
  const interpretation = getScoreInterpretation(averageScore)
  const insights = latestAnalysis ? getInsightsFromAnalysis(latestAnalysis) : []

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Personality Profile</Text>
            <Text style={styles.subtitle}>
              Based on {analysisData.snapshots.length} day
              {analysisData.snapshots.length !== 1 ? "s" : ""} of handwriting
              analysis
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
            {latestAnalysis && (
              <Text style={styles.confidenceScore}>
                Confidence: {Math.round(latestAnalysis.confidence_score * 100)}%
              </Text>
            )}
          </View>

          {/* Time-series chart */}
          {traitTrends.length > 0 && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={24} color="#ffffff" />
                <Text style={styles.sectionTitle}>Personality Trends</Text>
              </View>
              <PersonalityChart
                traitTrends={traitTrends}
                selectedTrait={selectedTrait}
                onTraitSelect={setSelectedTrait}
              />
            </View>
          )}

          <View style={styles.traitsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={24} color="#ffffff" />
              <Text style={styles.sectionTitle}>Current Traits</Text>
            </View>

            {personalityTraits.map((trait, index) => (
              <TraitCard key={index} trait={trait} />
            ))}
          </View>

          {insights.length > 0 && (
            <View style={styles.insightsSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color="#ffffff" />
                <Text style={styles.sectionTitle}>AI Insights</Text>
              </View>

              {insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightText}>{insight.text}</Text>
                </View>
              ))}
            </View>
          )}

          {latestAnalysis && (
            <View style={styles.lastAnalysisSection}>
              <Text style={styles.lastAnalysisText}>
                Last analysis:{" "}
                {new Date(latestAnalysis.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
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
    color: "#ffffff",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
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
  confidenceScore: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  chartSection: {
    marginBottom: 30,
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
    marginBottom: 30,
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
  lastAnalysisSection: {
    alignItems: "center",
    marginTop: 20,
  },
  lastAnalysisText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
})
