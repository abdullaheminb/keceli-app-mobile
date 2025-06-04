/**
 * Color Palette
 * 
 * Uygulamada kullanılan renk paleti.
 * Tutarlılık için tüm renkleri buradan export ediyoruz.
 */

export const Colors = {
  // Primary Colors
  primary: '#007AFF',
  secondary: '#f39c12',
  accent: '#4CAF50',
  
  // Background Colors
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceVariant: '#f8f9fa',
  surfaceSecondary: '#f9f9f9',
  
  // Text Colors
  text: '#333',
  textSecondary: '#666',
  textTertiary: '#999',
  textLight: '#fff',
  
  // Border Colors
  border: '#ddd',
  borderLight: '#e67e22',
  
  // Status Colors
  success: '#4CAF50',
  successLight: '#e8f5e8',
  warning: '#f39c12',
  warningLight: '#fff3cd',
  error: '#e74c3c',
  danger: '#ff6b6b',
  
  // Shadow
  shadow: '#000',
  
  // Specific Colors
  gold: '#f39c12',
  google: '#4285F4',
  link: '#0a7ea4',
} as const;

export default Colors; 