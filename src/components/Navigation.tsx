import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet } from "react-native"

import SettingsScreen from "../screens/SettingsScreen"
import UploadScreen from "../screens/UploadScreen"
import AnalysisScreen from "../screens/AnalysisScreen"
import JournalScreen from "../screens/JournalScreen"
import ProfileScreen from "../screens/ProfileScreen"
import { TabParamList } from "../types"

const Tab = createBottomTabNavigator<TabParamList>()

const TabBarBackground = () => (
  <LinearGradient
    colors={["#6366f1", "#8b5cf6", "#a855f7"]}
    style={StyleSheet.absoluteFillObject}
  />
)

export default function Navigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case "Settings":
              iconName = focused ? "settings" : "settings-outline"
              break
            case "Upload":
              iconName = focused ? "camera" : "camera-outline"
              break
            case "Analysis":
              iconName = focused ? "analytics" : "analytics-outline"
              break
            case "Journal":
              iconName = focused ? "journal" : "journal-outline"
              break
            case "Profile":
              iconName = focused ? "person" : "person-outline"
              break
            default:
              iconName = "ellipse"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarBackground: TabBarBackground,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}
