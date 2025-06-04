/**
 * Adventure Screen
 * 
 * Macera sekmesi - placeholder screen.
 * Gelecekte oyun ve macera özelliklerini içerecek.
 * 
 * @purpose Adventure/game features placeholder
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Layout, Typography } from '../../css';

export default function AdventureScreen() {
  return (
    <View style={Layout.containerCentered}>
      <Text style={Typography.titleMedium}>Macera</Text>
      <Text style={[Typography.bodySecondary, { marginTop: 10 }]}>
        Yakında geliyor!
      </Text>
    </View>
  );
} 