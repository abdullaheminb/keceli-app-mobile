/**
 * Icon Symbol Component
 * 
 * Cross-platform icon gösterimi için fallback component.
 * iOS'ta SF Symbols, Android/Web'de emoji/text iconlar kullanır.
 * 
 * @features
 * - Platform-agnostic icon display
 * - Emoji fallbacks for Android/Web
 * - Size ve color customization
 * - Tab bar iconları için optimize
 * 
 * @purpose Cross-platform icon display
 * @used_in app/(tabs)/_layout.tsx - tab iconları, Collapsible - chevron icon
 */

import React from 'react';
import { Text } from 'react-native';

interface IconSymbolProps {
  name: string;
  size: number;
  color: string;
}

export function IconSymbol({ name, size, color }: IconSymbolProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'list.bullet':
        return '✓';
      case 'map':
        return '🗺️';
      case 'person.circle':
        return '👤';
      default:
        return '●';
    }
  };

  return (
    <Text style={{ fontSize: size, color, textAlign: 'center' }}>
      {getIcon(name)}
    </Text>
  );
}
