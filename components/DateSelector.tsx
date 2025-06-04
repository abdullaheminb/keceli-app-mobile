/**
 * Date Selector Component
 * 
 * Kullanıcının farklı tarihleri seçmesini sağlayan yatay kaydırmalı takvim komponenti.
 * 8 günlük dönem gösterir (önceki cumartesiden başlayarak).
 * 
 * @features
 * - 8 gün gösterimi (önceki cumartesiden başlayarak)
 * - Seçili tarihi vurgulama
 * - Türkçe gün kısaltmaları (Cmt, Pz, Pzt, Sl, Çrş, Prş, Cm)
 * - Gelecek tarihleri disable etme
 * - Sadece bugün ve geçmiş tarihleri seçebilme
 * - Yatay scroll ile tarih gezinme
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
    
    // Bugünün hangi gün olduğunu bul (0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi)
    const todayDayOfWeek = today.getDay();
    
    // Önceki cumartesiyi bul
    // Eğer bugün cumartesi ise (6), önceki cumartesi 7 gün önce
    // Eğer bugün pazar ise (0), önceki cumartesi 1 gün önce
    // Eğer bugün pazartesi ise (1), önceki cumartesi 2 gün önce
    // ...
    let daysToLastSaturday;
    if (todayDayOfWeek === 6) { // Bugün cumartesi
      daysToLastSaturday = 7; // Önceki cumartesi
    } else {
      daysToLastSaturday = todayDayOfWeek + 1; // Cumartesi = 6, bu gün - cumartesi
    }
    
    // Önceki cumartesiden başlayarak 8 gün ekle
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysToLastSaturday + i);
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
    
    // Türkçe tam gün isimleri
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayOfWeek = date.getDay();
    const dayName = dayNames[dayOfWeek];
    
    return { day, month, dayName };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Bugünün başlangıcı
    date.setHours(0, 0, 0, 0); // Karşılaştırma tarihinin başlangıcı
    return date > today;
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
          const isDisabled = isFutureDate(date);
          const { day, month, dayName } = formatDisplayDate(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                Components.dateItem,
                isSelected && Components.dateItemSelected,
                isTodayDate && Components.dateItemToday,
                isDisabled && { opacity: 0.4 },
              ]}
              onPress={() => !isDisabled && onDateSelect(dateString)}
              disabled={isDisabled}
            >
              <Text style={[
                Typography.dayName,
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
                isDisabled && { color: Colors.textSecondary },
              ]}>
                {dayName}
              </Text>
              <Text style={[
                Typography.subtitleMedium,
                { marginBottom: 2 },
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
                isDisabled && { color: Colors.textSecondary },
              ]}>
                {day}
              </Text>
              <Text style={[
                Typography.captionBold,
                isSelected && { color: Colors.textLight },
                isTodayDate && { color: Colors.warning, fontWeight: '600' },
                isDisabled && { color: Colors.textSecondary },
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