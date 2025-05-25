import React, { createContext, useContext, useReducer, useEffect } from "react"
import { User, Analysis, JournalEntry, Achievement } from "../types"
import { supabase } from "../services/supabase"
import { useAuth } from "./AuthContext"

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
  const { user: authUser, session } = useAuth()

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
      dispatch({ type: "SET_LOADING", payload: true })

      if (!authUser || !session) {
        // No authenticated user, clear data
        setUser(null)
        dispatch({ type: "SET_ANALYSES", payload: [] })
        dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
        dispatch({ type: "SET_ACHIEVEMENTS", payload: [] })
        dispatch({ type: "SET_LOADING", payload: false })
        return
      }

      // Create or get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        console.error("Error fetching user profile:", profileError)
      }

      let userProfile: User
      if (!profile) {
        // Create new user profile
        const newProfile = {
          id: authUser.id,
          email: authUser.email || "",
          name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "User",
          created_at: new Date().toISOString(),
          total_analyses: 0,
          current_streak: 0,
          average_score: 0,
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error("Error creating user profile:", createError)
          // Use a fallback profile
          userProfile = newProfile
        } else {
          userProfile = createdProfile
        }
      } else {
        userProfile = profile
      }

      setUser(userProfile)

      // Fetch user's analyses, journal entries, and achievements
      // For now, we'll use empty arrays as the database schema might not be set up yet
      dispatch({ type: "SET_ANALYSES", payload: [] })
      dispatch({ type: "SET_JOURNAL_ENTRIES", payload: [] })
      dispatch({ type: "SET_ACHIEVEMENTS", payload: [] })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [authUser, session])

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
