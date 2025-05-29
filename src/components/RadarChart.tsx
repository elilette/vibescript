import React from "react"
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native"
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg"
import { PersonalityTraits } from "../types/analysis"

interface RadarChartProps {
  traits: PersonalityTraits
  size?: number
  onTraitSelect?: (traitKey: keyof PersonalityTraits) => void
  onCenterTap?: () => void
  selectedTrait?: keyof PersonalityTraits | null
}

const traitLabels = {
  CNF: "Confidence",
  CRT: "Creativity",
  EMX: "Emotional",
  DSC: "Discipline",
  SOC: "Social",
  NRG: "Energy",
  INT: "Intuition",
  IND: "Independence",
}

const traitColors = {
  CNF: "#60A5FA",
  CRT: "#F472B6",
  EMX: "#A78BFA",
  DSC: "#34D399",
  SOC: "#FBBF24",
  NRG: "#F87171",
  INT: "#22D3EE",
  IND: "#A3E635",
}

export default function RadarChart({
  traits,
  size,
  onTraitSelect,
  onCenterTap,
  selectedTrait,
}: RadarChartProps) {
  // Make it responsive if no size is provided
  const screenWidth = Dimensions.get("window").width
  const defaultSize = Math.min(screenWidth - 80, 350) // 40px padding on each side, max 350px
  const chartSize = size || defaultSize

  const center = chartSize / 2
  const radius = chartSize * 0.32 // Increased from 0.3 for better visibility
  const numSides = 8

  // Convert traits to array in consistent order
  const traitKeys = Object.keys(traitLabels) as (keyof PersonalityTraits)[]
  const values = traitKeys.map((key) => traits[key])

  // Calculate polygon points for the data
  const dataPoints = values.map((value, index) => {
    const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2
    const r = radius * value
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  })

  // Calculate points for the grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridCircles = gridLevels.map((level) => {
    return traitKeys.map((_, index) => {
      const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2
      const r = radius * level
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    })
  })

  // Calculate label positions
  const labelPositions = traitKeys.map((key, index) => {
    const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2
    const r = radius * 1.3 // Adjusted for better spacing
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: traitLabels[key],
      value: Math.round(traits[key] * 100),
      color: traitColors[key],
      key: key,
    }
  })

  // Responsive font sizes
  const labelFontSize = Math.max(10, chartSize * 0.035)
  const valueFontSize = Math.max(8, chartSize * 0.028)
  const pointRadius = Math.max(2, chartSize * 0.01)

  return (
    <View style={[styles.container, { width: chartSize, height: chartSize }]}>
      <Svg width={chartSize} height={chartSize}>
        {/* Grid circles */}
        {gridCircles.map((circle, levelIndex) => (
          <Polygon
            key={`grid-${levelIndex}`}
            points={circle.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Grid lines from center to vertices */}
        {traitKeys.map((_, index) => {
          const angle = (index * 2 * Math.PI) / numSides - Math.PI / 2
          const endX = center + radius * Math.cos(angle)
          const endY = center + radius * Math.sin(angle)
          return (
            <Line
              key={`line-${index}`}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3B82F6"
          strokeWidth="2"
        />

        {/* Data points with individual colors */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={pointRadius}
            fill={traitColors[traitKeys[index]]}
          />
        ))}
      </Svg>

      {/* Tappable center circle */}
      <TouchableOpacity
        style={[
          styles.centerTouchArea,
          {
            position: "absolute",
            left: center - 40,
            top: center - 40,
            width: 80,
            height: 80,
          },
        ]}
        onPress={onCenterTap}
      />

      {/* Tappable trait labels positioned absolutely */}
      {labelPositions.map((pos, index) => {
        const isSelected = selectedTrait === pos.key
        return (
          <TouchableOpacity
            key={`label-touch-${index}`}
            style={[
              styles.labelContainer,
              {
                position: "absolute",
                left: pos.x - 30,
                top: pos.y - 20,
                backgroundColor: isSelected
                  ? "rgba(255, 255, 255, 0.2)"
                  : "transparent",
                borderRadius: 8,
                padding: 4,
              },
            ]}
            onPress={() => onTraitSelect?.(pos.key)}
          >
            <View style={styles.labelContent}>
              <Text
                style={[
                  styles.labelText,
                  {
                    fontSize: labelFontSize,
                    color: pos.color,
                    fontWeight: isSelected ? "bold" : "600",
                  },
                ]}
              >
                {pos.label}
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {
                    fontSize: valueFontSize,
                    color: pos.color,
                    fontWeight: isSelected ? "bold" : "500",
                  },
                ]}
              >
                {pos.value}%
              </Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerTouchArea: {
    borderRadius: 40,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    width: 60,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  labelContent: {
    alignItems: "center",
  },
  labelText: {
    textAlign: "center",
  },
  valueText: {
    textAlign: "center",
  },
})
