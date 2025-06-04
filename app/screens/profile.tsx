/**
 * Profile Screen
 * 
 * Profil sekmesi - placeholder screen.
 * Gelecekte kullanıcı profil ayarlarını içerecek.
 * 
 * @purpose User profile and settings placeholder
 */

import React from 'react';
import { Text, View } from 'react-native';
import { Layout, Typography } from '../../css';

export default function ProfileScreen() {
  return (
    <View style={Layout.containerCentered}>
      <Text style={Typography.titleMedium}>Profil</Text>
      <Text style={[Typography.bodySecondary, { marginTop: 10 }]}>
        Yakında geliyor!
      </Text>
    </View>
  );
} 