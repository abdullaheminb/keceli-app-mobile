/**
 * Slider Component
 * 
 * Resim sliderı komponenti.
 * Firebase'den gelen slider verilerini gösterir.
 * 
 * @features
 * - Otomatik geçiş
 * - Resim üzerinde başlık ve açıklama
 * - Karartılmış arkaplan overlay
 * - Swipe desteği
 * 
 * @purpose Reusable image slider with overlay text
 * @used_in Adventure sayfası
 */

import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Slider } from '../services/firebase';

const { width: screenWidth } = Dimensions.get('window');

interface SliderComponentProps {
  sliders: Slider[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: number;
}

export function SliderComponent({
  sliders,
  autoPlay = true,
  autoPlayInterval = 3000,
  height = 200
}: SliderComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoPlay && sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === sliders.length - 1 ? 0 : prevIndex + 1
        );
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, sliders.length]);

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    setCurrentIndex(index);
  };

  if (!sliders || sliders.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz slider bulunamadı</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {sliders.map((slider, index) => (
          <View key={slider.id} style={styles.slide}>
            {slider.feat_img ? (
              <Image
                source={{ uri: slider.feat_img }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📸</Text>
              </View>
            )}
            
            <View style={styles.overlay}>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {slider.title}
                </Text>
                <Text style={styles.description} numberOfLines={3}>
                  {slider.description}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {sliders.length > 1 && (
        <View style={styles.dotsContainer}>
          {sliders.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot
              ]}
              onPress={() => setCurrentIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  slide: {
    width: screenWidth,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    marginTop: 'auto',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 3,
  },
  description: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default SliderComponent; 