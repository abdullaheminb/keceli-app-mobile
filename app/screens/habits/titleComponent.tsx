import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { User } from '../../../types';
import { convertMakamToString, formatGold, formatUsername } from './title';

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