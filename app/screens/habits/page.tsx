/**
 * Habits Main Screen
 * 
 * Ana alışkanlık takip sayfası. Firebase'den kullanıcı verilerini,
 * alışkanlıkları ve tamamlanmaları okur. Kullanıcı alışkanlıklarını
 * takip edebilir, tarih seçebilir ve gelişimini görebilir.
 * 
 * @features
 * - Kullanıcı bilgileri ve istatistikler
 * - Günlük alışkanlık listesi  
 * - Tarih seçimi ve geçmiş takibi
 * - Alışkanlık tamamlama/geri alma
 * - Debug mode ve mock data desteği
 * 
 * @purpose Core habit tracking functionality
 * @database Firebase Firestore (read-only mode)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import UserHeader from '../../../components/UserHeader';
import { getActiveHabits, getHabitCompletions, getUser } from '../../../services/firebase';
import { Habit, HabitCompletion, User } from '../../../types';
import Content from './content';

export default function HabitsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const loadData = async () => {
    try {
      const profileId = await AsyncStorage.getItem('profileId');
      if (!profileId) {
        Alert.alert('Hata', 'Profil ID bulunamadı');
        return;
      }

      console.log('Loading data for user:', profileId);

      // Load user data from Firebase (read-only)
      let userData = await getUser(profileId);
      console.log('=== USER DATA FROM FIREBASE ===');
      console.log('Raw userData:', userData);
      
      if (userData) {
        const rawData = userData as any; // Firebase raw data
        console.log('rawData.username:', rawData.username);
        console.log('rawData.makam:', rawData.makam);
        console.log('rawData.altin:', rawData.altin);
        console.log('rawData.can:', rawData.can);
      }
      
      if (!userData) {
        console.log('User not found in Firebase, using default values');
        // Don't create user, just use default values for UI
        userData = {
          id: profileId,
          name: 'Kullanıcı',
          lives: 5,
          gold: 0,
          makam: 0,
        };
      } else {
        console.log('Loaded existing user from Firebase:', userData);
      }

      console.log('Final userData before setState:', userData);

      // Load habits and completions from Firebase (read-only)
      console.log('Loading habits and completions...');
      const [habitsData, completionsData] = await Promise.all([
        getActiveHabits(), // Just read existing habits
        getHabitCompletions(profileId, selectedDate)
      ]);

      console.log('=== FIREBASE DATA LOADED (READ-ONLY) ===');
      console.log('User:', userData);
      console.log('Habits:', habitsData);
      console.log('Completions:', completionsData);
      console.log('Selected Date:', selectedDate);
      console.log('============================');

      // Set state and immediately log what was set
      setUser(userData);
      setHabits(habitsData);
      setCompletions(completionsData);
      
      console.log('State update called - userData name:', userData?.name);
      
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      
      // Show specific error message with fallback to mock data
      Alert.alert(
        'Firebase Okuma Hatası', 
        'Firebase\'den veri okunamadı. Mock data kullanılacak.\n\nHata: ' + errorMessage,
        [
          { text: 'Tekrar Dene', onPress: () => loadData() },
          { text: 'Mock Data Kullan', onPress: () => loadMockData() }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMockData = () => {
    // Mock data for development
    const mockUser: User = {
      id: 'mock-user',
      name: 'Ali Yılmaz', // Mock username
      lives: 45, // Mock can (45/100)
      gold: 1250, // Mock altin
      makam: 3, // Mock makam (3 = Master seviyesi)
    };

    const mockHabits: Habit[] = [
      {
        id: '1',
        name: 'Su İçme', // Mock habitname
        description: 'Günde 2 litre su iç',
        icon: '💧',
        goldReward: 10,
        type: 'daily',
        isActive: true,
        createdAt: new Date(),
        makam: 0 // Çırak seviyesi
      },
      {
        id: '2',
        name: 'Kitap Okuma', // Mock habitname
        description: '30 dakika kitap oku',
        icon: '📚',
        goldReward: 25,
        type: 'daily',
        isActive: true,
        createdAt: new Date(),
        makam: 1 // İşçi seviyesi
      },
      {
        id: '3',
        name: 'Egzersiz', // Mock habitname
        description: '20 dakika spor yap',
        icon: '🏃‍♂️',
        goldReward: 30,
        type: 'daily',
        isActive: true,
        createdAt: new Date(),
        makam: 2 // Usta seviyesi
      }
    ];

    console.log('Loading MOCK data...');
    console.log('Mock User:', mockUser);
    console.log('Mock Habits:', mockHabits);
    
    setUser(mockUser);
    setHabits(mockHabits);
    setCompletions([]);
    setLoading(false);
  };

  // Load completions when date changes
  useEffect(() => {
    const loadCompletions = async () => {
      if (user && user.id) {
        try {
          console.log(`Loading completions for user: ${user.id}, date: ${selectedDate}`);
          const completionsData = await getHabitCompletions(user.id, selectedDate);
          console.log(`Loaded ${completionsData.length} completions for ${selectedDate}:`, completionsData);
          setCompletions(completionsData);
        } catch (error) {
          console.error('Error loading completions:', error);
          setCompletions([]); // Clear completions on error
        }
      } else {
        console.log('No user found, clearing completions');
        setCompletions([]);
      }
    };

    loadCompletions();
  }, [selectedDate, user?.id]); // Re-run when date or user changes

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      // Use Firebase data instead of mock data
      loadData();
      // Uncomment below line and comment above line for mock data
      // loadMockData();
    }, [selectedDate])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    // loadMockData();
  };

  const isHabitCompleted = (habitId: string) => {
    return completions.some(completion => 
      completion.habitId === habitId && completion.completed
    );
  };

  const handleHabitToggle = async (habit: Habit) => {
    if (!user) return;

    const isCompleted = isHabitCompleted(habit.id);

    try {
      if (isCompleted) {
        // Remove completion (local only)
        setCompletions(prev => prev.filter(c => c.habitId !== habit.id));
        setUser(prev => prev ? { 
          ...prev, 
          gold: Math.max(0, (prev.gold || 0) - habit.goldReward) 
        } : null);
        
        console.log(`Removed completion for habit: ${habit.name} on ${selectedDate} (LOCAL ONLY)`);
      } else {
        // Add completion (local only)
        const newCompletion: HabitCompletion = {
          id: Date.now().toString(),
          habitId: habit.id,
          userId: user.id,
          date: selectedDate,
          completed: true,
          completedAt: new Date(),
          goldEarned: habit.goldReward
        };
        setCompletions(prev => [...prev, newCompletion]);
        setUser(prev => prev ? { 
          ...prev, 
          gold: (prev.gold || 0) + habit.goldReward 
        } : null);
        
        console.log(`Added completion for habit: ${habit.name} on ${selectedDate} (LOCAL ONLY)`);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      Alert.alert('Hata', 'Local state güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Kullanıcı verileri yüklenemedi</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* User Header */}
        <UserHeader user={user || { id: '', name: 'Loading...', lives: 0, gold: 0, makam: '' }} />
        
        {/* Debug Section */}
        <View style={styles.debugSection}>
          <TouchableOpacity 
            style={styles.debugToggle}
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugToggleText}>
              {showDebug ? '🔼 Firebase Debug' : '🔽 Firebase Debug'}
            </Text>
          </TouchableOpacity>
          
          {showDebug && (
            <View style={styles.debugButtons}>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => loadData()}
              >
                <Text style={styles.debugButtonText}>🔄 Reload Firebase Data (Read-Only)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => loadMockData()}
              >
                <Text style={styles.debugButtonText}>📝 Use Mock Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('Current State:');
                  console.log('User:', user);
                  console.log('Habits:', habits);
                  console.log('Completions:', completions);
                  console.log('Selected Date:', selectedDate);
                  Alert.alert('Debug', `User: ${user?.name}\nHabits: ${habits.length}\nCompletions: ${completions.length}`);
                }}
              >
                <Text style={styles.debugButtonText}>📊 Show Current State</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Content Section - Calendar & Habits */}
        <Content
          user={user}
          habits={habits}
          completions={completions}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onHabitToggle={handleHabitToggle}
          isHabitCompleted={isHabitCompleted}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10, // Çentiğe çarpmaması için üst boşluk
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  debugSection: {
    padding: 16,
  },
  debugToggle: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  debugButtons: {
    marginTop: 12,
    gap: 8,
  },
  debugButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  debugButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
}); 