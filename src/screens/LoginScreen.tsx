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
import Octicons from "@expo/vector-icons/Octicons"
import { useAuth } from "../context/AuthContext"

const LoginScreen: React.FC = () => {
  const { signInWithApple, signInWithGoogle, loading } = useAuth()
  const [isSigningInApple, setIsSigningInApple] = useState(false)
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false)

  const handleAppleSignIn = async () => {
    try {
      setIsSigningInApple(true)
      await signInWithApple()
    } catch (error) {
      console.error("Apple Sign In Error:", error)
      Alert.alert(
        "Sign In Error",
        "There was an error signing in with Apple. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      setIsSigningInApple(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningInGoogle(true)
      await signInWithGoogle()
    } catch (error) {
      console.error("Google Sign In Error:", error)
      Alert.alert(
        "Sign In Error",
        "There was an error signing in with Google. Please try again.",
        [{ text: "OK" }]
      )
    } finally {
      setIsSigningInGoogle(false)
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
            <Octicons name="pencil" size={60} color="#FFFFFF" />
          </View>

          {/* Sign In Section */}
          <View style={styles.signInSection}>
            <Text style={styles.welcomeText}>Welcome to VibeScript</Text>
            <Text style={styles.descriptionText}>
              Sign in to start analyzing your handwriting and discover insights
              about your personality
            </Text>

            <TouchableOpacity
              style={[
                styles.appleButton,
                (isSigningInApple || isSigningInGoogle) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleAppleSignIn}
              disabled={isSigningInApple || isSigningInGoogle}
            >
              {isSigningInApple ? (
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

            <TouchableOpacity
              style={[
                styles.googleButton,
                (isSigningInApple || isSigningInGoogle) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={isSigningInApple || isSigningInGoogle}
            >
              {isSigningInGoogle ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={24} color="#000000" />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
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
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  signInSection: {
    width: "100%",
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 14,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
})

export default LoginScreen
