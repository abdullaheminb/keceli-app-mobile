/**
 * Layout Styles
 * 
 * Ortak layout stilleri ve container'ları.
 * Flex, spacing, alignment gibi layout özelliklerini içerir.
 */

import { StyleSheet } from 'react-native';
import Colors from './colors';

export const Layout = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  containerPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  
  containerWithTopPadding: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 10,
  },
  
  // Surface styles
  surface: {
    backgroundColor: Colors.surface,
  },
  
  surfaceWithShadow: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Flex utilities
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  flex1: {
    flex: 1,
  },
  
  // Padding utilities
  padding: {
    padding: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
  
  paddingLarge: {
    padding: 24,
  },
  
  paddingSmall: {
    padding: 8,
  },
  
  // Margin utilities
  margin: {
    margin: 16,
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  marginTop: {
    marginTop: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  marginVertical: {
    marginVertical: 16,
  },
  
  // Border radius
  rounded: {
    borderRadius: 8,
  },
  
  roundedLarge: {
    borderRadius: 12,
  },
  
  roundedFull: {
    borderRadius: 30,
  },
});

export default Layout; 