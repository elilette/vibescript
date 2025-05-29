import * as Haptics from "expo-haptics"
import { useEffect } from "react"
import { NavigationState } from "@react-navigation/native"

/**
 * Triggers light haptic feedback for general taps
 */
export const triggerLightHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

/**
 * Triggers medium haptic feedback for more important interactions
 */
export const triggerMediumHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

/**
 * Triggers heavy haptic feedback for significant actions
 */
export const triggerHeavyHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
}

/**
 * Triggers success haptic feedback
 */
export const triggerSuccessHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

/**
 * Triggers warning haptic feedback
 */
export const triggerWarningHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
}

/**
 * Triggers error haptic feedback
 */
export const triggerErrorHaptic = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

/**
 * Default haptic feedback for general taps
 */
export const triggerTapHaptic = triggerLightHaptic

/**
 * Hook to add haptic feedback to navigation state changes
 */
export const useNavigationHaptics = (state?: NavigationState) => {
  useEffect(() => {
    if (state) {
      triggerTapHaptic()
    }
  }, [state?.index])
}
