import React, { useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import Navigation from "./src/components/Navigation"
import SplashScreen from "./src/components/SplashScreen"
import { AppProvider } from "./src/context/AppContext"

export default function App() {
  const [isReady, setIsReady] = useState(false)

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

  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Navigation />
      </NavigationContainer>
    </AppProvider>
  )
}
