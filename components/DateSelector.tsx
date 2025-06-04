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
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    <View style={styles.container}>
      <Text style={styles.title}>Günlük Takip</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
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
                styles.dateItem,
                isSelected && styles.selectedDate,
                isTodayDate && styles.todayDate,
              ]}
              onPress={() => onDateSelect(dateString)}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedText,
                isTodayDate && styles.todayText,
              ]}>
                {dayName}
              </Text>
              <Text style={[
                styles.day,
                isSelected && styles.selectedText,
                isTodayDate && styles.todayText,
              ]}>
                {day}
              </Text>
              <Text style={[
                styles.month,
                isSelected && styles.selectedText,
                isTodayDate && styles.todayText,
              ]}>
                {month}
              </Text>
              {isTodayDate && !isSelected && (
                <View style={styles.todayDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginBottom: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  selectedDate: {
    backgroundColor: '#007AFF',
  },
  todayDate: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#f39c12',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  day: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  month: {
    fontSize: 12,
    color: '#666',
  },
  selectedText: {
    color: 'white',
  },
  todayText: {
    color: '#f39c12',
    fontWeight: '600',
  },
  todayDot: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f39c12',
  },
}); 