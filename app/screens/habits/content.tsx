import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import DateSelector from '../../../components/DateSelector';
import HabitCard from '../../../components/HabitCard';
import { Habit, HabitCompletion, User } from '../../../types';
import { canUserAccessHabit } from '../../../utils/habitPermissions';

interface ContentProps {
  user: User;
  habits: Habit[];
  completions: HabitCompletion[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onHabitToggle: (habit: Habit) => void;
  isHabitCompleted: (habitId: string) => boolean;
}

export default function Content({ 
  user, 
  habits, 
  completions, 
  selectedDate, 
  onDateSelect, 
  onHabitToggle, 
  isHabitCompleted 
}: ContentProps) {
  
  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <DateSelector 
        selectedDate={selectedDate} 
        onDateSelect={onDateSelect} 
      />
      
      {/* Habits Section */}
      <View style={styles.habitsSection}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz alışkanlık yok</Text>
            <Text style={styles.emptySubtext}>
              Firebase'den habits çekilemiyor. Debug paneli ile test edin.
            </Text>
          </View>
        ) : (
          <>
            {/* Show daily habits for selected date */}
            {(() => {
              const filteredHabits = habits
                .filter(habit => habit.type === 'daily')
                .filter(habit => canUserAccessHabit(user, habit));
              
              console.log(`Total habits: ${habits.length}, Daily habits: ${habits.filter(h => h.type === 'daily').length}, Accessible habits: ${filteredHabits.length}`);
              
              return filteredHabits.map(habit => {
                const isCompleted = isHabitCompleted(habit.id);
                console.log(`Rendering habit: ${habit.name}, completed: ${isCompleted}, date: ${selectedDate}, makam: ${habit.makam}`);
                
                return (
                  <HabitCard
                    key={`${habit.id}-${selectedDate}`} // Unique key for each date
                    habit={habit}
                    isCompleted={isCompleted}
                    onToggle={() => onHabitToggle(habit)}
                  />
                );
              });
            })()}
            
            {/* Show message if no accessible daily habits */}
            {(() => {
              const dailyHabits = habits.filter(habit => habit.type === 'daily');
              const accessibleHabits = dailyHabits.filter(habit => canUserAccessHabit(user, habit));
              
              if (dailyHabits.length > 0 && accessibleHabits.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Bu seviye için alışkanlık yok</Text>
                    <Text style={styles.emptySubtext}>
                      {dailyHabits.length} alışkanlık bulundu ama {user?.makam || 'mevcut'} seviyeniz için erişilebilir değil
                    </Text>
                  </View>
                );
              }
              
              if (dailyHabits.length === 0) {
                return (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Bu tarih için günlük alışkanlık yok</Text>
                    <Text style={styles.emptySubtext}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  habitsSection: {
    paddingVertical: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 