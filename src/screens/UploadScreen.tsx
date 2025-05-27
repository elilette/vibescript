import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from "expo-file-system"
import GradientBackground from "../components/GradientBackground"
import { EnhancedAnalysisResponse } from "../types/analysis"
import { useAuth } from "../context/AuthContext"

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const { session } = useAuth()

  // Moved from photoAnalysis.ts - Convert image to base64
  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
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

  // Moved from photoAnalysis.ts - Call Edge Function
  const analyzePhoto = async (
    imageBase64: string,
    customPrompt?: string
  ): Promise<EnhancedAnalysisResponse> => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL

      if (!supabaseUrl) {
        return {
          success: false,
          error: "Supabase configuration missing",
        }
      }

      if (!session?.access_token) {
        return {
          success: false,
          error: "User not authenticated",
        }
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-handwriting-enhanced`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64,
            prompt: customPrompt,
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Edge function error:", errorText)
        return {
          success: false,
          error: `Function call failed: ${response.status}`,
        }
      }

      const result = await response.json()
      return result as EnhancedAnalysisResponse
    } catch (error) {
      console.error(
        "Error calling analyze-handwriting-enhanced function:",
        error
      )
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need camera permissions to take photos!"
      )
      return false
    }
    return true
  }

  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Sorry, we need photo library permissions to select images!"
      )
      return false
    }
    return true
  }

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
      setAnalysisResult(null) // Clear previous analysis
    }
  }

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
      setAnalysisResult(null) // Clear previous analysis
    }
  }

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      Alert.alert("No image selected", "Please select an image first")
      return
    }

    if (!session?.access_token) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to analyze your handwriting"
      )
      return
    }

    setIsAnalyzing(true)

    try {
      // Convert image to base64
      const base64Image = await convertImageToBase64(selectedImage)

      // Analyze the photo using our edge function
      const result = await analyzePhoto(base64Image)

      if (result.success && result.formatted_analysis) {
        // Use the pre-formatted analysis from the server
        setAnalysisResult(result.formatted_analysis)
        Alert.alert(
          "Enhanced Analysis Complete! 🎉",
          `Your handwriting has been analyzed with advanced AI graphology techniques!\n\n📊 Confidence Score: ${Math.round(
            (result.confidence_score || 0) * 100
          )}%\n🎯 Overall Score: ${Math.round(
            (result.overall_score || 0) * 100
          )}%\n\nView your quantified personality traits and detailed insights below!`,
          [
            {
              text: "View Results",
              onPress: () => {
                // Analysis is already set in state and will be displayed
                console.log("Enhanced analysis results:", result.analysis)
              },
            },
          ]
        )
      } else {
        Alert.alert(
          "Analysis Failed",
          result.error ||
            "Something went wrong during analysis. Please try again."
        )
      }
    } catch (error) {
      console.error("Error analyzing photo:", error)
      Alert.alert(
        "Error",
        "Failed to analyze the handwriting. Please check your internet connection and try again."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Ready to Decode Your Handwriting?</Text>
            <Text style={styles.subtitle}>
              Upload a sample of your handwriting and let AI reveal your
              personality secrets through graphology analysis
            </Text>
          </View>

          <View style={styles.imageContainer}>
            <View style={styles.imagePreview}>
              {selectedImage ? (
                <>
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setSelectedImage(null)
                      setAnalysisResult(null)
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.placeholderContainer}
                  activeOpacity={0.8}
                  onPress={() => {
                    Alert.alert(
                      "Add Handwriting Sample",
                      "Choose how you'd like to add your handwriting:",
                      [
                        {
                          text: "📷 Take Photo",
                          onPress: takePhoto,
                        },
                        {
                          text: "📁 Upload from Gallery",
                          onPress: pickImage,
                        },
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                      ]
                    )
                  }}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={48}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </View>
                  <Text style={styles.placeholderTitle}>
                    Upload Your Handwriting
                  </Text>
                  <Text style={styles.placeholderSubtext}>
                    Tap to capture with camera or select from gallery
                  </Text>
                  <View style={styles.actionHints}>
                    <View style={styles.hintItem}>
                      <Ionicons
                        name="camera"
                        size={16}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                      <Text style={styles.hintText}>Camera</Text>
                    </View>
                    <View style={styles.hintDivider} />
                    <View style={styles.hintItem}>
                      <Ionicons
                        name="images"
                        size={16}
                        color="rgba(255, 255, 255, 0.5)"
                      />
                      <Text style={styles.hintText}>Gallery</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {selectedImage && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                isAnalyzing && styles.analyzingButton,
              ]}
              onPress={handleAnalyzePhoto}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              <View style={styles.analyzeButtonContent}>
                <View style={styles.analyzeIconContainer}>
                  <Ionicons
                    name={isAnalyzing ? "hourglass-outline" : "sparkles"}
                    size={24}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.analyzeTextContainer}>
                  <Text style={styles.analyzeButtonTitle}>
                    {isAnalyzing ? "Analyzing..." : "Analyze Handwriting"}
                  </Text>
                  <Text style={styles.analyzeButtonSubtitle}>
                    {isAnalyzing
                      ? "AI is decoding your personality"
                      : "Discover your personality traits"}
                  </Text>
                </View>
                {!isAnalyzing && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                )}
              </View>
            </TouchableOpacity>
          )}

          {analysisResult && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>🔍 Graphology Analysis:</Text>
              <Text style={styles.analysisText}>{analysisResult}</Text>
            </View>
          )}

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>
              Tips for best handwriting analysis:
            </Text>
            <Text style={styles.tipText}>
              • Write naturally with a pen or pencil (avoid typing)
            </Text>
            <Text style={styles.tipText}>
              • Use good lighting and clear background
            </Text>
            <Text style={styles.tipText}>
              • Include at least 3-4 lines of cursive text
            </Text>
            <Text style={styles.tipText}>
              • Write on unlined paper for best results
            </Text>
            <Text style={styles.tipText}>
              • Include your signature if possible
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Extra padding for bottom tab navigation
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  imagePreview: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
    height: 400,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  previewImage: {
    width: "100%",
    height: 400,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
  analyzeButton: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  analyzingButton: {
    backgroundColor: "#6B7280",
    shadowColor: "#6B7280",
  },
  analyzeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  analyzeIconContainer: {
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 8,
  },
  analyzeTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  analyzeButtonTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  analyzeButtonSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  analysisContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 30,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  tips: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 6,
    lineHeight: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "dashed",
    borderRadius: 20,
    margin: 2,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 8,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  placeholderSubtext: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  actionHints: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  hintDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 8,
  },
  hintText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 4,
    fontWeight: "500",
  },
})
