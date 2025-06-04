/**
 * Icon Symbol Component (iOS)
 * 
 * iOS için SF Symbols kullanan icon komponenti.
 * Native iOS iconlarını expo-symbols ile gösterir.
 * 
 * @features
 * - SF Symbols desteği
 * - Weight customization (regular, bold, etc.)
 * - Size ve color customization
 * - Native iOS görünümü
 * 
 * @purpose iOS-specific SF Symbols icon display
 * @used_in app/(tabs)/_layout.tsx - iOS'ta tab iconları, Collapsible - iOS'ta chevron
 */

import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
