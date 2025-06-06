/**
 * Habit Permissions Utilities
 * 
 * Kullanıcının makam seviyesine göre hangi alışkanlıklara
 * erişebileceğini kontrol eden utility fonksiyonları.
 * 
 * @purpose User permission checking for habits based on makam level
 */

import { getMakamName } from '../constants';
import { Habit, User } from '../types';

/**
 * Number makamı string'e çevirir
 * @param makam - Makam değeri (number)
 * @returns Makam adı (string)
 */
export const convertMakamToString = (makam: number | undefined): string => {
  return getMakamName(makam || 0);
};

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
  const userMakamLevel = getMakamSeviye(user.makam);
  const habitMakamLevel = getMakamSeviye(habit.makam);
  
  return userMakamLevel >= habitMakamLevel;
};

/**
 * User'ın erişebileceği habit'leri filtreler
 */
export const filterHabitsByUserPermission = (habits: Habit[], user: User): Habit[] => {
  return habits.filter(habit => canUserAccessHabit(user, habit));
}; 