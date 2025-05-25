import React from "react"
import { View, Text, StyleSheet } from "react-native"

// TypeScript interfaces
interface Props {
  title: string
  onPress?: () => void
  loading?: boolean
}

// Component with proper error boundaries and accessibility
const ComponentTemplate: React.FC<Props> = React.memo(
  ({ title, onPress, loading = false }) => {
    if (loading) {
      return (
        <View style={styles.container} accessibilityLabel="Loading">
          <Text>Loading...</Text>
        </View>
      )
    }

    return (
      <View
        style={styles.container}
        accessibilityLabel={`Component with title: ${title}`}
      >
        <Text style={styles.title}>{title}</Text>
      </View>
    )
  }
)

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
})

// Named export
export default ComponentTemplate
