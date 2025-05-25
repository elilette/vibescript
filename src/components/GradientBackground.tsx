import React from "react"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, ViewStyle } from "react-native"

interface GradientBackgroundProps {
  children: React.ReactNode
  style?: ViewStyle
}

export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={["#5B21B6", "#7C3AED", "#8B5CF6", "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
