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
  authenticating: boolean
  signingOut: boolean
  signInWithApple: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure WebBrowser for better OAuth experience
WebBrowser.maybeCompleteAuthSession()

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setAuthenticating(false)
      }

      if (event === "SIGNED_OUT") {
        setSigningOut(false)
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithApple = async () => {
    try {
      setAuthenticating(true)

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
      setAuthenticating(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setAuthenticating(true)

      // For Expo Go, use a custom scheme that we can intercept
      const redirectTo = AuthSession.makeRedirectUri({
        scheme: "exp", // Expo Go scheme
      })

      // Start the OAuth flow with Google using Supabase (authorization code flow)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Error signing in with Google:", error.message)
        throw error
      }

      // For mobile apps, open the OAuth URL in a browser session
      if (Platform.OS !== "web" && data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectTo
        )

        if (result.type === "success" && result.url) {
          const url = new URL(result.url)
          const code = url.searchParams.get("code")
          const error_param = url.searchParams.get("error")

          if (error_param) {
            console.error("OAuth error:", error_param)
            throw new Error(`OAuth error: ${error_param}`)
          }

          if (code) {
            // Exchange the authorization code for tokens
            const { data: sessionData, error: sessionError } =
              await supabase.auth.exchangeCodeForSession(code)

            if (sessionError) {
              console.error(
                "Error exchanging code for session:",
                sessionError.message
              )
              throw sessionError
            }

            if (!sessionData.session) {
              console.error("No session data received after code exchange")
              throw new Error("No session data received")
            }
          } else {
            console.error("No authorization code in callback URL")
            throw new Error("No authorization code received")
          }
        } else if (result.type === "cancel") {
          throw new Error("User cancelled sign-in")
        } else {
          console.error("Unexpected WebBrowser result:", result)
          throw new Error("Unexpected authentication result")
        }
      }
    } catch (error) {
      console.error("Error during Google sign in:", error)
      throw error
    } finally {
      setAuthenticating(false)
    }
  }

  const signOut = async () => {
    try {
      setSigningOut(true)
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error.message)
        throw error
      }
    } catch (error) {
      console.error("Error during sign out:", error)
      setSigningOut(false)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    session,
    user,
    loading,
    authenticating,
    signingOut,
    signInWithApple,
    signInWithGoogle,
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
