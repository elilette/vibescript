import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"

const LoginScreen: React.FC = () => {
  const { signInWithApple, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleAppleSignIn = async () => {
    try {
      setIsSigningIn(true)
      await signInWithApple()
    } catch (error) {
      console.error("Apple Sign In Error:", error)
      Alert.alert(
        "Sign In Error",
        "There was an error signing in with Apple. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#5B21B6", "#7C3AED"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={["#5B21B6", "#7C3AED"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="create-outline" size={80} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>VibeScript</Text>
            <Text style={styles.brandSubtitle}>
              Discover your personality through handwriting analysis
            </Text>
          </View>

          {/* Sign In Section */}
          <View style={styles.signInSection}>
            <Text style={styles.welcomeText}>Welcome to VibeScript</Text>
            <Text style={styles.descriptionText}>
              Sign in to start analyzing your handwriting and discover insights
              about your personality
            </Text>

            <TouchableOpacity
              style={[styles.appleButton, isSigningIn && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={24} color="#000000" />
                  <Text style={styles.appleButtonText}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 16,
    fontWeight: "500",
  },
  brandSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  signInSection: {
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  appleButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },
})

export default LoginScreen
