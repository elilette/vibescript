import React from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import GradientBackground from "../components/GradientBackground"
import { useAuth } from "../context/AuthContext"

export default function SettingsScreen() {
  const { user, signOut } = useAuth()

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
          } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  if (!user) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Privacy</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle" size={20} color="#ffffff" />
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="log-out" size={20} color="#EF4444" />
                <Text style={[styles.settingLabel, { color: "#EF4444" }]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
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
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#ffffff",
  },
  settingsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
    fontWeight: "500",
  },
})
