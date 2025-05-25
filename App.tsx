import React, { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import Navigation from "./src/components/Navigation"
import SplashScreen from "./src/components/SplashScreen"
import LoginScreen from "./src/screens/LoginScreen"
import { AppProvider } from "./src/context/AppContext"
import { AuthProvider, useAuth } from "./src/context/AuthContext"

const AppContent = () => {
  const [isReady, setIsReady] = useState(false)
  const { session, loading } = useAuth()

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

  // Show login screen if not authenticated
  if (!loading && !session) {
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
      <NavigationContainer>
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
