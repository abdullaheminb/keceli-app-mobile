/**
 * Adventure Screen
 * 
 * Macera ve oyunlaştırma özelliklerinin gösterildiği sayfa.
 * Şu anda placeholder content var, gelecekte:
 * - Quest'ler ve görevler
 * - Başarımlar (achievements)
 * - Leaderboard
 * - Oyun mekanikleri
 * 
 * @purpose Gamification features
 * @status Under development (placeholder)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdventureScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Macera</Text>
      <Text style={styles.subtitle}>Yakında gelecek...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
}); 