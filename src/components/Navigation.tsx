import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet } from "react-native"

import SettingsScreen from "../screens/SettingsScreen"
import UploadScreen from "../screens/UploadScreen"
import JournalScreen from "../screens/JournalScreen"
import ProfileScreen from "../screens/ProfileScreen"
import AnalysisDetailScreen from "../screens/AnalysisDetailScreen"
import { TabParamList } from "../types"
import { PersonalityTraits, HandwritingFeatures } from "../types/analysis"

type JournalStackParamList = {
  JournalMain: undefined
  AnalysisDetail: {
    analysis: {
      id: string
      created_at: string
      traits: PersonalityTraits
      overall_score: number
      confidence_score: number
      features: HandwritingFeatures
      ai_analysis: any
    }
  }
}

export type UploadStackParamList = {
  UploadMain: undefined
  AnalysisDetail: {
    analysis: {
      id: string
      created_at: string
      traits: PersonalityTraits
      overall_score: number
      confidence_score: number
      features: HandwritingFeatures
      ai_analysis: any
    }
  }
}

const Tab = createBottomTabNavigator<TabParamList>()
const JournalStack = createStackNavigator<JournalStackParamList>()
const UploadStack = createStackNavigator<UploadStackParamList>()

const TabBarBackground = () => (
  <LinearGradient
    colors={["#6366f1", "#8b5cf6", "#a855f7"]}
    style={StyleSheet.absoluteFillObject}
  />
)

function JournalStackNavigator() {
  return (
    <JournalStack.Navigator screenOptions={{ headerShown: false }}>
      <JournalStack.Screen name="JournalMain" component={JournalScreen} />
      <JournalStack.Screen
        name="AnalysisDetail"
        component={AnalysisDetailScreen}
      />
    </JournalStack.Navigator>
  )
}

function UploadStackNavigator() {
  return (
    <UploadStack.Navigator screenOptions={{ headerShown: false }}>
      <UploadStack.Screen name="UploadMain" component={UploadScreen} />
      <UploadStack.Screen
        name="AnalysisDetail"
        component={AnalysisDetailScreen}
      />
    </UploadStack.Navigator>
  )
}

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
            case "Journal":
              iconName = focused ? "journal" : "journal-outline"
              break
            case "Personality":
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
      <Tab.Screen name="Personality" component={ProfileScreen} />
      <Tab.Screen name="Upload" component={UploadStackNavigator} />
      <Tab.Screen name="Journal" component={JournalStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}
