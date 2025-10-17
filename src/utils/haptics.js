/**
 * Haptic Feedback Utility
 * Provides consistent vibration patterns for mobile interactions
 *
 * Browser Support: Chrome/Edge (Android), Safari (iOS 13+)
 * Fallback: Silent fail on unsupported browsers
 */

/**
 * Check if haptic feedback is supported
 */
export const isHapticsSupported = () => {
  return 'vibrate' in navigator;
};

/**
 * Haptic feedback patterns
 * Durations in milliseconds
 */
export const HapticPattern = {
  // Light tap for buttons and toggles
  LIGHT: 10,

  // Medium tap for confirmations and selections
  MEDIUM: 50,

  // Success pattern (double tap)
  SUCCESS: [30, 50, 30],

  // Error pattern (long vibration)
  ERROR: 200,

  // Warning pattern (three short taps)
  WARNING: [50, 50, 50, 50, 50],

  // Pull-to-refresh release
  REFRESH: 50
};

/**
 * Trigger haptic feedback
 * @param {number|number[]} pattern - Vibration duration or pattern array
 */
export const triggerHaptic = (pattern) => {
  if (!isHapticsSupported()) return;

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silent fail - haptics are nice-to-have
    console.debug('Haptic feedback failed:', error);
  }
};

/**
 * Convenience functions for common patterns
 */
export const haptics = {
  light: () => triggerHaptic(HapticPattern.LIGHT),
  medium: () => triggerHaptic(HapticPattern.MEDIUM),
  success: () => triggerHaptic(HapticPattern.SUCCESS),
  error: () => triggerHaptic(HapticPattern.ERROR),
  warning: () => triggerHaptic(HapticPattern.WARNING),
  refresh: () => triggerHaptic(HapticPattern.REFRESH)
};

/**
 * Higher-order component to add haptic feedback to click handlers
 * @param {Function} onClick - Original click handler
 * @param {string} intensity - 'light' | 'medium'
 * @returns {Function} Enhanced click handler with haptics
 */
export const withHaptics = (onClick, intensity = 'light') => {
  return (event) => {
    haptics[intensity]();
    if (onClick) {
      onClick(event);
    }
  };
};
