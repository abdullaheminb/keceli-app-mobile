/**
 * Tab Bar Background Component
 * 
 * Alt tab bar'ın background'unu sağlayan component.
 * Web ve Android için opak beyaz background verir.
 * iOS'ta blur efekti için ayrı dosya kullanılır.
 * 
 * @features
 * - Platform-specific background
 * - Tab bar overflow hesaplaması
 * - Beyaz opak background (web/Android)
 * 
 * @purpose Tab bar background styling
 * @used_in app/(tabs)/_layout.tsx - tab bar background olarak
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  return <View style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: 'white',
    flex: 1,
  },
});

export function useBottomTabOverflow() {
  return 0;
}
