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
import { Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function HabitCard({ habit, isCompleted, onToggle, disabled = false }: HabitCardProps) {
  const cardStyle = [
    Components.card,
    isCompleted && Components.cardCompleted,
    disabled && Components.cardDisabled
  ];

  const textStyle = isCompleted ? {
    textDecorationLine: 'line-through' as const,
    color: Colors.textTertiary,
  } : undefined;

  return (
    <TouchableOpacity 
      style={cardStyle} 
      onPress={onToggle}
      disabled={disabled}
    >
      <View style={[Layout.row, Layout.alignCenter, Layout.padding]}>
        <View style={Components.iconContainer}>
          <Text style={{ fontSize: 24 }}>{habit.icon}</Text>
        </View>
        
        <View style={[Layout.flex1, { marginRight: 12 }]}>
          <Text style={[Typography.bodyMedium, textStyle]}>{habit.name}</Text>
          {habit.description && (
            <Text style={[Typography.bodySmall, textStyle]}>
              {habit.description}
            </Text>
          )}
        </View>
        
        <View style={[Layout.row, Layout.alignCenter, { marginRight: 12 }]}>
          <Text style={{ fontSize: 16, marginRight: 4 }}>🪙</Text>
          <Text style={[
            {
              fontSize: 14,
              fontWeight: '600',
              color: Colors.gold,
            },
            textStyle
          ]}>
            +{habit.goldReward}
          </Text>
        </View>
        
        <View style={[Components.checkmark, isCompleted && Components.checkmarkCompleted]}>
          {isCompleted && <Text style={{
            color: Colors.textLight,
            fontSize: 14,
            fontWeight: 'bold',
          }}>✓</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
} 