/**
 * Reward Banner Component
 * 
 * Habit tamamlandığında ekranın altında gösterilen reward banner'ı.
 * Kazanılan altın, can ve point miktarlarını ikonlarıyla gösterir.
 * 
 * @features
 * - Yeşil renk teması
 * - İkonlar ile reward gösterimi
 * - Otomatik kaybolma
 * - Animate giriş/çıkış
 * 
 * @purpose Show rewards when habit is completed
 */

import React, { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { Colors, Typography } from '../css';

interface RewardBannerProps {
  goldReward: number;
  canReward: number;
  points: number;
  onHide: () => void;
}

export default function RewardBanner({ goldReward, canReward, points, onHide }: RewardBannerProps) {
  const [slideAnim] = useState(new Animated.Value(100)); // Start from bottom

  useEffect(() => {
    // Slide in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onHide();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [slideAnim, onHide]);

  return (
    <Animated.View style={{
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      backgroundColor: Colors.success,
      paddingHorizontal: 20,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      transform: [{ translateY: slideAnim }],
    }}>
      {goldReward > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 16 }}>🪙</Text>
          <Text style={[Typography.buttonText, { fontSize: 14, fontWeight: '600' }]}>
            +{goldReward}
          </Text>
        </View>
      )}
      
      {canReward > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 16 }}>❤️</Text>
          <Text style={[Typography.buttonText, { fontSize: 14, fontWeight: '600' }]}>
            +{canReward}
          </Text>
        </View>
      )}
      
      {points > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 16 }}>⭐</Text>
          <Text style={[Typography.buttonText, { fontSize: 14, fontWeight: '600' }]}>
            +{points}
          </Text>
        </View>
      )}
    </Animated.View>
  );
} 