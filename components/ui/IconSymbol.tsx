// Fallback for using MaterialIcons on Android and web.

import React from 'react';
import { StyleSheet, Text } from 'react-native';

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
    <Text style={[styles.icon, { fontSize: size, color }]}>
      {getIcon(name)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
