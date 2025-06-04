/**
 * Habit Permissions Utilities
 * 
 * Kullanıcının makam seviyesine göre hangi alışkanlıklara
 * erişebileceğini kontrol eden utility fonksiyonları.
 * 
 * @purpose User permission checking for habits based on makam level
 */

import { Habit, User } from '../types';

// Makam seviyeleri mapping (number -> string)
const MAKAM_MAP: { [key: number]: string } = {
  0: 'Çalışkan Karınca',
  1: 'Azimli Çekirge',
  2: 'Pürdikkat Kertenkele',
  3: 'Arif Karga',
  4: 'İşlek Efendi'
};

/**
 * Number makam seviyesini string makam adına çevirir
 * @param makamNumber - Makam seviyesi (number)
 * @returns Makam adı (string)
 */
const getMakamName = (makamNumber: number): string => {
  return MAKAM_MAP[makamNumber] || 'Bilinmeyen makam';
};

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