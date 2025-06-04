/**
 * Haptic Tab Component
 * 
 * Alt tab bar butonlarına dokunsal feedback (haptic) ekleyen wrapper component.
 * iOS'ta butonlara basıldığında hafif titreşim efekti verir.
 * 
 * @purpose Tab navigation with haptic feedback
 * @usage Tab layout'ta tabBarButton olarak kullanılır
 * @used_in app/(tabs)/_layout.tsx - tab bar butonları için
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
