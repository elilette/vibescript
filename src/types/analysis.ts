// Shared types for photo analysis functionality

export interface PhotoAnalysisResponse {
  success: boolean
  analysis?: any // Structured analysis object from server
  formatted_analysis?: string // Pre-formatted text from server
  raw_analysis?: string
  error?: string
  timestamp?: string
}
