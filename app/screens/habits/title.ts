// Makam seviyeleri mapping (number -> string)
export const MAKAM_MAP: { [key: number]: string } = {
  0: 'Çırak',
  1: 'İşçi',
  2: 'Usta',
  3: 'Master',
  4: 'Efsane'
};

/**
 * Number makam seviyesini string makam adına çevirir
 * @param makamNumber - Makam seviyesi (number)
 * @returns Makam adı (string)
 */
export const getMakamName = (makamNumber: number): string => {
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
 * Kullanıcı adını formatlar
 * @param username - Kullanıcı adı
 * @returns Formatlanmış kullanıcı adı
 */
export const formatUsername = (username: string | undefined): string => {
  if (!username || username.trim() === '') {
    return 'Misafir';
  }
  return username.trim();
};

/**
 * Altın miktarını formatlar
 * @param gold - Altın miktarı
 * @returns Formatlanmış altın string'i
 */
export const formatGold = (gold: number | undefined): string => {
  const goldAmount = gold || 0;
  if (goldAmount >= 1000) {
    return `${(goldAmount / 1000).toFixed(1)}K`;
  }
  return goldAmount.toString();
};

/**
 * Can miktarını formatlar
 * @param lives - Can miktarı
 * @returns Formatlanmış can string'i
 */
export const formatLives = (lives: number | undefined): string => {
  const livesAmount = lives || 0;
  return livesAmount.toString();
};

/**
 * Profil resmini formatlar
 * @param profilePic - Profil resmi URL'i
 * @returns Geçerli profil resmi URL'i veya default
 */
export const formatProfilePic = (profilePic: string | undefined): string => {
  if (!profilePic || profilePic.trim() === '') {
    return 'https://via.placeholder.com/50x50/cccccc/ffffff?text=U'; // Default avatar
  }
  return profilePic.trim();
};

/**
 * Kullanıcı verilerini kontrol eder
 * @param user - Kullanıcı objesi
 * @returns Kullanıcı verilerinin geçerliliği
 */
export const isValidUserData = (user: any): boolean => {
  return user && typeof user === 'object';
};

/**
 * Firebase user datasını app formatına çevirir
 * @param userData - Firebase'den gelen user data
 * @returns Formatlanmış user objesi
 */
export const formatUserData = (userData: any) => {
  if (!isValidUserData(userData)) {
    return {
      name: 'Misafir',
      makam: 0,
      gold: 0,
      lives: 0,
      profilePic: formatProfilePic(undefined)
    };
  }

  return {
    name: formatUsername(userData.username),
    makam: userData.makam || 0,
    gold: userData.altin || 0,
    lives: userData.can || 0,
    profilePic: formatProfilePic(userData.profilePic)
  };
}; 