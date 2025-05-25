import React, { createContext, useContext, useReducer, useEffect } from "react"
import { User, Analysis, JournalEntry, Achievement } from "../types"
// Temporarily comment out Supabase for development to avoid bundling issues
// import { supabase } from "../services/supabase"

interface AppState {
  user: User | null
  analyses: Analysis[]
  journalEntries: JournalEntry[]
  achievements: Achievement[]
  loading: boolean
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void
  addAnalysis: (analysis: Analysis) => void
  addJournalEntry: (entry: JournalEntry) => void
  fetchUserData: () => Promise<void>
}

const initialState: AppState = {
  user: null,
  analyses: [],
  journalEntries: [],
  achievements: [],
  loading: true,
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ANALYSES"; payload: Analysis[] }
  | { type: "ADD_ANALYSIS"; payload: Analysis }
  | { type: "SET_JOURNAL_ENTRIES"; payload: JournalEntry[] }
  | { type: "ADD_JOURNAL_ENTRY"; payload: JournalEntry }
  | { type: "SET_ACHIEVEMENTS"; payload: Achievement[] }
  | { type: "SET_LOADING"; payload: boolean }

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_ANALYSES":
      return { ...state, analyses: action.payload }
    case "ADD_ANALYSIS":
      return { ...state, analyses: [action.payload, ...state.analyses] }
    case "SET_JOURNAL_ENTRIES":
      return { ...state, journalEntries: action.payload }
    case "ADD_JOURNAL_ENTRY":
      return {
        ...state,
        journalEntries: [action.payload, ...state.journalEntries],
      }
    case "SET_ACHIEVEMENTS":
      return { ...state, achievements: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setUser = (user: User | null) => {
    dispatch({ type: "SET_USER", payload: user })
  }

  const addAnalysis = (analysis: Analysis) => {
    dispatch({ type: "ADD_ANALYSIS", payload: analysis })
  }

  const addJournalEntry = (entry: JournalEntry) => {
    dispatch({ type: "ADD_JOURNAL_ENTRY", payload: entry })
  }

  const fetchUserData = async () => {
    try {
      // Use mock data for development - replace with real Supabase when ready
      const mockUser: User = {
        id: "demo-user-123",
        email: "alex@vibescript.app",
        name: "Alex Johnson",
        created_at: "2024-03-01",
        total_analyses: 24,
        current_streak: 12,
        average_score: 87,
      }

      // Reduced loading delay to work with splash screen
      setTimeout(() => {
        setUser(mockUser)
        dispatch({ type: "SET_LOADING", payload: false })
      }, 100)
    } catch (error) {
      console.error("Error fetching user data:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const value = {
    ...state,
    setUser,
    addAnalysis,
    addJournalEntry,
    fetchUserData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
