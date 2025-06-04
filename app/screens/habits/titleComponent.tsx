/**
 * Habits Title Component with Utilities
 * 
 * Alışkanlıklar sayfasının başlık komponenti ve format utilities.
 * Kullanıcı bilgilerini (isim, makam, altın) formatlar ve gösterir.
 * Seçili tarihi güzel bir formatta gösterir.
 * 
 * @features
 * - Tarih formatı (Türkçe)
 * - Kullanıcı adı formatı
 * - Makam seviyesi dönüştürme (0=Çırak, 1=İşçi, ...)
 * - Altın miktarı formatı (1000+ için 1.2K formatı)
 * 
 * @utilities
 * - convertMakamToString() - UserHeader tarafından da kullanılır
 * - formatUsername(), formatGold() - internal utilities
 * 
 * @purpose Title display and utility functions for user data formatting
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { User } from '../../../types';

// Makam seviyeleri mapping (number -> string)
const MAKAM_MAP: { [key: number]: string } = {
  0: 'Çırak',
  1: 'İşçi',
  2: 'Usta',
  3: 'Master',
  4: 'Efsane'
};

/**
 * Number makam seviyesini string makam adına çevirir
 * @param makamNumber - Makam seviyesi (number)
 * @returns Makam adı (string)
 */
const getMakamName = (makamNumber: number): string => {
  return MAKAM_MAP[makamNumber] || 'Bilinmeyen makam';
};

/**
 * Number makamı string'e çevirir
 * @param makam - Makam değeri (number)
 * @returns Makam adı (string)
 */
export const convertMakamToString = (makam: number | undefined): string => {
  return getMakamName(makam || 0);
};

/**
 * Kullanıcı adını formatlar
 * @param username - Kullanıcı adı
 * @returns Formatlanmış kullanıcı adı
 */
const formatUsername = (username: string | undefined): string => {
  if (!username || username.trim() === '') {
    return 'Misafir';
  }
  return username.trim();
};

/**
 * Altın miktarını formatlar
 * @param gold - Altın miktarı
 * @returns Formatlanmış altın string'i
 */
const formatGold = (gold: number | undefined): string => {
  const goldAmount = gold || 0;
  if (goldAmount >= 1000) {
    return `${(goldAmount / 1000).toFixed(1)}K`;
  }
  return goldAmount.toString();
};

interface TitleProps {
  user: User;
  selectedDate: string;
}

export default function Title({ user, selectedDate }: TitleProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Alışkanlıklarım</Text>
        <Text style={styles.subtitle}>{formatDate(selectedDate)}</Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {formatUsername(user.name)}
        </Text>
        <Text style={styles.userLevel}>
          {convertMakamToString(typeof user.makam === 'number' ? user.makam : 0)}
        </Text>
        <Text style={styles.userGold}>
          🪙 {formatGold(user.gold)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  userLevel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginHorizontal: 12,
  },
  userGold: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '600',
  },
}); 