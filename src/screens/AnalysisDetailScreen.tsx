import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { RouteProp } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import GradientBackground from "../components/GradientBackground"
import RadarChart from "../components/RadarChart"
import { PersonalityTraits, HandwritingFeatures } from "../types/analysis"
import { triggerTapHaptic } from "../utils/haptics"

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

type AnalysisDetailScreenRouteProp = RouteProp<
  JournalStackParamList,
  "AnalysisDetail"
>
type AnalysisDetailScreenNavigationProp = StackNavigationProp<
  JournalStackParamList,
  "AnalysisDetail"
>

type Props = {
  route: AnalysisDetailScreenRouteProp
  navigation: AnalysisDetailScreenNavigationProp
}

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

// Handwriting features explanations
const featureExplanations = {
  SLN: {
    name: "Slant",
    description: "Direction of letter lean reveals emotional responsiveness",
  },
  WSP: {
    name: "Word Spacing",
    description: "Distance between words shows social interaction style",
  },
  LSZ: {
    name: "Letter Size",
    description:
      "Size of letters indicates self-confidence and attention to detail",
  },
  BLN: {
    name: "Baseline",
    description:
      "Line consistency reveals emotional stability and mood patterns",
  },
  MLM: {
    name: "Margins",
    description:
      "Page organization shows planning ability and social boundaries",
  },
  PRT: {
    name: "Pressure",
    description: "Writing force indicates energy levels and determination",
  },
  LSP: {
    name: "Letter Spacing",
    description: "Space between letters shows need for personal space",
  },
  LCR: {
    name: "Curvature",
    description: "Roundness vs angularity reveals emotional expression style",
  },
  CNT: {
    name: "Connectivity",
    description: "Letter connections show logical thinking patterns",
  },
  RHM: {
    name: "Rhythm",
    description:
      "Writing flow indicates mental processing speed and consistency",
  },
}

export default function AnalysisDetailScreen({ route, navigation }: Props) {
  const { analysis } = route.params
  const [selectedTrait, setSelectedTrait] = useState<
    keyof PersonalityTraits | "general" | null
  >("general")
  const [selectedFeature, setSelectedFeature] = useState<
    keyof HandwritingFeatures | "overview" | null
  >("overview")

  const formatDetailedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
      title: "Analysis Overview",
      description: `This analysis reveals your unique personality blend of ${topTraitNames}. Your handwriting demonstrates ${
        topTraits[0].value > 0.7 ? "strong" : "moderate"
      } ${traitExplanations[
        topTraits[0].key
      ].name.toLowerCase()} combined with distinctive characteristics in other areas.`,
    }
  }

  const getHandwritingOverview = (features: HandwritingFeatures) => {
    const featureKeys = Object.keys(features) as (keyof HandwritingFeatures)[]
    const values = featureKeys.map((key) => ({ key, value: features[key] }))
    const sortedFeatures = values.sort((a, b) => b.value - a.value)

    const topFeatures = sortedFeatures.slice(0, 3)
    const topFeatureNames = topFeatures
      .map((f) => featureExplanations[f.key].name)
      .join(", ")

    return {
      title: "Handwriting Overview",
      description: `Your handwriting shows distinctive characteristics in ${topFeatureNames}. These features combine to create your unique writing signature and reveal key aspects of your personality and behavior patterns.`,
    }
  }

  const getFeatureDetails = (featureKey: keyof HandwritingFeatures) => {
    const featureValue = analysis.features[featureKey]
    const percentage = Math.round(featureValue * 100)

    // Map quantified features to AI assessment keys
    const featureMapping = {
      SLN: "slant",
      WSP: "spacing",
      LSZ: "size",
      BLN: "baseline",
      MLM: "margins",
      PRT: "pressure",
      LSP: null,
      LCR: null,
      CNT: null,
      RHM: null,
    }

    const aiKey = featureMapping[featureKey]
    const aiAssessment = aiKey
      ? analysis.ai_analysis?.writing_characteristics?.[aiKey]
      : null

    // Create comprehensive search terms for each feature
    const featureSearchTerms = {
      SLN: ["slant", "lean", "angle", "tilt", "slope", "inclination"],
      WSP: ["word spacing", "spacing", "space between words", "word gap"],
      LSZ: ["letter size", "size", "height", "letter height", "writing size"],
      BLN: ["baseline", "line", "alignment", "consistency", "stability"],
      MLM: ["margin", "margins", "border", "edge", "organization"],
      PRT: ["pressure", "force", "intensity", "weight", "heaviness"],
      LSP: ["letter spacing", "spacing between letters", "character spacing"],
      LCR: ["curvature", "curve", "rounded", "angular", "shape"],
      CNT: ["connectivity", "connection", "connected", "linking", "continuity"],
      RHM: ["rhythm", "flow", "speed", "tempo", "consistency", "fluency"],
    }

    // Find related observations using multiple search terms
    const searchTerms = featureSearchTerms[featureKey] || []
    const relatedObservations =
      analysis.ai_analysis?.specific_observations?.filter((obs: any) => {
        const obsFeature = obs.feature.toLowerCase()
        const obsObservation = obs.observation.toLowerCase()
        const obsInterpretation = obs.interpretation.toLowerCase()

        // Check if any search term matches in any of the observation fields
        return searchTerms.some(
          (term) =>
            obsFeature.includes(term) ||
            obsObservation.includes(term) ||
            obsInterpretation.includes(term)
        )
      }) || []

    return {
      name: featureExplanations[featureKey].name,
      description: featureExplanations[featureKey].description,
      measurement: percentage,
      interpretation: getFeatureInterpretation(featureKey, percentage),
      aiAssessment,
      observations: relatedObservations,
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

  const handleFeatureSelect = (
    featureKey: keyof HandwritingFeatures | "overview"
  ) => {
    triggerTapHaptic()
    setSelectedFeature(selectedFeature === featureKey ? "overview" : featureKey)
  }

  const handleFeatureOverviewTap = () => {
    triggerTapHaptic()
    setSelectedFeature("overview")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"
    if (score >= 60) return "#F59E0B"
    return "#EF4444"
  }

  const getFeatureValue = (
    features: HandwritingFeatures,
    feature: keyof HandwritingFeatures
  ) => {
    return Math.round(features[feature] * 100)
  }

  const getFeatureInterpretation = (
    feature: keyof HandwritingFeatures,
    value: number
  ) => {
    const interpretations = {
      SLN:
        value < 40
          ? "Left-leaning (introspective)"
          : value > 60
          ? "Right-leaning (expressive)"
          : "Upright (balanced)",
      WSP:
        value < 40
          ? "Tight spacing (selective)"
          : value > 60
          ? "Wide spacing (outgoing)"
          : "Moderate spacing",
      LSZ:
        value < 40
          ? "Small letters (detail-focused)"
          : value > 60
          ? "Large letters (confident)"
          : "Medium letters",
      BLN:
        value < 40
          ? "Stable baseline (consistent)"
          : value > 60
          ? "Variable baseline (emotional)"
          : "Mostly stable",
      MLM:
        value < 40
          ? "Narrow margins (direct)"
          : value > 60
          ? "Wide margins (reserved)"
          : "Balanced margins",
      PRT:
        value < 40
          ? "Light pressure (gentle)"
          : value > 60
          ? "Heavy pressure (intense)"
          : "Medium pressure",
      LSP:
        value < 40
          ? "Close letters (connected)"
          : value > 60
          ? "Spaced letters (independent)"
          : "Normal spacing",
      LCR:
        value < 40
          ? "Angular (logical)"
          : value > 60
          ? "Curved (emotional)"
          : "Mixed curves",
      CNT:
        value < 40
          ? "Disconnected (intuitive)"
          : value > 60
          ? "Connected (methodical)"
          : "Mixed connection",
      RHM:
        value < 40
          ? "Slow rhythm (deliberate)"
          : value > 60
          ? "Fast rhythm (spontaneous)"
          : "Steady rhythm",
    }
    return interpretations[feature]
  }

  const generalAnalysis = getGeneralAnalysis(analysis.traits)
  const overallScore = Math.round(analysis.overall_score * 100)
  const confidenceScore = Math.round(analysis.confidence_score * 100)

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              triggerTapHaptic()
              navigation.goBack()
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Date and Scores */}
          <View style={styles.infoCard}>
            <Text style={styles.dateText}>
              {formatDetailedDate(analysis.created_at)}
            </Text>
            <View style={styles.scoresRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Overall Score</Text>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(overallScore) },
                  ]}
                >
                  {overallScore}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>AI Confidence</Text>
                <Text style={[styles.scoreValue, { color: "#60A5FA" }]}>
                  {confidenceScore}%
                </Text>
              </View>
            </View>
          </View>

          {/* Explanation Card */}
          <View style={styles.explanationCard}>
            {selectedTrait === "general" ? (
              <>
                <Text style={styles.explanationTitle}>
                  {generalAnalysis.title}
                </Text>
                <Text style={styles.explanationText}>
                  {generalAnalysis.description}
                </Text>
              </>
            ) : selectedTrait ? (
              <>
                <Text style={styles.explanationTitle}>
                  {traitExplanations[selectedTrait].name}
                </Text>
                <Text style={styles.explanationText}>
                  {traitExplanations[selectedTrait].description}
                </Text>
                <View style={styles.traitScoreContainer}>
                  <Text style={styles.traitScoreText}>
                    Your Score:{" "}
                    {Math.round(analysis.traits[selectedTrait] * 100)}%
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {/* Radar Chart */}
          <View style={styles.radarCard}>
            <Text style={styles.radarTitle}>Personality Radar</Text>
            <View style={styles.radarContainer}>
              <RadarChart
                traits={analysis.traits}
                onTraitSelect={handleTraitSelect}
                onCenterTap={handleCenterTap}
                selectedTrait={
                  selectedTrait === "general" ? null : selectedTrait
                }
              />
            </View>
          </View>

          {/* Comprehensive Handwriting Analysis */}
          {(analysis.features ||
            analysis.ai_analysis?.writing_characteristics ||
            analysis.ai_analysis?.specific_observations) && (
            <View style={styles.characteristicsCard}>
              <Text style={styles.cardTitle}>Handwriting Analysis</Text>

              {/* Feature Explanation Card */}
              <View style={styles.explanationCard}>
                {selectedFeature === "overview" ? (
                  <>
                    <Text style={styles.explanationTitle}>
                      {getHandwritingOverview(analysis.features).title}
                    </Text>
                    <Text style={styles.explanationText}>
                      {getHandwritingOverview(analysis.features).description}
                    </Text>
                  </>
                ) : selectedFeature ? (
                  (() => {
                    const details = getFeatureDetails(selectedFeature)
                    return (
                      <>
                        <Text style={styles.explanationTitle}>
                          {details.name}
                        </Text>
                        <Text style={styles.explanationText}>
                          {details.description}
                        </Text>

                        <View style={styles.featureDetailsContainer}>
                          <View style={styles.measurementRow}>
                            <Text style={styles.measurementLabel}>
                              Measurement:
                            </Text>
                            <Text style={styles.measurementValue}>
                              {details.measurement}%
                            </Text>
                          </View>

                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${details.measurement}%` },
                              ]}
                            />
                          </View>

                          <Text style={styles.interpretationText}>
                            {details.interpretation}
                          </Text>

                          {details.aiAssessment && (
                            <View style={styles.assessmentContainer}>
                              <Text style={styles.assessmentLabel}>
                                AI Assessment:
                              </Text>
                              <Text style={styles.assessmentValue}>
                                {details.aiAssessment}
                              </Text>
                            </View>
                          )}

                          {details.observations.length > 0 && (
                            <View style={styles.observationsContainer}>
                              <Text style={styles.observationsTitle}>
                                Specific Observations
                              </Text>
                              {details.observations.map(
                                (obs: any, index: number) => (
                                  <View
                                    key={index}
                                    style={styles.observationItem}
                                  >
                                    <Text style={styles.observationNote}>
                                      {obs.observation}
                                    </Text>
                                    <Text style={styles.observationMeaning}>
                                      {obs.interpretation}
                                    </Text>
                                  </View>
                                )
                              )}
                            </View>
                          )}
                        </View>
                      </>
                    )
                  })()
                ) : null}
              </View>

              {/* Handwriting Features Chart - TODO: Create HandwritingFeaturesChart component */}
              <View style={styles.featuresChartContainer}>
                <Text style={styles.chartTitle}>Handwriting Features</Text>
                <View style={styles.featuresGrid}>
                  {Object.entries(analysis.features).map(([key, value]) => {
                    const featureKey = key as keyof HandwritingFeatures
                    const percentage = Math.round(value * 100)
                    const isSelected = selectedFeature === featureKey

                    return (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.featureButton,
                          isSelected && styles.selectedFeatureButton,
                        ]}
                        onPress={() => handleFeatureSelect(featureKey)}
                      >
                        <Text
                          style={[
                            styles.featureButtonText,
                            isSelected && styles.selectedFeatureButtonText,
                          ]}
                        >
                          {featureExplanations[featureKey].name}
                        </Text>
                        <Text style={styles.featureButtonValue}>
                          {percentage}%
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>

                <TouchableOpacity
                  style={[
                    styles.overviewButton,
                    selectedFeature === "overview" &&
                      styles.selectedOverviewButton,
                  ]}
                  onPress={handleFeatureOverviewTap}
                >
                  <Text
                    style={[
                      styles.overviewButtonText,
                      selectedFeature === "overview" &&
                        styles.selectedOverviewButtonText,
                    ]}
                  >
                    Show Overview
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Behavioral Indicators */}
          {analysis.ai_analysis?.behavioral_indicators && (
            <View style={styles.behavioralCard}>
              <Text style={styles.cardTitle}>Behavioral Indicators</Text>
              {Object.entries(analysis.ai_analysis.behavioral_indicators).map(
                ([key, value]) => (
                  <View key={key} style={styles.behavioralRow}>
                    <Text style={styles.behavioralLabel}>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </Text>
                    <Text style={styles.behavioralValue}>{String(value)}</Text>
                  </View>
                )
              )}
            </View>
          )}

          {/* Recommendations */}
          {analysis.ai_analysis?.recommendations && (
            <View style={styles.recommendationsCard}>
              <Text style={styles.cardTitle}>Professional Recommendations</Text>

              {analysis.ai_analysis.recommendations.strengths_to_leverage && (
                <View style={styles.recommendationSection}>
                  <Text style={styles.recommendationSectionTitle}>
                    Strengths to Leverage
                  </Text>
                  {analysis.ai_analysis.recommendations.strengths_to_leverage.map(
                    (strength: string, index: number) => (
                      <Text key={index} style={styles.recommendationItem}>
                        • {strength}
                      </Text>
                    )
                  )}
                </View>
              )}

              {analysis.ai_analysis.recommendations.areas_for_development && (
                <View style={styles.recommendationSection}>
                  <Text style={styles.recommendationSectionTitle}>
                    Areas for Development
                  </Text>
                  {analysis.ai_analysis.recommendations.areas_for_development.map(
                    (area: string, index: number) => (
                      <Text key={index} style={styles.recommendationItem}>
                        • {area}
                      </Text>
                    )
                  )}
                </View>
              )}

              {analysis.ai_analysis.recommendations.career_suggestions && (
                <View style={styles.recommendationSection}>
                  <Text style={styles.recommendationSectionTitle}>
                    Career Suggestions
                  </Text>
                  {analysis.ai_analysis.recommendations.career_suggestions.map(
                    (suggestion: string, index: number) => (
                      <Text key={index} style={styles.recommendationItem}>
                        • {suggestion}
                      </Text>
                    )
                  )}
                </View>
              )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  dateText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 15,
  },
  scoresRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  explanationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 120,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  explanationText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
  },
  traitScoreContainer: {
    marginTop: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  traitScoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  radarCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
  },
  radarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  characteristicsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  featureDetailsContainer: {
    marginTop: 16,
  },
  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  measurementLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  interpretationText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
    marginBottom: 16,
  },
  assessmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  assessmentLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  assessmentValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  observationsContainer: {
    marginTop: 8,
  },
  observationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  observationItem: {
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255, 255, 255, 0.2)",
  },
  observationNote: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  observationMeaning: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  behavioralCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  behavioralRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  behavioralLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  behavioralValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  recommendationsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  recommendationSection: {
    marginBottom: 20,
  },
  recommendationSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  recommendationItem: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  featuresChartContainer: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    margin: 4,
  },
  selectedFeatureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  featureButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  selectedFeatureButtonText: {
    color: "#ffffff",
  },
  featureButtonValue: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overviewButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  selectedOverviewButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  overviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  selectedOverviewButtonText: {
    color: "#ffffff",
  },
})
