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
import { PhotoAnalysisResponse } from "../types/analysis"

export default function UploadScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

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
  ): Promise<PhotoAnalysisResponse> => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          success: false,
          error: "Supabase configuration missing",
        }
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/analyze-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
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
      return result as PhotoAnalysisResponse
    } catch (error) {
      console.error("Error calling analyze-photo function:", error)
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
          "Analysis Complete! 🎉",
          "Your handwriting has been analyzed using advanced AI graphology techniques by Dr. Sarah Mitchell!",
          [
            {
              text: "View Results",
              onPress: () => {
                // Analysis is already set in state and will be displayed
                console.log("Analysis results:", result.analysis)
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

          {selectedImage && (
            <View style={styles.imagePreview}>
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
            </View>
          )}

          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <View style={styles.uploadButtonContent}>
                <Ionicons name="camera" size={20} color="#ffffff" />
                <Text style={styles.uploadButtonTitle}>Take Photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <View style={styles.uploadButtonContent}>
                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                <Text style={styles.uploadButtonTitle}>Upload File</Text>
              </View>
            </TouchableOpacity>
          </View>

          {selectedImage && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                isAnalyzing && styles.analyzingButton,
              ]}
              onPress={handleAnalyzePhoto}
              disabled={isAnalyzing}
            >
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing
                  ? "Analyzing Handwriting... 🧠"
                  : "Analyze Handwriting ✨"}
              </Text>
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
  imagePreview: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
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
  uploadOptions: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
    justifyContent: "space-between",
  },
  uploadButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    flex: 1,
  },
  uploadButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  uploadButtonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  analyzeButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzingButton: {
    backgroundColor: "#6B7280",
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
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
})
