import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { LineChart } from "react-native-chart-kit"
import GradientBackground from "../components/GradientBackground"
import { useAuth } from "../context/AuthContext"
import { supabase } from "../services/supabase"
import { PersonalityTraits, HandwritingFeatures } from "../types/analysis"
import { triggerTapHaptic } from "../utils/haptics"

const { width: screenWidth } = Dimensions.get("window")

type JournalStackParamList = {
  JournalMain: undefined
  AnalysisDetail: {
    analysis: {
      id: string
      created_at: string
      traits: PersonalityTraits
      overall_score: number
      confidence_score: number
      features: HandwritingFeatures
      ai_analysis: any
    }
  }
}

type NavigationProp = StackNavigationProp<JournalStackParamList>

interface HandwritingAnalysis {
  id: string
  created_at: string
  traits: PersonalityTraits
  overall_score: number
  confidence_score: number
  features: HandwritingFeatures
  ai_analysis: any
}

interface AnalysisCardProps {
  analysis: HandwritingAnalysis
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ analysis }) => {
  const navigation = useNavigation<NavigationProp>()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 24) {
      if (diffInHours < 1) return "Just now"
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays === 1) return "Yesterday"
      if (diffInDays < 7) return `${diffInDays} days ago`
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      })
    }
  }

  const getTopTraits = (traits: PersonalityTraits) => {
    const traitNames = {
      CNF: "Confidence",
      CRT: "Creativity",
      EMX: "Emotional",
      DSC: "Discipline",
      SOC: "Social",
      NRG: "Energy",
      INT: "Intuition",
      IND: "Independence",
    }

    const sortedTraits = Object.entries(traits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, value]) => ({
        name: traitNames[key as keyof PersonalityTraits],
        value: Math.round(value * 100),
      }))

    return sortedTraits
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"
    if (score >= 60) return "#F59E0B"
    return "#EF4444"
  }

  const handlePress = () => {
    triggerTapHaptic()
    navigation.navigate("AnalysisDetail", { analysis })
  }

  const topTraits = getTopTraits(analysis.traits)
  const overallScore = Math.round(analysis.overall_score * 100)
  const confidenceScore = Math.round(analysis.confidence_score * 100)

  return (
    <TouchableOpacity
      style={styles.analysisCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar"
            size={16}
            color="rgba(255, 255, 255, 0.8)"
          />
          <Text style={styles.analysisDate}>
            {formatDate(analysis.created_at)}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text
            style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}
          >
            {overallScore}%
          </Text>
        </View>
      </View>

      <View style={styles.traitsContainer}>
        <Text style={styles.traitsLabel}>Top Traits:</Text>
        <View style={styles.traitsRow}>
          {topTraits.map((trait, index) => (
            <View key={trait.name} style={styles.traitChip}>
              <Text style={styles.traitName}>{trait.name}</Text>
              <Text style={styles.traitValue}>{trait.value}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.confidenceContainer}>
        <Ionicons name="shield-checkmark" size={16} color="#60A5FA" />
        <Text style={styles.confidenceText}>
          Confidence: {confidenceScore}%
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(255, 255, 255, 0.6)"
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  )
}

const TraitsEvolutionChart: React.FC<{
  analyses: HandwritingAnalysis[]
  onDotPress?: (data: any) => void
}> = ({ analyses, onDotPress }) => {
  if (analyses.length < 2) {
    return (
      <View style={styles.chartContainer}>
        <View style={styles.noDataChart}>
          <Ionicons
            name="analytics-outline"
            size={48}
            color="rgba(255, 255, 255, 0.3)"
          />
          <Text style={styles.noDataText}>
            Complete more analyses to see your personality evolution
          </Text>
        </View>
      </View>
    )
  }

  // Get the last 6 analyses for the chart
  const recentAnalyses = analyses.slice(0, 6).reverse()

  // Define trait colors - vibrant colors that pop on dark background
  const traitColors = {
    CNF: "#FF6B6B", // Bright Red
    CRT: "#4ECDC4", // Bright Teal
    EMX: "#45B7D1", // Bright Blue
    DSC: "#96CEB4", // Mint Green
    SOC: "#FFEAA7", // Bright Yellow
    NRG: "#DDA0DD", // Bright Purple
    INT: "#98D8C8", // Aqua
    IND: "#FFA07A", // Coral
  }

  const traitNames = {
    CNF: "Confidence",
    CRT: "Creativity",
    EMX: "Emotional",
    DSC: "Discipline",
    SOC: "Social",
    NRG: "Energy",
    INT: "Intuition",
    IND: "Independence",
  }

  // Show all 8 traits
  const allTraits = Object.keys(traitNames) as (keyof PersonalityTraits)[]

  const datasets = allTraits.map((traitKey) => ({
    data: recentAnalyses.map((analysis) => analysis.traits[traitKey] * 100),
    color: (opacity = 1) => traitColors[traitKey],
    strokeWidth: 3,
  }))

  const chartData = {
    labels: recentAnalyses.map((analysis) => {
      const date = new Date(analysis.created_at)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }),
    datasets: datasets,
  }

  const chartConfig = {
    backgroundColor: "#8B5CF6",
    backgroundGradientFrom: "#8B5CF6",
    backgroundGradientTo: "#A855F7",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "rgba(255, 255, 255, 0.8)",
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "rgba(255, 255, 255, 0.2)",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    yAxisMin: 0,
    yAxisMax: 100,
    yAxisInterval: 1,
    formatYLabel: (value: string) => `${Math.round(parseFloat(value))}%`,
    useShadowColorFromDataset: false,
    fillShadowGradient: "transparent",
    fillShadowGradientOpacity: 0,
  }

  const chartWidth = screenWidth - 40
  const chartHeight = 220

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chart}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier={false}
          style={styles.lineChart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
          withShadow={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withInnerLines={true}
          withOuterLines={false}
          segments={4}
          onDataPointClick={onDotPress}
        />
      </View>

      {/* Legend - moved outside chart container */}
      <View style={styles.legendContainer}>
        <View style={styles.legendGrid}>
          {allTraits.map((traitKey, index) => (
            <View key={traitKey} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: traitColors[traitKey] },
                ]}
              />
              <Text style={styles.legendText}>{traitNames[traitKey]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default function JournalScreen() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<HandwritingAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("handwriting_checkins")
        .select(
          "id, created_at, traits, overall_score, confidence_score, features, ai_analysis"
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching analyses:", error)
        return
      }

      setAnalyses(data || [])
    } catch (error) {
      console.error("Error fetching analyses:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchAnalyses()
  }

  const handleChartDotPress = (data: any) => {
    // Get the recent analyses used in the chart (last 6, reversed)
    const recentAnalyses = analyses.slice(0, 6).reverse()

    // Get the clicked analysis based on the index
    const clickedAnalysis = recentAnalyses[data.index]

    if (clickedAnalysis && scrollViewRef.current) {
      // Find the index of this analysis in the full analyses array
      const analysisIndex = analyses.findIndex(
        (analysis) => analysis.id === clickedAnalysis.id
      )

      if (analysisIndex !== -1) {
        // Calculate the scroll position (each card is approximately 150px tall with 15px margin)
        const cardHeight = 165 // card height + margin
        const scrollY = analysisIndex * cardHeight

        scrollViewRef.current.scrollTo({
          y: scrollY,
          animated: true,
        })

        // Add haptic feedback
        triggerTapHaptic()
      }
    }
  }

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Analysis History</Text>
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analyses...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
        </View>

        {/* Fixed Traits Evolution Chart */}
        <View style={styles.fixedChartContainer}>
          <TraitsEvolutionChart
            analyses={analyses}
            onDotPress={handleChartDotPress}
          />
        </View>

        {/* Scrollable Analysis Cards */}
        <ScrollView
          style={styles.analysisScrollView}
          contentContainerStyle={styles.analysisContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
            />
          }
          ref={scrollViewRef}
        >
          {analyses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="rgba(255, 255, 255, 0.3)"
              />
              <Text style={styles.emptyTitle}>No Analyses Yet</Text>
              <Text style={styles.emptyText}>
                Your handwriting analyses will appear here once you start using
                the upload feature.
              </Text>
            </View>
          ) : (
            analyses.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  analysisCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  analysisDate: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 6,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  traitsContainer: {
    marginBottom: 12,
  },
  traitsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  traitsRow: {
    flexDirection: "row",
    gap: 8,
  },
  traitChip: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  traitName: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  traitValue: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 6,
  },
  chevron: {
    marginLeft: 6,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  chart: {
    height: 220,
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 15,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  lineChart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  legendContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    width: "23%",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  legendText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  noDataChart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  fixedChartContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  analysisScrollView: {
    flex: 1,
  },
  analysisContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
})
