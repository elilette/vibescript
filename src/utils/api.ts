import * as FileSystem from "expo-file-system"

/**
 * Generic utility for calling Supabase Edge Functions
 */
export const callEdgeFunction = async (
  functionName: string,
  payload: any
): Promise<any> => {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing")
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Edge function ${functionName} error:`, errorText)
    throw new Error(`Function call failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Convert image URI to base64 string using Expo FileSystem
 */
export const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return base64
  } catch (error) {
    console.error("Error converting image to base64:", error)
    throw new Error("Failed to process image")
  }
}
