/**
 * Skeleton Loader Component
 * 
 * Loading state için skeleton ekranları.
 * Shimmer animasyon efekti ile.
 * 
 * @features
 * - Shimmer animasyon
 * - Slider ve quest skeleton'ları
 * - Reusable komponent
 * 
 * @purpose Loading state skeleton screens with animations
 */

import React, { useEffect, useRef } from 'react';
import {
    Animated,
    ViewStyle
} from 'react-native';

interface SkeletonLoaderProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function SkeletonLoader({ style, children }: SkeletonLoaderProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
}

export default SkeletonLoader; 