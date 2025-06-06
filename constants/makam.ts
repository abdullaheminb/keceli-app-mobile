/**
 * Makam Constants
 * 
 * Makam seviyelerinin isimlendirmesi için ortak constants.
 * Tüm projede tutarlılık sağlar.
 * 
 * @purpose Unified makam level naming across the app
 */

// Makam seviyeleri mapping (number -> string)
export const MAKAM_MAP: { [key: number]: string } = {
  0: 'Çalışkan Karınca',
  1: 'Azimli Çekirge',
  2: 'Pürdikkat Kertenkele',
  3: 'Arif Karga',
  4: 'İşlek Efendi'
};

// Makam isimlerinin array formatı (index = makam seviyesi)
export const MAKAM_NAMES: string[] = [
  'Çalışkan Karınca',
  'Azimli Çekirge',
  'Pürdikkat Kertenkele',
  'Arif Karga',
  'İşlek Efendi'
];

/**
 * Number makam seviyesini string makam adına çevirir
 * @param makamNumber - Makam seviyesi (number)
 * @returns Makam adı (string)
 */
export const getMakamName = (makamNumber: number): string => {
  return MAKAM_MAP[makamNumber] || 'Bilinmeyen makam';
};

/**
 * Makam seviyesi geçerli mi kontrol eder
 * @param makamNumber - Kontrol edilecek makam seviyesi
 * @returns boolean
 */
export const isValidMakamLevel = (makamNumber: number): boolean => {
  return makamNumber >= 0 && makamNumber < MAKAM_NAMES.length;
};

/**
 * Maksimum makam seviyesini döndürür
 * @returns number
 */
export const getMaxMakamLevel = (): number => {
  return MAKAM_NAMES.length - 1;
}; 