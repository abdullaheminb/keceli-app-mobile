/**
 * Profile Screen
 * 
 * Kullanıcı profil sayfası. Şu anda placeholder content var.
 * Gelecekte kullanıcı bilgileri, istatistikler, ayarlar
 * ve profil düzenleme özellikleri eklenecek.
 * 
 * @purpose User profile management
 * @status Under development (placeholder)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
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