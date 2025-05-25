export interface User {
  id: string
  user_id: string
  email: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PersonalityTrait {
  name: string
  score: number
  color: string
  icon: string
}

export interface Analysis {
  id: string
  user_id: string
  image_url: string
  personality_traits: PersonalityTrait[]
  overall_score: number
  created_at: string
  analysis_text?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
  unlocked: boolean
  unlocked_at?: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  mood_score: number
  created_at: string
  date: string
}

export interface PersonalityVibe {
  creativity: number
  confidence: number
  focus: number
}

export type TabParamList = {
  Settings: undefined
  Upload: undefined
  Analysis: undefined
  Journal: undefined
  Profile: undefined
}
