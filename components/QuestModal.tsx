/**
 * Quest Modal Component
 * 
 * Quest detaylarını gösteren modal komponenti.
 * Tam ekran modal tasarımı.
 * 
 * @features
 * - Üstte quest resmi ve kapatma butonu
 * - Başlık ve meta veriler
 * - Kaydırılabilir açıklama
 * - Sabit üstlen butonu
 * 
 * @purpose Quest details modal with full screen design
 * @used_in Adventure sayfası
 */

import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getMakamName } from '../constants';
import { ModalStyles } from '../css';
import { Quest } from '../services/firebase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuestModalProps {
  quest: Quest | null;
  visible: boolean;
  onClose: () => void;
  onAccept: (quest: Quest) => void;
}

export function QuestModal({ quest, visible, onClose, onAccept }: QuestModalProps) {
  if (!quest) return null;

  const formatWeekday = (weekday: string) => {
    const days: { [key: string]: string } = {
      'monday': 'Pazartesi',
      'tuesday': 'Salı',
      'wednesday': 'Çarşamba',
      'thursday': 'Perşembe',
      'friday': 'Cuma',
      'saturday': 'Cumartesi',
      'sunday': 'Pazar'
    };
    return days[weekday.toLowerCase()] || weekday;
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={ModalStyles.safeAreaBackground}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={ModalStyles.container}>
          <View style={ModalStyles.imageContainer}>
          {quest.feat_img ? (
            <Image
              source={{ uri: quest.feat_img }}
              style={ModalStyles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={ModalStyles.placeholderImage}>
              <Text style={ModalStyles.placeholderText}>🏆</Text>
            </View>
          )}
          
          <TouchableOpacity style={ModalStyles.closeButton} onPress={onClose}>
            <Text style={ModalStyles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={ModalStyles.contentContainer}>
          <ScrollView style={ModalStyles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={ModalStyles.title}>{quest.title}</Text>

            <View style={ModalStyles.metaContainer}>
              {quest.reward > 0 && (
                <View style={ModalStyles.metaItem}>
                  <Text style={ModalStyles.metaIcon}>🪙</Text>
                  <Text style={ModalStyles.metaText}>Ödül: {quest.reward} altın</Text>
                </View>
              )}

              {quest.weekday && quest.weekday !== 'any' && (
                <View style={ModalStyles.metaItem}>
                  <Text style={ModalStyles.metaIcon}>📅</Text>
                  <Text style={ModalStyles.metaText}>Gün: {formatWeekday(quest.weekday)}</Text>
                </View>
              )}

              <View style={ModalStyles.metaItem}>
                <Text style={ModalStyles.metaIcon}>⭐</Text>
                <Text style={ModalStyles.metaText}>Seviye: {getMakamName(quest.makam)}</Text>
              </View>
            </View>

            <View style={ModalStyles.descriptionContainer}>
              <Text style={ModalStyles.descriptionTitle}>Görev Açıklaması</Text>
              <Text style={ModalStyles.description}>{quest.description}</Text>
            </View>

            {/* Extra space for scroll to avoid button overlap */}
            <View style={ModalStyles.bottomSpacer} />
          </ScrollView>

          <View style={ModalStyles.actionContainer}>
            <TouchableOpacity
              style={ModalStyles.acceptButton}
              onPress={() => onAccept(quest)}
            >
              <Text style={ModalStyles.acceptButtonText}>Üstlen</Text>
            </TouchableOpacity>
          </View>
        </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default QuestModal; 