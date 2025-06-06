/**
 * Adventure Screen
 * 
 * Macera sayfası - sliderlar ve quest görevleri.
 * Firebase'den slider ve quest verilerini çekerek gösterir.
 * 
 * @features
 * - Üstte adventure page sliderları
 * - Altta quest kartları listesi
 * - Quest modal detayları
 * - Quest üstlenme özelliği
 * 
 * @purpose Adventure page with sliders and quests
 */

import React, { useEffect, useState } from 'react';
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
import { SliderComponent } from '../../../components/SliderComponent';
import { AdventureStyles } from '../../../css';

import {
  getActiveQuests,
  getSlidersForPage,
  Quest,
  questsCompletionService,
  Slider
} from '../../../services/firebase';

// Mock user ID - gerçek uygulamada auth context'den gelir
const MOCK_USER_ID = 'user123';

export default function AdventureScreen() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak sliders ve quests'i çek
      const [slidersData, questsData] = await Promise.all([
        getSlidersForPage('adventure'),
        getActiveQuests()
      ]);

      setSliders(slidersData);
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading adventure data:', error);
      Alert.alert('Hata', 'Veri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuestPress = (quest: Quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  };

  const handleQuestAccept = async (quest: Quest) => {
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
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedQuest(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={AdventureStyles.safeArea}>
        <View style={AdventureStyles.container}>
          <View style={AdventureStyles.loadingContainer}>
            <Text style={AdventureStyles.loadingText}>Yükleniyor...</Text>
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
          <SliderComponent 
            sliders={sliders}
            height={200}
            autoPlay={true}
            autoPlayInterval={4000}
          />

          {/* Quests Section */}
          <View style={AdventureStyles.questsSection}>
            <Text style={AdventureStyles.sectionTitle}>Görevler</Text>
            <Text style={AdventureStyles.sectionSubtitle}>
              Uygun görevleri seç ve maceraya atıl!
            </Text>

            {quests.length > 0 ? (
              <View style={AdventureStyles.questsList}>
                {quests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onPress={() => handleQuestPress(quest)}
                  />
                ))}
              </View>
            ) : (
              <View style={AdventureStyles.emptyState}>
                <Text style={AdventureStyles.emptyStateIcon}>🏰</Text>
                <Text style={AdventureStyles.emptyStateTitle}>Henüz görev yok</Text>
                <Text style={AdventureStyles.emptyStateText}>
                  Yeni görevler yakında eklenecek!
                </Text>
              </View>
            )}
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

 