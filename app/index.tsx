/**
 * App Entry Point - Splash Screen
 * 
 * Uygulamanın ilk açılışta gösterdiği splash screen.
 * Kullanıcıyı login sayfasına yönlendirir.
 * 
 * @purpose Uygulama giriş noktası ve splash screen
 * @navigation / route'una karşılık gelir
 */

// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RootScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profileId = await AsyncStorage.getItem('profileId');
        
        if (profileId) {
          // Redirect to tabs
          router.replace('/(tabs)');
        } else {
          // Redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nur Yolcusu</Text>
      <Text style={styles.text}>Yönlendiriliyor...</Text>
      
      {/* Debug logout button */}
      <TouchableOpacity style={styles.debugButton} onPress={handleLogout}>
        <Text style={styles.debugButtonText}>Çıkış Yap (Debug)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  debugButton: {
    padding: 10,
    backgroundColor: '#ff6b6b',
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
