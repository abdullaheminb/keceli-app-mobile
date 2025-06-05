/**
 * Component Styles
 * 
 * Ortak component stilleri.
 * Button, input, card gibi yaygın component'lar için stiller.
 */

import { StyleSheet } from 'react-native';
import Colors from './colors';

export const Components = StyleSheet.create({
  // Buttons
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  
  buttonGoogle: {
    backgroundColor: Colors.google,
  },
  
  buttonDebug: {
    padding: 10,
    backgroundColor: Colors.danger,
  },
  
  // Input
  input: {
    height: 50,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surfaceSecondary,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardCompleted: {
    backgroundColor: Colors.successLight,
    opacity: 0.8,
  },
  
  cardDisabled: {
    backgroundColor: Colors.surfaceVariant,
    opacity: 0.6,
    borderColor: Colors.borderLight,
  },
  
  // Header
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Avatar
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.secondary,
  },
  
  avatarDefault: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.borderLight,
  },
  
  // Date selector items
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
    position: 'relative',
  },
  
  dateItemSelected: {
    backgroundColor: Colors.primary,
  },
  
  dateItemToday: {
    backgroundColor: Colors.warningLight,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  
  // Icons and indicators
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkmarkCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  
  todayDot: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: [{ translateX: -2 }],
    width: 4,
    height: 4,
    backgroundColor: Colors.warning,
    borderRadius: 2,
  },
  
  // Empty states
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  // Habits sections
  habitsSection: {
    padding: 16,
  },

  habitsContainer: {
    paddingVertical: 16,
  },

  // Weekly progress text
  weeklyProgressText: {
    paddingLeft: 16,
    paddingBottom: 8,
    color: Colors.textSecondary,
  },

  // Center text for empty states
  centerText: {
    textAlign: 'center' as const,
  },

  // Completed habits toggle
  completedToggle: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    marginBottom: 8,
  },

  // Completed habits container
  completedContainer: {
    overflow: 'hidden' as const,
  },
} as const);

export default Components; 