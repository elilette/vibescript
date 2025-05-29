import React, { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import Navigation from "./src/components/Navigation"
import SplashScreen from "./src/components/SplashScreen"
import LoginScreen from "./src/screens/LoginScreen"
import { AppProvider } from "./src/context/AppContext"
import { AuthProvider, useAuth } from "./src/context/AuthContext"
import { triggerTapHaptic } from "./src/utils/haptics"

const AppContent = () => {
  const [isReady, setIsReady] = useState(false)
  const { session, loading, authenticating, signingOut } = useAuth()

  const handleSplashFinish = () => {
    setIsReady(true)
  }

  if (!isReady) {
    return (
      <>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    )
  }

  // Show loading screen if signing out
  if (signingOut) {
    return (
      <>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <LoginScreen />
      </>
    )
  }

  // Show login screen if not authenticated OR if authenticating
  if ((!loading && !session) || authenticating) {
    return (
      <>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <LoginScreen />
      </>
    )
  }

  // Show main app if authenticated
  return (
    <AppProvider>
      <NavigationContainer
        onStateChange={() => {
          triggerTapHaptic()
        }}
      >
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Navigation />
      </NavigationContainer>
    </AppProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
