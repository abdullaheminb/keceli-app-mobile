/**
 * Adventure Screen - Performance Optimized
 * 
 * Macera sayfası - sliderlar ve quest görevleri.
 * Firebase'den slider ve quest verilerini çekerek gösterir.
 * 
 * @features
 * - Üstte adventure page sliderları
 * - Altta quest kartları listesi
 * - Quest modal detayları
 * - Quest üstlenme özelliği
 * - Performance optimizations: caching, lazy loading
 * 
 * @purpose Adventure page with sliders and quests - optimized
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestCard } from '../../../components/QuestCard';
import { QuestModal } from '../../../components/QuestModal';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import { SliderComponent } from '../../../components/SliderComponent';
import { AdventureStyles } from '../../../css';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

import {
  getActiveQuests,
  getSlidersForPage,
  Quest,
  questsCompletionService,
  Slider
} from '../../../services/firebase';

// Mock user ID - gerçek uygulamada auth context'den gelir
const MOCK_USER_ID = 'user123';

// Cache management
interface CacheData {
  sliders: Slider[];
  quests: Quest[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cacheData: CacheData | null = null;

// Skeleton components for loading states
const SliderSkeleton = () => (
  <SkeletonLoader style={AdventureStyles.sliderSkeleton}>
    <View style={AdventureStyles.skeletonBox} />
  </SkeletonLoader>
);

const QuestSkeleton = () => (
  <SkeletonLoader style={AdventureStyles.questSkeleton}>
    <View style={AdventureStyles.skeletonImageBox} />
    <View style={AdventureStyles.skeletonContent}>
      <View style={AdventureStyles.skeletonTitle} />
      <View style={AdventureStyles.skeletonText} />
      <View style={AdventureStyles.skeletonText} />
    </View>
  </SkeletonLoader>
);

export default function AdventureScreen() {
  // Performance monitoring
  usePerformanceMonitor('AdventureScreen');
  
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [slidersLoading, setSlidersLoading] = useState(true);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check cache validity
  const isCacheValid = useCallback(() => {
    if (!cacheData) return false;
    return Date.now() - cacheData.timestamp < CACHE_DURATION;
  }, []);

  // Load data with caching
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Use cache if valid and not forcing refresh
      if (!forceRefresh && isCacheValid()) {
        setSliders(cacheData!.sliders);
        setQuests(cacheData!.quests);
        setSlidersLoading(false);
        setQuestsLoading(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Load sliders and quests separately for better UX
      const slidersPromise = getSlidersForPage('adventure').then(data => {
        setSliders(data);
        setSlidersLoading(false);
        return data;
      });

      const questsPromise = getActiveQuests().then(data => {
        setQuests(data);
        setQuestsLoading(false);
        return data;
      });

      // Wait for both to complete
      const [slidersData, questsData] = await Promise.all([slidersPromise, questsPromise]);

      // Update cache
      cacheData = {
        sliders: slidersData,
        quests: questsData,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('Error loading adventure data:', error);
      Alert.alert('Hata', 'Veri yüklenirken bir hata oluştu.');
      setSlidersLoading(false);
      setQuestsLoading(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isCacheValid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuestPress = useCallback((quest: Quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  }, []);

  const handleQuestAccept = useCallback(async (quest: Quest) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Quest'i üstlen (completion service kullanarak)
      await questsCompletionService.complete(
        MOCK_USER_ID,
        quest.id,
        today,
        quest,
        {
          acceptedAt: new Date(),
          status: 'accepted'
        }
      );

      Alert.alert(
        'Başarılı! 🎉',
        `"${quest.title}" görevini üstlendin!`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setModalVisible(false);
              setSelectedQuest(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error accepting quest:', error);
      Alert.alert('Hata', 'Görev üstlenilirken bir hata oluştu.');
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedQuest(null);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Clear cache on manual refresh
    cacheData = null;
    loadData(true);
  }, [loadData]);

  // Memoize quest list to prevent unnecessary re-renders
  const questsList = useMemo(() => {
    if (questsLoading) {
      return Array.from({ length: 3 }, (_, index) => (
        <QuestSkeleton key={`skeleton-${index}`} />
      ));
    }

    if (quests.length === 0) {
      return (
        <View style={AdventureStyles.emptyState}>
          <Text style={AdventureStyles.emptyStateIcon}>🏰</Text>
          <Text style={AdventureStyles.emptyStateTitle}>Henüz görev yok</Text>
          <Text style={AdventureStyles.emptyStateText}>
            Yeni görevler yakında eklenecek!
          </Text>
        </View>
      );
    }

    return quests.map((quest) => (
      <QuestCard
        key={quest.id}
        quest={quest}
        onPress={() => handleQuestPress(quest)}
      />
    ));
  }, [quests, questsLoading, handleQuestPress]);

  // Show minimal loading initially, then progressive loading
  if (loading && !cacheData) {
    return (
      <SafeAreaView style={AdventureStyles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={AdventureStyles.container}>
          <SliderSkeleton />
          <View style={AdventureStyles.questsSection}>
            <Text style={AdventureStyles.sectionTitle}>Görevler</Text>
            <Text style={AdventureStyles.sectionSubtitle}>
              Uygun görevleri seç ve maceraya atıl!
            </Text>
            <QuestSkeleton />
            <QuestSkeleton />
            <QuestSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={AdventureStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={AdventureStyles.container}>
        <ScrollView
          style={AdventureStyles.scrollView}
          contentContainerStyle={AdventureStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Sliders */}
          {slidersLoading ? (
            <SliderSkeleton />
          ) : (
            <SliderComponent 
              sliders={sliders}
              height={200}
              autoPlay={true}
              autoPlayInterval={10000}
            />
          )}

          {/* Quests Section */}
          <View style={AdventureStyles.questsSection}>
            <Text style={AdventureStyles.sectionTitle}>Görevler</Text>
            <Text style={AdventureStyles.sectionSubtitle}>
              Uygun görevleri seç ve maceraya atıl!
            </Text>

            <View style={AdventureStyles.questsList}>
              {questsList}
            </View>
          </View>
        </ScrollView>

        {/* Quest Detail Modal */}
        <QuestModal
          quest={selectedQuest}
          visible={modalVisible}
          onClose={handleCloseModal}
          onAccept={handleQuestAccept}
        />
      </View>
    </SafeAreaView>
  );
}

 