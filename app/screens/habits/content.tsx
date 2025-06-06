/**
 * Habits Content Component
 * 
 * Alışkanlıklar sayfasının ana içerik komponenti.
 * Tarih seçici ve alışkanlık listesini içerir.
 * 
 * @features
 * - Tarih seçici (DateSelector)
 * - Alışkanlık kartları listesi
 * - Alışkanlık tamamlama durumları
 * - İnteraktif alışkanlık toggle
 * 
 * @purpose Main content area for habit tracking interface
 */

import React, { useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import DateSelector from '../../../components/DateSelector';
import HabitCard from '../../../components/HabitCard';
import { Components, Layout, Typography } from '../../../css';
import { Habit, HabitCompletion, User } from '../../../types';
import { canUserAccessHabit, filterHabitsByUserPermission } from '../../../utils/habitPermissions';
import {
  getWeeklyHabitCompletionCount,
  isWeeklyHabitCompleted,
  isWeeklyHabitDisabled,
  shouldShowWeeklyHabit
} from '../../../utils/weeklyHabits';

interface ContentProps {
  user: User;
  habits: Habit[];
  completions: HabitCompletion[];
  weeklyCompletions: HabitCompletion[]; // Weekly completions for current week
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onHabitToggle: (habit: Habit) => void;
  isHabitCompleted: (habitId: string) => boolean;
  isWeeklyHabitCompletedForDate: (habitId: string) => boolean;
}

export default function Content({ 
  user, 
  habits, 
  completions, 
  weeklyCompletions, 
  selectedDate, 
  onDateSelect, 
  onHabitToggle, 
  isHabitCompleted, 
  isWeeklyHabitCompletedForDate 
}: ContentProps) {
  
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedAnimation] = useState(new Animated.Value(0));

  // Toggle completed section
  const toggleCompleted = () => {
    const toValue = showCompleted ? 0 : 1;
    setShowCompleted(!showCompleted);
    
    Animated.timing(completedAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const renderDailyHabits = (showOnlyCompleted = false) => {
    const dailyHabits = habits.filter(habit => habit.type === 'daily');
    const filteredHabits = filterHabitsByUserPermission(dailyHabits, user);
    
    // Filter based on completion status
    const visibleHabits = filteredHabits.filter(habit => {
      const isCompleted = isHabitCompleted(habit.id);
      return showOnlyCompleted ? isCompleted : !isCompleted;
    });

    if (visibleHabits.length === 0) return null;

    return (
      <View style={showOnlyCompleted ? {} : Components.habitsSection}>
        {!showOnlyCompleted && (
          <Text style={Typography.subtitleMedium}>Günlük Alışkanlıklar</Text>
        )}
        
        {visibleHabits.map((habit) => {
          const isCompleted = isHabitCompleted(habit.id);
          
          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted}
              onToggle={() => onHabitToggle(habit)}
              animateCompletion={!showOnlyCompleted}
              showRepeatInsteadOfReward={showOnlyCompleted}
              completionCount={showOnlyCompleted ? 1 : 0}
            />
          );
        })}
      </View>
    );
  };

  const renderWeeklyHabits = (showOnlyCompleted = false) => {
    const weeklyHabits = habits.filter(habit => habit.type === 'weekly');
    const filteredHabits = filterHabitsByUserPermission(weeklyHabits, user);
    
    // Only show weekly habits that should be visible on selected date
    const visibleHabits = filteredHabits.filter(habit => {
      if (!shouldShowWeeklyHabit(habit, selectedDate)) return false;
      
      // Filter based on completion status
      const isCompleted = habit.weekday === 'any' 
        ? isWeeklyHabitCompletedForDate(habit.id)
        : isWeeklyHabitCompleted(habit, selectedDate, weeklyCompletions);
      
      const isDisabled = isWeeklyHabitDisabled(habit, selectedDate, weeklyCompletions);
      
      if (showOnlyCompleted) {
        // Tamamlanmış bölümde: gerçekten completed olanlar VEYA disabled olanlar (kotaya ulaşan weekly)
        return isCompleted || (habit.weekday === 'any' && isDisabled);
      } else {
        // Ana bölümde: completed olmayan VE disabled olmayan
        return !isCompleted && !isDisabled;
      }
    });

    if (visibleHabits.length === 0) return null;

    return (
      <View style={showOnlyCompleted ? {} : Components.habitsSection}>
        {!showOnlyCompleted && (
          <Text style={Typography.subtitleMedium}>Haftalık Alışkanlıklar</Text>
        )}
        
        {visibleHabits.map((habit) => {
          // Weekly habits için günlük completion durumunu kontrol et
          const isCompleted = habit.weekday === 'any' 
            ? isWeeklyHabitCompletedForDate(habit.id)
            : isWeeklyHabitCompleted(habit, selectedDate, weeklyCompletions);
            
          const isDisabled = isWeeklyHabitDisabled(habit, selectedDate, weeklyCompletions);
          
          // For "any" day weekly habits, show completion count
          const completionCount = habit.weekday === 'any' 
            ? getWeeklyHabitCompletionCount(habit.id, selectedDate, weeklyCompletions)
            : 0;
          
          // Completed section'da farklı logic
          if (showOnlyCompleted) {
            // Completed section'da: o gün tamamlanmış ise yeşil ve clickable, değilse gri
            const shouldShowAsCompleted = isCompleted;
            const shouldDisable = !isCompleted; // Sadece o gün tamamlanmamışsa disable
            const shouldHideCheckbox = !isCompleted; // Sadece o gün tamamlanmamışsa checkbox gizle
            
            return (
              <View key={habit.id}>
                <HabitCard
                  habit={habit}
                  isCompleted={shouldShowAsCompleted}
                  onToggle={() => onHabitToggle(habit)}
                  disabled={shouldDisable}
                  animateCompletion={false}
                  hideCheckbox={shouldHideCheckbox}
                  showRepeatInsteadOfReward={true}
                  completionCount={habit.weekday === 'any' ? completionCount : 1}
                  forceGrayStyle={!isCompleted} // O gün tamamlanmamışsa gri göster
                />
              </View>
            );
          } else {
            // Ana section'da normal logic
            return (
              <View key={habit.id}>
                <HabitCard
                  habit={habit}
                  isCompleted={isCompleted}
                  onToggle={() => onHabitToggle(habit)}
                  disabled={isDisabled}
                  animateCompletion={true}
                  hideCheckbox={false}
                  showRepeatInsteadOfReward={false}
                  completionCount={0}
                  forceGrayStyle={false}
                />
              </View>
            );
          }
        })}
      </View>
    );
  };

  // Count completed habits
  const getCompletedCount = () => {
    const dailyCompleted = habits.filter(habit => 
      habit.type === 'daily' && 
      canUserAccessHabit(user, habit) && 
      isHabitCompleted(habit.id)
    ).length;
    
    const weeklyCompleted = habits.filter(habit => {
      if (habit.type !== 'weekly' || !canUserAccessHabit(user, habit)) return false;
      if (!shouldShowWeeklyHabit(habit, selectedDate)) return false;
      
      const isCompleted = habit.weekday === 'any' 
        ? isWeeklyHabitCompletedForDate(habit.id)
        : isWeeklyHabitCompleted(habit, selectedDate, weeklyCompletions);
      
      const isDisabled = isWeeklyHabitDisabled(habit, selectedDate, weeklyCompletions);
      const completionCount = habit.weekday === 'any' 
        ? getWeeklyHabitCompletionCount(habit.id, selectedDate, weeklyCompletions)
        : 0;
      
      // Count as completed if: actually completed OR quota reached (disabled)
      return isCompleted || (habit.weekday === 'any' && completionCount >= (habit.repeat || 1));
    }).length;
    
    return dailyCompleted + weeklyCompleted;
  };

  // Check if there are any habits to show in completed section
  const hasCompletedHabits = () => {
    // Check daily habits
    const hasCompletedDaily = habits.some(habit => 
      habit.type === 'daily' && 
      canUserAccessHabit(user, habit) && 
      isHabitCompleted(habit.id)
    );
    
    // Check weekly habits
    const hasCompletedWeekly = habits.some(habit => {
      if (habit.type !== 'weekly' || !canUserAccessHabit(user, habit)) return false;
      if (!shouldShowWeeklyHabit(habit, selectedDate)) return false;
      
      const isCompleted = habit.weekday === 'any' 
        ? isWeeklyHabitCompletedForDate(habit.id)
        : isWeeklyHabitCompleted(habit, selectedDate, weeklyCompletions);
      
      const isDisabled = isWeeklyHabitDisabled(habit, selectedDate, weeklyCompletions);
      const completionCount = habit.weekday === 'any' 
        ? getWeeklyHabitCompletionCount(habit.id, selectedDate, weeklyCompletions)
        : 0;
      
      // Show if: actually completed OR quota reached (disabled)
      return isCompleted || (habit.weekday === 'any' && completionCount >= (habit.repeat || 1));
    });
    
    return hasCompletedDaily || hasCompletedWeekly;
  };

  return (
    <View style={Layout.container}>
      {/* Date Selector */}
      <DateSelector 
        selectedDate={selectedDate} 
        onDateSelect={onDateSelect} 
      />
      
      {/* Habits Section */}
      <View style={Components.habitsContainer}>
        {habits.length === 0 ? (
          <View style={Components.emptyState}>
            <Text style={Typography.subtitleMedium}>Henüz alışkanlık yok</Text>
            <Text style={[Typography.bodySmall, Components.centerText]}>
              Firebase'den habits çekilemiyor. Debug paneli ile test edin.
            </Text>
          </View>
        ) : (
          <>
            {renderDailyHabits(false)}
            {renderWeeklyHabits(false)}
            
            {/* Completed Habits Section */}
            {hasCompletedHabits() && (
              <View style={Components.habitsSection}>
                <TouchableOpacity onPress={toggleCompleted} style={Components.completedToggle}>
                  <Text style={Typography.subtitleMedium}>
                    Tamamladıkların ({getCompletedCount()})
                  </Text>
                  <Text style={Typography.subtitleMedium}>
                    {showCompleted ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                
                <Animated.View style={[
                  Components.completedContainer,
                  {
                    maxHeight: completedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1000],
                    }),
                    opacity: completedAnimation,
                  }
                ]}>
                  {renderDailyHabits(true)}
                  {renderWeeklyHabits(true)}
                </Animated.View>
              </View>
            )}
            
            {/* Show message if no accessible habits */}
            {(() => {
              const dailyHabits = habits.filter(habit => habit.type === 'daily');
              const accessibleHabits = dailyHabits.filter(habit => canUserAccessHabit(user, habit));
              
              if (dailyHabits.length > 0 && accessibleHabits.length === 0) {
                return (
                  <View style={Components.emptyState}>
                    <Text style={Typography.subtitleMedium}>Bu seviye için alışkanlık yok</Text>
                    <Text style={[Typography.bodySmall, Components.centerText]}>
                      {dailyHabits.length} alışkanlık bulundu ama {user?.makam || 'mevcut'} seviyeniz için erişilebilir değil
                    </Text>
                  </View>
                );
              }
              
              if (dailyHabits.length === 0) {
                return (
                  <View style={Components.emptyState}>
                    <Text style={Typography.subtitleMedium}>Bu tarih için günlük alışkanlık yok</Text>
                    <Text style={[Typography.bodySmall, Components.centerText]}>
                      Toplam {habits.length} alışkanlık bulundu ama hiçbiri 'daily' tipinde değil
                    </Text>
                  </View>
                );
              }
              
              return null;
            })()}
          </>
        )}
      </View>
    </View>
  );
} 