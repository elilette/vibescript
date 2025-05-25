import React, { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "../services/supabase"
import { Platform } from "react-native"
import * as AuthSession from "expo-auth-session"
import * as Crypto from "expo-crypto"
import * as WebBrowser from "expo-web-browser"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signInWithApple: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithApple = async () => {
    try {
      setLoading(true)

      // Create a redirect URL for the auth session
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: "com.vibescript.app",
      })

      // Generate a random state parameter for security
      const state = Crypto.randomUUID()

      // Start the OAuth flow with Apple
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo,
          queryParams: {
            state,
          },
        },
      })

      if (error) {
        console.error("Error signing in with Apple:", error.message)
        throw error
      }

      // For mobile apps, we need to handle the OAuth flow differently
      if (Platform.OS !== "web" && data.url) {
        // Open the OAuth URL in a browser session
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        )

        if (result.type === "success" && result.url) {
          // Extract the session from the callback URL
          const url = new URL(result.url)
          const access_token = url.searchParams.get("access_token")
          const refresh_token = url.searchParams.get("refresh_token")

          if (access_token && refresh_token) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token,
                refresh_token,
              })

            if (sessionError) {
              console.error("Error setting session:", sessionError.message)
              throw sessionError
            }

            setSession(sessionData.session)
            setUser(sessionData.user)
          }
        }
      }
    } catch (error) {
      console.error("Error during Apple sign in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error.message)
        throw error
      }
    } catch (error) {
      console.error("Error during sign out:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    user,
    loading,
    signInWithApple,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
