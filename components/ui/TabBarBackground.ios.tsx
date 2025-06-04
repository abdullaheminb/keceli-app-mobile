/**
 * Tab Bar Background Component (iOS)
 * 
 * iOS için blur efektli tab bar background komponenti.
 * System chrome material kullanarak native iOS görünümü sağlar.
 * 
 * @features
 * - iOS blur efekti (BlurView)
 * - System chrome material
 * - Otomatik tema adaptasyonu
 * - Tab bar height overflow hesaplaması
 * 
 * @purpose iOS-specific blurred tab bar background
 * @used_in app/(tabs)/_layout.tsx - iOS'ta tab bar background olarak
 */

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
