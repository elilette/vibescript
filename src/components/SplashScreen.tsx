import React, { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Octicons from "@expo/vector-icons/Octicons"
import Svg, { Path, Defs, ClipPath, Rect } from "react-native-svg"

const { width, height } = Dimensions.get("window")

// Create animated version of LinearGradient and SVG components
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
const AnimatedPath = Animated.createAnimatedComponent(Path)
const AnimatedRect = Animated.createAnimatedComponent(Rect)

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const textFadeAnim = useRef(new Animated.Value(0)).current
  const curveAnim = useRef(new Animated.Value(0)).current
  const curveOpacity = useRef(new Animated.Value(0)).current

  // Animated values for gradient sunrise effect
  const gradientStartY = useRef(new Animated.Value(1)).current
  const gradientEndY = useRef(new Animated.Value(1.5)).current

  useEffect(() => {
    // Start with sunrise gradient animation (625ms)
    Animated.parallel([
      Animated.timing(gradientStartY, {
        toValue: 0,
        duration: 625,
        useNativeDriver: false,
      }),
      Animated.timing(gradientEndY, {
        toValue: 0.3,
        duration: 625,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // After sunrise animation, start other animations
      Animated.sequence([
        // Logo fade in and scale up
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 375,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 375,
            useNativeDriver: true,
          }),
        ]),
        // Small delay
        Animated.delay(125),
        // Text fade in
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 375,
          useNativeDriver: true,
        }),
        // Small delay before finishing
        Animated.delay(315),
      ]).start(() => {
        // Finish splash screen after curve animation is complete + extra time
        setTimeout(() => {
          onFinish()
        }, 1750) // Wait for curve + extra time
      })
    })

    // Curve fade-in animation (left to right)
    setTimeout(() => {
      Animated.sequence([
        // First make the curve visible
        Animated.timing(curveOpacity, {
          toValue: 1,
          duration: 125,
          useNativeDriver: true,
        }),
        // Then animate the left-to-right reveal
        Animated.timing(curveAnim, {
          toValue: 200,
          duration: 937,
          useNativeDriver: false,
        }),
      ]).start()
    }, 1500)
  }, [])

  // Animated gradient positions
  const animatedGradientStart = {
    x: 0,
    y: gradientStartY,
  }

  const animatedGradientEnd = {
    x: 1,
    y: gradientEndY,
  }

  return (
    <AnimatedLinearGradient
      colors={[
        "#1A1A2E",
        "#16213E",
        "#5B21B6",
        "#7C3AED",
        "#8B5CF6",
        "#3B82F6",
      ]}
      start={animatedGradientStart}
      end={animatedGradientEnd}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Small Curve */}
        <Animated.View
          style={[
            styles.curveContainer,
            {
              opacity: curveOpacity,
            },
          ]}
        >
          <Svg height="60" width="200" style={styles.svgCurve}>
            <Defs>
              <ClipPath id="curveClip">
                <AnimatedRect x={0} y={0} width={curveAnim} height={60} />
              </ClipPath>
            </Defs>
            <Path
              d="M 10 30 Q 70 10 100 30 Q 130 50 190 30"
              stroke="#ffffff"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              opacity={0.9}
              clipPath="url(#curveClip)"
            />
          </Svg>
        </Animated.View>

        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Octicons name="pencil" size={60} color="#ffffff" />
        </Animated.View>

        {/* App Name and Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
            },
          ]}
        >
          <Text style={styles.appName}>VibeScript</Text>
          <Text style={styles.tagline}>Discover your true self</Text>
        </Animated.View>
      </View>
    </AnimatedLinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 50,
    zIndex: 2,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
    zIndex: 2,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  curveContainer: {
    position: "absolute",
    top: height * 0.65,
    left: 0,
    right: 0,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  svgCurve: {
    alignSelf: "center",
  },
})
