import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileData {
  username: string;
  password: string;
  role: string;
  makam?: number;
  can?: number;
  altin?: number;
  ihlas?: number;
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      console.log('fetchProfile çalışıyor, id:', id);
      try {
        if (!id || typeof id !== 'string') {
          console.log('ID problemi:', id);
          return;
        }
        
        console.log('Firebase\'den veri çekmeye başlıyor...');
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        
        console.log('docSnap exists:', docSnap.exists());
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Firebase\'den gelen veri:', data);
          console.log('Veri tipleri:', {
            username: typeof data.username,
            role: typeof data.role,
            makam: typeof data.makam,
            hasUsername: !!data.username
          });
          setProfile(data as ProfileData);
        } else {
          console.log('Profil bulunamadı!');
          setProfileNotFound(true);
        }
      } catch (error) {
        console.error('Profil verisi alınamadı:', error);
        setProfileNotFound(true);
      } finally {
        console.log('Loading false yapılıyor');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profileNotFound && !loading) {
      Alert.alert(
        'Profil Bulunamadı',
        'Bu profil artık mevcut değil. Giriş ekranına yönlendirileceksiniz.',
        [
          {
            text: 'Tamam',
            onPress: handleLogout
          }
        ],
        { cancelable: false }
      );
    }
  }, [profileNotFound, loading]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('profileId');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (profileNotFound || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Giriş ekranına yönlendiriliyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldin, {profile.username}!</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Makam:</Text>
        <Text style={styles.value}>{profile.makam ?? 1}</Text>

        <Text style={styles.label}>Can:</Text>
        <Text style={styles.value}>{profile.can ?? 3}</Text>

        <Text style={styles.label}>Altın:</Text>
        <Text style={styles.value}>{profile.altin ?? 0}</Text>

        <Text style={styles.label}>İhlas:</Text>
        <Text style={styles.value}>{profile.ihlas ?? 0}</Text>
      </View>

      <Pressable onPress={handleLogout} style={styles.logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 24,
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    color: '#777',
    marginTop: 12,
  },
  value: {
    fontSize: 20,
    color: '#111',
    fontWeight: '500',
  },
  logout: {
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
