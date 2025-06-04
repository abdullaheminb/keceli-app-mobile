/**
 * Habit Permissions Utilities
 * 
 * Kullanıcının makam seviyesine göre hangi alışkanlıklara
 * erişebileceğini kontrol eden utility fonksiyonları.
 * 
 * @purpose User permission checking for habits based on makam level
 */

import { Habit, User } from '../types';

/**
 * User'ın makam seviyesini number olarak döndürür
 * Firebase'den number geliyor, direkt kullanıyoruz
 */
export const getMakamSeviye = (makam: number | undefined): number => {
  return makam || 0; // Firebase'den number gelir, yoksa 0
};

/**
 * User'ın bir habit'e erişip erişemeyeceğini kontrol eder
 * User makam >= Habit makam ise erişebilir
 */
export const canUserAccessHabit = (user: User, habit: Habit): boolean => {
  console.log('=== HABIT ACCESS CHECK ===');
  console.log('User:', user.name, 'User makam:', user.makam);
  console.log('Habit:', habit.name, 'Habit makam:', habit.makam);
  
  const userMakamLevel = getMakamSeviye(user.makam);
  const habitMakamLevel = getMakamSeviye(habit.makam);
  
  console.log('User makam level:', userMakamLevel);
  console.log('Habit makam level:', habitMakamLevel);
  
  const canAccess = userMakamLevel >= habitMakamLevel;
  console.log('Can access:', canAccess);
  console.log('========================');
  
  return canAccess;
};

/**
 * User'ın erişebileceği habit'leri filtreler
 */
export const filterHabitsByUserPermission = (habits: Habit[], user: User): Habit[] => {
  console.log('=== FILTERING HABITS BY PERMISSION ===');
  console.log('Input habits count:', habits.length);
  console.log('User:', user.name, 'makam:', user.makam);
  
  const filtered = habits.filter(habit => canUserAccessHabit(user, habit));
  
  console.log('Filtered habits count:', filtered.length);
  console.log('===================================');
  
  return filtered;
}; 