/**
 * Themed View Component
 * 
 * Tema renklerini destekleyen view komponenti.
 * Light/dark mode'a göre otomatik background renk değişimi yapar.
 * 
 * @features
 * - Otomatik tema background renk desteği
 * - Custom light/dark background renkler
 * - Standart View props desteği
 * 
 * @purpose Themed view container with automatic background color switching
 * @used_in Collapsible, ParallaxScrollView, +not-found sayfalarında
 */

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
