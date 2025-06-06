/**
 * Modal Styles
 * 
 * Modal component'leri için özel stiller.
 * QuestModal ve diğer modal'lar için stil tanımları.
 */

import { Dimensions, StyleSheet } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const ModalStyles = StyleSheet.create({
  // QuestModal Base
  safeAreaBackground: {
    flex: 1,
    backgroundColor: '#000000', // Zorla siyah SafeArea
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  
  // Image Container
  imageContainer: {
    position: 'relative',
    height: screenHeight * 0.3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    opacity: 0.5,
  },
  
  // Close Button
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // Üstte kalması için
  },
  closeIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Content
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    lineHeight: 36,
  },
  
  // Meta Information
  metaContainer: {
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  metaText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  // Description
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  
  // Bottom Actions
  bottomSpacer: {
    height: 100, // Space for the fixed button
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ModalStyles; 