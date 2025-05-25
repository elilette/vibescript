import "react-native-get-random-values"
import "react-native-url-polyfill/auto"
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Load environment variables from .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set."
  )
}

// Create the Supabase client with React Native optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce", // More secure flow for mobile apps
  },
  global: {
    headers: {
      "X-Client-Info": "vibe-script-mobile",
    },
  },
})

// Export types for TypeScript support
export type { User, Session } from "@supabase/supabase-js"
