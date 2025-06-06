/**
 * Quest Card Component
 * 
 * Quest görevlerini gösteren kart komponenti.
 * Habit kartlarından biraz daha büyük tasarım.
 * 
 * @features
 * - Quest resmi, başlığı ve kısa açıklaması
 * - Altın ödülü gösterimi
 * - Weekday bilgisi (any değilse)
 * - Tıklanabilir kart
 * 
 * @purpose Quest display card with quest details
 * @used_in Adventure sayfası
 */

import React from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { QuestCardStyles } from '../css';
import { Quest } from '../services/firebase';

interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

export function QuestCard({ quest, onPress }: QuestCardProps) {
  const formatWeekday = (weekday: string) => {
    const days: { [key: string]: string } = {
      'monday': 'Pazartesi',
      'tuesday': 'Salı',
      'wednesday': 'Çarşamba',
      'thursday': 'Perşembe',
      'friday': 'Cuma',
      'saturday': 'Cumartesi',
      'sunday': 'Pazar'
    };
    return days[weekday.toLowerCase()] || weekday;
  };

  return (
    <TouchableOpacity style={QuestCardStyles.card} onPress={onPress}>
      <View style={QuestCardStyles.imageContainer}>
        {quest.feat_img ? (
          <Image
            source={{ uri: quest.feat_img }}
            style={QuestCardStyles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={QuestCardStyles.placeholderImage}>
            <Text style={QuestCardStyles.placeholderText}>🏆</Text>
          </View>
        )}
      </View>

      <View style={QuestCardStyles.content}>
        <Text style={QuestCardStyles.title} numberOfLines={2}>
          {quest.title}
        </Text>

        <View style={QuestCardStyles.metaContainer}>
          {quest.reward > 0 && (
            <View style={QuestCardStyles.rewardContainer}>
              <Text style={QuestCardStyles.rewardIcon}>🪙</Text>
              <Text style={QuestCardStyles.rewardText}>{quest.reward}</Text>
            </View>
          )}

          {quest.weekday && quest.weekday !== 'any' && (
            <View style={QuestCardStyles.weekdayContainer}>
              <Text style={QuestCardStyles.weekdayIcon}>📅</Text>
              <Text style={QuestCardStyles.weekdayText}>
                {formatWeekday(quest.weekday)}
              </Text>
            </View>
          )}
        </View>

        <Text style={QuestCardStyles.briefDesc} numberOfLines={3}>
          {quest.brief_desc}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default QuestCard; 