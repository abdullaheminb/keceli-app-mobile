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

import RewardBanner from '../../../components/RewardBanner';
import UserHeader from '../../../components/UserHeader';
import { Colors, Components, Layout, Typography } from '../../../css';
import { completeHabitNew, fixUserMaxHealth, getActiveHabits, getHabitCompletionsNew, getUser, getWeeklyHabitCompletionsNew, uncompleteHabitNew } from '../../../services/firebase';
import { Habit, HabitCompletion, User } from '../../../types';
import Content from './content';

export default function HabitsScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [weeklyCompletions, setWeeklyCompletions] = useState<HabitCompletion[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRewardBanner, setShowRewardBanner] = useState(false);
  const [lastReward, setLastReward] = useState({ gold: 0, can: 0, points: 0 });

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
          maxHealth: 100,
        };
      } else {
        // Only fix user if they actually exceed maxHealth (optimization)
        const currentCan = userData.lives || 0;
        const maxHealth = userData.maxHealth || 100;
        
        if (currentCan > maxHealth || !userData.maxHealth) {
          await fixUserMaxHealth(profileId);
          // Reload user data after fixing
          userData = await getUser(profileId);
        }
      }

      // Load habits and completions from Firebase (read-only)
      const [habitsData, completionsData, weeklyCompletionsData] = await Promise.all([
        getActiveHabits(), // Just read existing habits
        getHabitCompletionsNew(profileId, selectedDate), // NEW: Use subcollection approach
        getWeeklyHabitCompletionsNew(profileId, selectedDate) // NEW: Use subcollection approach
      ]);

      // Set state
      setUser(userData);
      setHabits(habitsData);
      setCompletions(completionsData);
      setWeeklyCompletions(weeklyCompletionsData);
      
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
          const [completionsData, weeklyCompletionsData] = await Promise.all([
            getHabitCompletionsNew(user.id, selectedDate), // NEW: Use subcollection approach
            getWeeklyHabitCompletionsNew(user.id, selectedDate) // NEW: Use subcollection approach
          ]);
          setCompletions(completionsData);
          setWeeklyCompletions(weeklyCompletionsData);
        } catch (error) {
          console.error('Error loading completions:', error);
          setCompletions([]); // Clear completions on error
          setWeeklyCompletions([]);
        }
      } else {
        setCompletions([]);
        setWeeklyCompletions([]);
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

  // Weekly habits için özel completion check
  const isWeeklyHabitCompletedForDate = (habitId: string) => {
    return weeklyCompletions.some(completion => 
      completion.habitId === habitId && 
      completion.completed && 
      completion.date === selectedDate
    );
  };

  const handleHabitToggle = async (habit: Habit) => {
    if (!user) return;

    const isCompleted = habit.type === 'weekly' 
      ? isWeeklyHabitCompletedForDate(habit.id)
      : isHabitCompleted(habit.id);

    // 🚀 OPTIMISTIC UPDATE - Update UI immediately for instant feedback
    if (isCompleted) {
      // Immediately update local state (uncomplete)
      if (habit.type === 'weekly') {
        // Weekly habits için weekly completions'ı güncelle
        setWeeklyCompletions(prev => prev.filter(c => 
          !(c.habitId === habit.id && c.date === selectedDate)
        ));
      } else {
        // Daily habits için normal completions'ı güncelle
        setCompletions(prev => prev.filter(c => c.habitId !== habit.id));
      }
      
      setUser(prev => prev ? { 
        ...prev, 
        gold: Math.max(0, (prev.gold || 0) - habit.goldReward),
        lives: Math.max(0, (prev.lives || 0) - (habit.canReward || 0))
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
      
      if (habit.type === 'weekly') {
        // Weekly habits için weekly completions'ı güncelle
        setWeeklyCompletions(prev => [...prev, newCompletion]);
      } else {
        // Daily habits için normal completions'ı güncelle
        setCompletions(prev => [...prev, newCompletion]);
      }
      
      // Update user stats with maxHealth limit check
      setUser(prev => {
        if (!prev) return null;
        
        const newLives = (prev.lives || 0) + (habit.canReward || 0);
        const maxHealth = prev.maxHealth || 100;
        
        return { 
          ...prev, 
          gold: (prev.gold || 0) + habit.goldReward,
          lives: Math.min(newLives, maxHealth) // Prevent exceeding maxHealth
        };
      });

      // Show reward banner
      setLastReward({
        gold: habit.goldReward,
        can: habit.canReward || 0,
        points: habit.points || 0
      });
      setShowRewardBanner(true);
    }

    // 🔄 BACKGROUND SYNC - Sync with Firebase in background
    try {
      if (isCompleted) {
        await uncompleteHabitNew(user.id, habit.id, selectedDate, habit.goldReward, habit.canReward || 0); // NEW: Use subcollection approach
      } else {
        await completeHabitNew(user.id, habit.id, selectedDate, habit.goldReward, habit.canReward || 0, habit); // NEW: Use subcollection approach
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
        
        if (habit.type === 'weekly') {
          setWeeklyCompletions(prev => [...prev, rollbackCompletion]);
        } else {
          setCompletions(prev => [...prev, rollbackCompletion]);
        }
        
        // Update user stats with maxHealth limit check for rollback
        setUser(prev => {
          if (!prev) return null;
          
          const newLives = (prev.lives || 0) + (habit.canReward || 0);
          const maxHealth = prev.maxHealth || 100;
          
          return { 
            ...prev, 
            gold: (prev.gold || 0) + habit.goldReward,
            lives: Math.min(newLives, maxHealth) // Prevent exceeding maxHealth
          };
        });
      } else {
        // Rollback: remove the completion
        if (habit.type === 'weekly') {
          setWeeklyCompletions(prev => prev.filter(c => 
            !(c.habitId === habit.id && c.date === selectedDate)
          ));
        } else {
          setCompletions(prev => prev.filter(c => c.habitId !== habit.id));
        }
        
        setUser(prev => prev ? { 
          ...prev, 
          gold: Math.max(0, (prev.gold || 0) - habit.goldReward),
          lives: Math.max(0, (prev.lives || 0) - (habit.canReward || 0))
        } : null);
        
        // Hide reward banner on rollback
        setShowRewardBanner(false);
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
          weeklyCompletions={weeklyCompletions}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onHabitToggle={handleHabitToggle}
          isHabitCompleted={isHabitCompleted}
          isWeeklyHabitCompletedForDate={isWeeklyHabitCompletedForDate}
        />
      </ScrollView>
      
      {/* Reward Banner */}
      {showRewardBanner && (
        <RewardBanner
          goldReward={lastReward.gold}
          canReward={lastReward.can}
          points={lastReward.points}
          onHide={() => setShowRewardBanner(false)}
        />
      )}
    </SafeAreaView>
  );
} 