/**
 * Habit Card Component
 * 
 * Tek bir alışkanlığı gösteren kart komponenti.
 * Alışkanlık bilgileri, tamamlanma durumu ve tıklama işlevselliği içerir.
 * 
 * @features
 * - Alışkanlık adı, açıklaması ve ikonu
 * - Altın ödülü gösterimi
 * - Tamamlanma durumu (checkmark)
 * - Tıklanabilir toggle işlevi
 * - Disabled durumu desteği
 * 
 * @purpose Individual habit display and interaction
 * @used_in app/screens/habits/content.tsx - alışkanlık listesinde
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function HabitCard({ habit, isCompleted, onToggle, disabled = false }: HabitCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, isCompleted && styles.completed, disabled && styles.disabled]} 
      onPress={onToggle}
      disabled={disabled}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.name, isCompleted && styles.completedText]}>{habit.name}</Text>
          {habit.description && (
            <Text style={[styles.description, isCompleted && styles.completedText]}>
              {habit.description}
            </Text>
          )}
        </View>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.goldIcon}>🪙</Text>
          <Text style={[styles.reward, isCompleted && styles.completedText]}>
            +{habit.goldReward}
          </Text>
        </View>
        
        <View style={[styles.checkmark, isCompleted && styles.checkmarkCompleted]}>
          {isCompleted && <Text style={styles.checkmarkText}>✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completed: {
    backgroundColor: '#e8f5e8',
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  goldIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  reward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f39c12',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 