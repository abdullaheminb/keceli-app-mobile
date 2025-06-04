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
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';

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
      <View style={Layout.containerCentered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typography.body, { marginTop: 20 }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={Layout.containerCentered}>
      <Text style={[Typography.titleMedium, { marginBottom: 20 }]}>Nur Yolcusu</Text>
      <Text style={[Typography.body, { marginBottom: 20 }]}>Yönlendiriliyor...</Text>
      
      {/* Debug logout button */}
      <TouchableOpacity style={Components.buttonDebug} onPress={handleLogout}>
        <Text style={Typography.buttonText}>Çıkış Yap (Debug)</Text>
      </TouchableOpacity>
    </View>
  );
}
