/**
 * Login Screen
 * 
 * Kullanıcı girişi için login sayfası.
 * Kullanıcı adı girişi ve profil seçimi yapılır.
 * Başarılı girişten sonra tabs navigation'a yönlendirir.
 * 
 * @purpose Kullanıcı authentication ve profil seçimi
 * @navigation /login route'una karşılık gelir
 */

// app/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Components, Layout, Typography } from '../css';

export default function LoginScreen() {
  const [profileId, setProfileId] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!profileId.trim()) {
      Alert.alert('Hata', 'Lütfen profil ID girin');
      return;
    }

    try {
      await AsyncStorage.setItem('profileId', profileId.trim());
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    }
  };

  return (
    <View style={Layout.containerPadded}>
      <Text style={[Typography.titleLarge, { textAlign: 'center', marginBottom: 32 }]}>
        Nur Yolcusu
      </Text>
      
      <TextInput
        style={[Components.input, { marginBottom: 16 }]}
        placeholder="Profil ID girin"
        value={profileId}
        onChangeText={setProfileId}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <TouchableOpacity 
        style={[Components.button, Components.buttonGoogle, { marginTop: 8 }]} 
        onPress={handleLogin}
      >
        <Text style={Typography.buttonText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );
}
