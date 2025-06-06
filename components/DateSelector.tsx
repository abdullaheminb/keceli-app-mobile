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

import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Components, Layout, Typography } from '../css';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
}

export default function DateSelector({ selectedDate, onDateSelect }: DateSelectorProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Haftanın başlangıcını Cumartesi olarak ayarla
    const start = new Date(today);
    
    // Cumartesi'ye kadar geriye git
    const daysToSaturday = day === 6 ? 0 : (day + 1);
    start.setDate(today.getDate() - daysToSaturday);
    
    // Önceki cumartesiden başlayarak 8 gün ekle
    for (let i = 0; i < 8; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
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

  // Seçilen tarihi ortala (ilk açılışta bugün, sonra seçilen tarih)
  useEffect(() => {
    if (scrollViewRef.current && scrollViewWidth > 0) {
      // Seçilen tarihin index'ini bul
      const selectedIndex = dates.findIndex(date => formatDate(date) === selectedDate);
      
      if (selectedIndex !== -1) {
        // Her date item'ın genişliği yaklaşık 80px
        const itemWidth = 80;
        const centerOffset = scrollViewWidth / 2;
        const scrollToX = Math.max(0, (selectedIndex * itemWidth) - centerOffset + (itemWidth / 2));
        
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: scrollToX,
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedDate, scrollViewWidth]); // selectedDate değiştiğinde scroll et

  return (
    <View style={{
      backgroundColor: Colors.surface,
      paddingVertical: 16,
      marginBottom: 8,
      paddingLeft: 20,
    }}>
      <Text style={Typography.subtitleMedium}>Günlük Takip</Text>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={Layout.paddingHorizontal}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setScrollViewWidth(width);
        }}
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