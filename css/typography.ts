/**
 * Typography Styles
 * 
 * Uygulamada kullanılan tipografi stilleri.
 * Font boyutları, ağırlıkları ve satır yükseklikleri.
 */

import { StyleSheet } from 'react-native';
import Colors from './colors';

export const Typography = StyleSheet.create({
  // Headers
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: Colors.text,
  },
  
  titleLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  titleMedium: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  subtitleMedium: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Body Text
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  
  bodyLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  
  bodySecondary: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  
  bodySmall: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  // Captions
  caption: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Gün isimleri için küçük font
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  
  // Special
  link: {
    fontSize: 16,
    lineHeight: 30,
    color: Colors.link,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
});

export default Typography; 