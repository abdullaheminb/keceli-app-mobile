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

import React from 'react';
import { Text, View } from 'react-native';

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
  
  const renderDailyHabits = () => {
    const dailyHabits = habits.filter(habit => habit.type === 'daily');
    const filteredHabits = filterHabitsByUserPermission(dailyHabits, user);

    return (
      <View style={{ padding: 16 }}>
        <Text style={Typography.subtitleMedium}>Günlük Alışkanlıklar</Text>
        
        {filteredHabits.map((habit) => {
          const isCompleted = isHabitCompleted(habit.id);
          
          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted}
              onToggle={() => onHabitToggle(habit)}
            />
          );
        })}
      </View>
    );
  };

  const renderWeeklyHabits = () => {
    const weeklyHabits = habits.filter(habit => habit.type === 'weekly');
    const filteredHabits = filterHabitsByUserPermission(weeklyHabits, user);
    
    // Only show weekly habits that should be visible on selected date
    const visibleHabits = filteredHabits.filter(habit => 
      shouldShowWeeklyHabit(habit, selectedDate)
    );

    if (visibleHabits.length === 0) return null;

    return (
      <View style={{ padding: 16 }}>
        <Text style={Typography.subtitleMedium}>Haftalık Alışkanlıklar</Text>
        
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
          
          return (
            <View key={habit.id}>
              <HabitCard
                habit={habit}
                isCompleted={isCompleted}
                onToggle={() => onHabitToggle(habit)}
                disabled={isDisabled}
              />
              {/* Show weekly progress for "any" day habits */}
              {habit.weekday === 'any' && (
                <Text style={[Typography.bodySmall, { paddingLeft: 16, paddingBottom: 8, color: '#666' }]}>
                  Bu hafta: {completionCount}/{habit.repeat || 1} tamamlandı
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={Layout.container}>
      {/* Date Selector */}
      <DateSelector 
        selectedDate={selectedDate} 
        onDateSelect={onDateSelect} 
      />
      
      {/* Habits Section */}
      <View style={{ paddingVertical: 16 }}>
        {habits.length === 0 ? (
          <View style={Components.emptyState}>
            <Text style={Typography.subtitleMedium}>Henüz alışkanlık yok</Text>
            <Text style={[Typography.bodySmall, { textAlign: 'center' }]}>
              Firebase'den habits çekilemiyor. Debug paneli ile test edin.
            </Text>
          </View>
        ) : (
          <>
            {renderDailyHabits()}
            {renderWeeklyHabits()}
            
            {/* Show message if no accessible daily habits */}
            {(() => {
              const dailyHabits = habits.filter(habit => habit.type === 'daily');
              const accessibleHabits = dailyHabits.filter(habit => canUserAccessHabit(user, habit));
              
              if (dailyHabits.length > 0 && accessibleHabits.length === 0) {
                return (
                  <View style={Components.emptyState}>
                    <Text style={Typography.subtitleMedium}>Bu seviye için alışkanlık yok</Text>
                    <Text style={[Typography.bodySmall, { textAlign: 'center' }]}>
                      {dailyHabits.length} alışkanlık bulundu ama {user?.makam || 'mevcut'} seviyeniz için erişilebilir değil
                    </Text>
                  </View>
                );
              }
              
              if (dailyHabits.length === 0) {
                return (
                  <View style={Components.emptyState}>
                    <Text style={Typography.subtitleMedium}>Bu tarih için günlük alışkanlık yok</Text>
                    <Text style={[Typography.bodySmall, { textAlign: 'center' }]}>
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