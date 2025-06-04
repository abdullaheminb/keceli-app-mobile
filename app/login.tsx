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
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../firebaseConfig';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        where('password', '==', password)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const user = snapshot.docs[0];
        const userData = user.data();

        if (userData.role === 'child') {
          await AsyncStorage.setItem('profileId', user.id);
          router.replace('/(tabs)');
        } else {
          Alert.alert('Bu hesap çocuk hesabı değil.');
        }
      } else {
        Alert.alert('Kullanıcı adı veya şifre hatalı.');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      Alert.alert('Giriş sırasında bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nur Boy'a Hoş Geldin</Text>

      <TextInput
        placeholder="Kullanıcı Adı"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Şifre"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4285F4', // Google mavisi
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
