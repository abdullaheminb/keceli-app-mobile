/**
 * Date Selector Component
 * 
 * Kullanıcının farklı tarihleri seçmesini sağlayan yatay kaydırmalı takvim komponenti.
 * Geçmiş ve gelecek günleri gösterir, seçili tarihi vurgular.
 * 
 * @features
 * - 30 gün geçmiş + bugün + 30 gün gelecek gösterimi
 * - Seçili tarihi vurgulama
 * - Türkçe ay isimleri ve gün kısaltmaları
 * - Yatay scroll ile tarih gezinme
 * - Bugünü otomatik merkeze alma
 * 
 * @purpose Date selection for habit tracking
 * @used_in app/screens/habits/content.tsx - tarih seçimi için
 */

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    // Bugünden önceki 3 gün, bugün, ve sonraki 3 gün
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatDisplayDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString('tr-TR', { month: 'short' });
    const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
    
    return { day, month, dayName };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const dates = generateDates();

  return (
    <View style={{
      backgroundColor: Colors.surface,
      paddingVertical: 16,
      marginBottom: 8,
      paddingLeft: 20,
    }}>
      <Text style={Typography.subtitleMedium}>Günlük Takip</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Layout.paddingHorizontal}
      >
        {dates.map((date, index) => {
          const dateString = formatDate(date);
          const isSelected = dateString === selectedDate;
          const isTodayDate = isToday(date);
          const { day, month, dayName } = formatDisplayDate(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                Components.dateItem,
                isSelected && Components.dateItemSelected,
                isTodayDate && Components.dateItemToday,
              ]}
              onPress={() => onDateSelect(dateString)}
            >
              <Text style={[
                Typography.captionBold,
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
              ]}>
                {dayName}
              </Text>
              <Text style={[
                Typography.subtitleMedium,
                { marginBottom: 2 },
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
              ]}>
                {day}
              </Text>
              <Text style={[
                Typography.captionBold,
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
              ]}>
                {month}
              </Text>
              {isTodayDate && !isSelected && (
                <View style={Components.todayDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
} 