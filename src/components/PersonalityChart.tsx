import React from "react"
import { View, Text, StyleSheet, Dimensions } from "react-native"
import { LineChart } from "react-native-chart-kit"
import { TraitTrend } from "../types/analysis"
import { Ionicons } from "@expo/vector-icons"

interface PersonalityChartProps {
  traitTrends: TraitTrend[]
  selectedTrait?: string
  onTraitSelect?: (traitCode: string) => void
}

const screenWidth = Dimensions.get("window").width

const PersonalityChart: React.FC<PersonalityChartProps> = ({ traitTrends }) => {
  if (!traitTrends || traitTrends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="analytics-outline"
          size={48}
          color="rgba(255, 255, 255, 0.5)"
        />
        <Text style={styles.emptyText}>No trend data available yet</Text>
        <Text style={styles.emptySubtext}>
          Complete more analyses to see your personality trends over time
        </Text>
      </View>
    )
  }

  // Prepare chart data for multi-trait view
  const multiTraitChartData = {
    labels:
      traitTrends[0]?.data_points.length === 1
        ? ["Previous", "Current"]
        : traitTrends[0]?.data_points.map((point) => {
            const date = new Date(point.date)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }) || [],
    datasets: traitTrends.slice(0, 6).map((trend) => ({
      data:
        trend.data_points.length === 1
          ? [trend.data_points[0].value * 100, trend.data_points[0].value * 100]
          : trend.data_points.map((point) => point.value * 100),
      color: (opacity = 1) => trend.color,
      strokeWidth: 2,
    })),
  }

  const chartConfig = {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    backgroundGradientFrom: "rgba(0, 0, 0, 0.05)",
    backgroundGradientTo: "rgba(0, 0, 0, 0.15)",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.9})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "rgba(255, 255, 255, 0.25)",
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    propsForVerticalLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    propsForHorizontalLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Personality Trends Overview</Text>
          <Text style={styles.subtitle}>
            Track your personality development over time
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={multiTraitChartData}
          width={screenWidth - 80}
          height={260}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={true}
          yAxisSuffix="%"
          yAxisInterval={1}
          segments={4}
          yLabelsOffset={10}
          formatYLabel={(value) => `${Math.round(parseFloat(value))}%`}
        />
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Personality Traits</Text>
        {traitTrends.slice(0, 6).map((trend) => (
          <View key={trend.trait_code} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: trend.color }]}
            />
            <Text style={styles.legendText}>{trend.trait_name}</Text>
            <Text style={styles.legendValue}>
              {Math.round(trend.current_value * 100)}%
            </Text>
            <View style={styles.trendIndicator}>
              <Ionicons
                name={getTrendIcon(trend.trend_direction) as any}
                size={14}
                color={getTrendColor(trend.trend_direction)}
              />
              <Text
                style={[
                  styles.trendText,
                  { color: getTrendColor(trend.trend_direction) },
                ]}
              >
                {trend.change_percentage !== undefined
                  ? `${
                      trend.change_percentage > 0 ? "+" : ""
                    }${trend.change_percentage.toFixed(1)}%`
                  : "0%"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const getTrendIcon = (direction: "up" | "down" | "stable") => {
  switch (direction) {
    case "up":
      return "trending-up"
    case "down":
      return "trending-down"
    case "stable":
      return "remove"
    default:
      return "remove"
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chart: {
    borderRadius: 16,
  },
  legendContainer: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginRight: 8,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  emptyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
})

export default PersonalityChart
