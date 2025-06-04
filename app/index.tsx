// app/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const profileId = await AsyncStorage.getItem('profileId');
        console.log('AsyncStorage profileId:', profileId);
        setDebugInfo(`ProfileId: ${profileId}`);
        
        if (profileId) {
          console.log('Tabs sayfasına yönlendiriliyor:', profileId);
          router.replace('/(tabs)');
        } else {
          console.log('Login ekranına yönlendiriliyor');
          router.replace('/login');
        }
      } catch (err) {
        console.error('Login kontrol hatası:', err);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  const clearStorage = async () => {
    await AsyncStorage.clear();
    console.log('AsyncStorage temizlendi');
    setDebugInfo('Storage temizlendi');
    // Yeniden yönlendir
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>{debugInfo}</Text>
        <Pressable onPress={clearStorage} style={{ marginTop: 20, padding: 10, backgroundColor: '#ff6b6b' }}>
          <Text style={{ color: 'white' }}>Clear Storage (Debug)</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Yönlendiriliyor...</Text>
    </View>
  );
}
