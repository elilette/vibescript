import React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { TraitTrend } from "../types/analysis"

interface PersonalityChartProps {
  traitTrends: TraitTrend[]
  selectedTrait?: string
  onTraitSelect?: (traitCode: string) => void
}

const screenWidth = Dimensions.get("window").width

const PersonalityChart: React.FC<PersonalityChartProps> = ({
  traitTrends,
  selectedTrait,
  onTraitSelect,
}) => {
  // Get the selected trait data or default to the first trait
  const selectedTraitData =
    traitTrends.find((trend) => trend.trait_code === selectedTrait) ||
    traitTrends[0]

  if (!selectedTraitData || selectedTraitData.data_points.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No data available for visualization
        </Text>
      </View>
    )
  }

  // Prepare chart data
  const chartData = {
    labels: selectedTraitData.data_points.map((point) => {
      const date = new Date(point.date)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }),
    datasets: [
      {
        data: selectedTraitData.data_points.map((point) => point.value * 100), // Convert to percentage
        color: (opacity = 1) =>
          selectedTraitData.color + Math.round(opacity * 255).toString(16),
        strokeWidth: 3,
      },
    ],
  }

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "rgba(255, 255, 255, 0.1)",
    backgroundGradientTo: "rgba(255, 255, 255, 0.05)",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: selectedTraitData.color,
      fill: selectedTraitData.color,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: "rgba(255, 255, 255, 0.2)",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
    },
  }

  const getTrendIcon = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up":
        return "📈"
      case "down":
        return "📉"
      case "stable":
        return "➡️"
      default:
        return "➡️"
    }
  }

  const getTrendColor = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up":
        return "#10B981"
      case "down":
        return "#EF4444"
      case "stable":
        return "#F59E0B"
      default:
        return "#F59E0B"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{selectedTraitData.trait_name} Trend</Text>
        <View style={styles.trendIndicator}>
          <Text style={styles.trendIcon}>
            {getTrendIcon(selectedTraitData.trend_direction)}
          </Text>
          <Text
            style={[
              styles.trendText,
              { color: getTrendColor(selectedTraitData.trend_direction) },
            ]}
          >
            {selectedTraitData.change_percentage !== undefined
              ? `${
                  selectedTraitData.change_percentage > 0 ? "+" : ""
                }${selectedTraitData.change_percentage.toFixed(1)}%`
              : "No change"}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={false}
          yAxisSuffix="%"
        />
      </View>

      <View style={styles.currentValue}>
        <Text style={styles.currentValueLabel}>Current Value</Text>
        <Text style={styles.currentValueText}>
          {Math.round(selectedTraitData.current_value * 100)}%
        </Text>
      </View>

      {/* Trait selector */}
      <View style={styles.traitSelector}>
        {traitTrends.slice(0, 4).map((trend) => (
          <View
            key={trend.trait_code}
            style={[
              styles.traitButton,
              {
                backgroundColor:
                  selectedTrait === trend.trait_code
                    ? trend.color + "40"
                    : "rgba(255, 255, 255, 0.1)",
                borderColor:
                  selectedTrait === trend.trait_code
                    ? trend.color
                    : "rgba(255, 255, 255, 0.2)",
              },
            ]}
            onTouchEnd={() => onTraitSelect?.(trend.trait_code)}
          >
            <Text
              style={[
                styles.traitButtonText,
                {
                  color:
                    selectedTrait === trend.trait_code
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.8)",
                },
              ]}
            >
              {trend.trait_name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  currentValue: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentValueLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 5,
  },
  currentValueText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  traitSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  traitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    minWidth: "48%",
    alignItems: "center",
  },
  traitButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    textAlign: "center",
  },
})

export default PersonalityChart
