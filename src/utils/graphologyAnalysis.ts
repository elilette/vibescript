import { PersonalityTrait } from "../types"

/**
 * Simulates handwriting analysis - in a real app, this would connect to an AI service
 * @param imageUri - URI of the handwriting image
 * @returns Promise with personality analysis results
 */
export const analyzeHandwriting = async (
  imageUri: string
): Promise<{
  traits: PersonalityTrait[]
  overallScore: number
  insights: string[]
}> => {
  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  )

  // Generate random but realistic personality scores
  const traits: PersonalityTrait[] = [
    {
      name: "Creativity",
      score: Math.floor(70 + Math.random() * 30),
      color: "#EC4899",
      icon: "bulb",
    },
    {
      name: "Emotional Intelligence",
      score: Math.floor(75 + Math.random() * 25),
      color: "#F97316",
      icon: "heart",
    },
    {
      name: "Leadership",
      score: Math.floor(60 + Math.random() * 40),
      color: "#3B82F6",
      icon: "star",
    },
    {
      name: "Social Skills",
      score: Math.floor(65 + Math.random() * 35),
      color: "#10B981",
      icon: "people",
    },
    {
      name: "Analytical Thinking",
      score: Math.floor(70 + Math.random() * 30),
      color: "#8B5CF6",
      icon: "analytics",
    },
    {
      name: "Energy Level",
      score: Math.floor(60 + Math.random() * 40),
      color: "#F59E0B",
      icon: "flash",
    },
  ]

  const overallScore = Math.round(
    traits.reduce((sum, trait) => sum + trait.score, 0) / traits.length
  )

  // Generate insights based on scores
  const insights = generateInsights(traits)

  return {
    traits,
    overallScore,
    insights,
  }
}

/**
 * Generates personality insights based on trait scores
 */
const generateInsights = (traits: PersonalityTrait[]): string[] => {
  const insights: string[] = []

  const creativityTrait = traits.find((t) => t.name === "Creativity")
  if (creativityTrait && creativityTrait.score > 80) {
    insights.push(
      "🎨 You have a highly creative mind that thrives on innovation and original thinking."
    )
  }

  const emotionalTrait = traits.find((t) => t.name === "Emotional Intelligence")
  if (emotionalTrait && emotionalTrait.score > 85) {
    insights.push(
      "❤️ Your emotional intelligence is exceptional, showing strong empathy and social awareness."
    )
  }

  const leadershipTrait = traits.find((t) => t.name === "Leadership")
  if (leadershipTrait && leadershipTrait.score > 75) {
    insights.push(
      "⭐ Natural leadership qualities shine through in your writing style."
    )
  }

  const analyticalTrait = traits.find((t) => t.name === "Analytical Thinking")
  if (analyticalTrait && analyticalTrait.score > 80) {
    insights.push(
      "🧠 Your analytical mind shows systematic thinking and attention to detail."
    )
  }

  // Add default insights if none were generated
  if (insights.length === 0) {
    insights.push(
      "✨ Your handwriting reveals a well-balanced personality with unique strengths."
    )
    insights.push(
      "🌟 Continue exploring your potential through self-reflection and growth."
    )
  }

  return insights
}

/**
 * Calculates personality compatibility between two users (future feature)
 */
export const calculateCompatibility = (
  traits1: PersonalityTrait[],
  traits2: PersonalityTrait[]
): number => {
  let totalDifference = 0
  let count = 0

  traits1.forEach((trait1) => {
    const trait2 = traits2.find((t) => t.name === trait1.name)
    if (trait2) {
      totalDifference += Math.abs(trait1.score - trait2.score)
      count++
    }
  })

  if (count === 0) return 50 // Default compatibility

  const averageDifference = totalDifference / count
  return Math.max(0, Math.min(100, 100 - averageDifference))
}

/**
 * Generates daily personality affirmations based on traits
 */
export const generateDailyAffirmation = (
  traits: PersonalityTrait[]
): string => {
  const affirmations = [
    "Your creativity flows through everything you write ✨",
    "Your emotional intelligence guides you to deeper connections 💝",
    "Your leadership potential grows stronger each day 🌟",
    "Your analytical mind solves problems with ease 🧠",
    "Your energy radiates positivity to those around you ⚡",
    "Your social skills create meaningful relationships 🤝",
    "Your unique handwriting reflects your authentic self 🖋️",
    "Your personality continues to evolve and grow 🦋",
  ]

  const randomIndex = Math.floor(Math.random() * affirmations.length)
  return affirmations[randomIndex]
}
