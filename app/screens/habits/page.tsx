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
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';

import UserHeader from '../../../components/UserHeader';
import { Colors, Components, Layout, Typography } from '../../../css';
import { completeHabit, getActiveHabits, getHabitCompletions, getUser, uncompleteHabit } from '../../../services/firebase';
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

  const loadData = async () => {
    try {
      const profileId = await AsyncStorage.getItem('profileId');
      if (!profileId) {
        Alert.alert('Hata', 'Profil ID bulunamadı');
        return;
      }

      // Load user data from Firebase (read-only)
      let userData = await getUser(profileId);
      
      if (!userData) {
        // Don't create user, just use default values for UI
        userData = {
          id: profileId,
          name: 'Kullanıcı',
          lives: 5,
          gold: 0,
          makam: 0,
        };
      }

      // Load habits and completions from Firebase (read-only)
      const [habitsData, completionsData] = await Promise.all([
        getActiveHabits(), // Just read existing habits
        getHabitCompletions(profileId, selectedDate)
      ]);

      // Set state
      setUser(userData);
      setHabits(habitsData);
      setCompletions(completionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      
      // Show error message and retry option
      Alert.alert(
        'Firebase Bağlantı Hatası', 
        'Firebase\'den veri okunamadı. Lütfen internet bağlantınızı kontrol edin.\n\nHata: ' + errorMessage,
        [
          { text: 'Tekrar Dene', onPress: () => loadData() },
          { text: 'Tamam', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load completions when date changes
  useEffect(() => {
    const loadCompletions = async () => {
      if (user && user.id) {
        try {
          const completionsData = await getHabitCompletions(user.id, selectedDate);
          setCompletions(completionsData);
        } catch (error) {
          console.error('Error loading completions:', error);
          setCompletions([]); // Clear completions on error
        }
      } else {
        setCompletions([]);
      }
    };

    loadCompletions();
  }, [selectedDate, user?.id]); // Re-run when date or user changes

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadData(); // Always load Firebase data
    }, [selectedDate])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(); // Always reload Firebase data on pull-to-refresh
  };

  const isHabitCompleted = (habitId: string) => {
    return completions.some(completion => 
      completion.habitId === habitId && completion.completed
    );
  };

  const handleHabitToggle = async (habit: Habit) => {
    if (!user) return;

    const isCompleted = isHabitCompleted(habit.id);

    // 🚀 OPTIMISTIC UPDATE - Update UI immediately for instant feedback
    if (isCompleted) {
      // Immediately update local state (uncomplete)
      setCompletions(prev => prev.filter(c => c.habitId !== habit.id));
      setUser(prev => prev ? { 
        ...prev, 
        gold: Math.max(0, (prev.gold || 0) - habit.goldReward) 
      } : null);
    } else {
      // Immediately update local state (complete)
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
    }

    // 🔄 BACKGROUND SYNC - Sync with Firebase in background
    try {
      if (isCompleted) {
        await uncompleteHabit(user.id, habit.id, selectedDate, habit.goldReward);
      } else {
        await completeHabit(user.id, habit.id, selectedDate, habit.goldReward);
      }
    } catch (error) {
      console.error('Error syncing habit with Firebase:', error);
      
      // 🔄 ROLLBACK - Revert optimistic update on error
      if (isCompleted) {
        // Rollback: re-add the completion
        const rollbackCompletion: HabitCompletion = {
          id: Date.now().toString(),
          habitId: habit.id,
          userId: user.id,
          date: selectedDate,
          completed: true,
          completedAt: new Date(),
          goldEarned: habit.goldReward
        };
        setCompletions(prev => [...prev, rollbackCompletion]);
        setUser(prev => prev ? { 
          ...prev, 
          gold: (prev.gold || 0) + habit.goldReward 
        } : null);
      } else {
        // Rollback: remove the completion
        setCompletions(prev => prev.filter(c => c.habitId !== habit.id));
        setUser(prev => prev ? { 
          ...prev, 
          gold: Math.max(0, (prev.gold || 0) - habit.goldReward) 
        } : null);
      }
      
      Alert.alert('Senkronizasyon Hatası', 'Değişiklik Firebase\'e kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (loading) {
    return (
      <View style={Components.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typography.body, { marginTop: 16 }]}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={Components.errorContainer}>
        <Text style={Typography.errorText}>Kullanıcı verileri yüklenemedi</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={Layout.containerWithTopPadding}>
      <ScrollView 
        style={Layout.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* User Header */}
        <UserHeader user={user || { id: '', name: 'Loading...', lives: 0, gold: 0, makam: '' }} />
        
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