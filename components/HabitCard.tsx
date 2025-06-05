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

import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  disabled?: boolean;
  animateCompletion?: boolean;
  hideCheckbox?: boolean;
  showRepeatInsteadOfReward?: boolean;
  completionCount?: number; // For weekly habits showing current/total
  forceGrayStyle?: boolean; // For quota completed but not completed today
}

export default function HabitCard({ 
  habit, 
  isCompleted, 
  onToggle, 
  disabled = false,
  animateCompletion = false,
  hideCheckbox = false,
  showRepeatInsteadOfReward = false,
  completionCount = 0,
  forceGrayStyle = false
}: HabitCardProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCompleted = useRef(isCompleted);

  useEffect(() => {
    // Only animate when transitioning from incomplete to complete
    if (animateCompletion && !prevCompleted.current && isCompleted) {
      console.log('Starting completion animation for habit:', habit.name);
      
      // Completion animation sequence
      Animated.sequence([
        // Scale up slightly
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale back and slide down with opacity
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.85,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 100,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        console.log('Completion animation finished for habit:', habit.name);
      });
    } else if (!isCompleted && prevCompleted.current) {
      // Reset animation when uncompleted
      console.log('Resetting animation for habit:', habit.name);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }
    
    // Update previous state
    prevCompleted.current = isCompleted;
  }, [isCompleted, animateCompletion, slideAnim, scaleAnim, habit.name]);

  const cardStyle = [
    Components.card,
    (isCompleted && !forceGrayStyle) && Components.cardCompleted,
    (disabled || forceGrayStyle) && Components.cardDisabled
  ];

  const textStyle = (isCompleted && !forceGrayStyle) ? {
    textDecorationLine: 'line-through' as const,
    color: Colors.textTertiary,
  } : (disabled || forceGrayStyle) ? {
    textDecorationLine: 'line-through' as const,
    color: Colors.textSecondary,
    opacity: 0.7,
  } : undefined;

  return (
    <Animated.View style={{
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim }
      ],
      opacity: slideAnim.interpolate({
        inputRange: [0, 50, 100],
        outputRange: [1, 0.8, 0.3],
      }),
    }}>
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
            {showRepeatInsteadOfReward ? (
              <>
                <Text style={{ fontSize: 16, marginRight: 4 }}>🔁</Text>
                <Text style={[
                  {
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.textSecondary,
                  },
                  textStyle
                ]}>
                  {completionCount}/{habit.repeat || 1}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ 
                  fontSize: 16, 
                  marginRight: 4,
                  opacity: (disabled || forceGrayStyle) ? 0.5 : 1 
                }}>🪙</Text>
                <Text style={[
                  {
                    fontSize: 14,
                    fontWeight: '600',
                    color: Colors.gold,
                  },
                  textStyle,
                  (disabled || forceGrayStyle) && { 
                    color: Colors.textSecondary,
                    opacity: 0.7 
                  }
                ]}>
                  +{habit.goldReward}
                </Text>
              </>
            )}
          </View>
          
          {!hideCheckbox && (
            <View style={[Components.checkmark, (isCompleted && !forceGrayStyle) && Components.checkmarkCompleted]}>
              {(isCompleted && !forceGrayStyle) && <Text style={{
                color: Colors.textLight,
                fontSize: 14,
                fontWeight: 'bold',
              }}>✓</Text>}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
} 