import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Habit, HabitCompletion, User } from '../types';

// User operations
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    console.log('Fetching user from Firebase:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('=== RAW FIREBASE USER DATA ===');
      console.log('Document ID:', userDoc.id);
      console.log('Raw userData object:', userData);
      console.log('All fields in userData:');
      Object.keys(userData).forEach(key => {
        console.log(`  ${key}:`, userData[key], `(type: ${typeof userData[key]})`);
      });
      console.log('================================');
      
      const user = { 
        id: userDoc.id, 
        name: userData.username || userData.name || 'Kullanıcı',
        profileImage: userData.profileImage,
        lives: userData.can || userData.lives || 5,
        gold: userData.altin || userData.gold || 0,
        makam: userData.makam || 0, // Firebase'den number olarak direkt kullan
      } as User;
      
      console.log('=== MAPPED USER OBJECT ===');
      console.log('Final mapped user:', user);
      console.log('Field mappings:');
      console.log('  username/name:', userData.username, '||', userData.name, '->', user.name);
      console.log('  can/lives:', userData.can, '||', userData.lives, '->', user.lives);
      console.log('  altin/gold:', userData.altin, '||', userData.gold, '->', user.gold);
      console.log('  makam (NUMBER):', userData.makam, `(${typeof userData.makam})`, '->', user.makam);
      console.log('==========================');
      return user;
    } else {
      console.log('User document does not exist');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createUser = async (userId: string, userData: Omit<User, 'id'>): Promise<User> => {
  try {
    console.log('Creating user in Firebase:', userId, userData);
    const userRef = doc(db, 'users', userId);
    const newUserData = {
      name: userData.name || 'Nur Yolcusu',
      lives: userData.lives || 5,
      gold: userData.gold || 0,
      makam: userData.makam || 0,
      profileImage: userData.profileImage || null,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };
    
    await setDoc(userRef, newUserData);
    console.log('User created successfully');
    
    return { 
      id: userId, 
      name: newUserData.name,
      lives: newUserData.lives,
      gold: newUserData.gold,
      makam: newUserData.makam,
      profileImage: newUserData.profileImage
    } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUserGold = async (userId: string, goldAmount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log('User does not exist, skipping gold update');
      return;
    }
    
    await updateDoc(userRef, {
      gold: increment(goldAmount),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user gold:', error);
    throw error;
  }
};

// Habit operations
export const getActiveHabits = async (): Promise<Habit[]> => {
  try {
    console.log('=== HABITS FETCH START ===');
    console.log('Fetching ALL habits from Firebase (no queries)...');
    
    // En basit yaklaşım - hiç query yok, sadece collection read
    const habitsRef = collection(db, 'habits');
    console.log('Getting collection reference...');
    
    const snapshot = await getDocs(habitsRef);
    console.log('Got snapshot, size:', snapshot.size);
    console.log('Snapshot empty?', snapshot.empty);
    
    if (snapshot.empty) {
      console.log('No habits found in Firebase');
      return [];
    }
    
    console.log('Processing', snapshot.size, 'habit documents...');
    const allHabits: Habit[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('--- Processing habit doc ---');
      console.log('Doc ID:', doc.id);
      console.log('Raw data:', data);
      console.log('habitname field:', data.habitname);
      console.log('name field:', data.name);
      console.log('isActive field:', data.isActive);
      console.log('makam field:', data.makam, `(type: ${typeof data.makam})`);
      
      const habit: Habit = {
        id: doc.id,
        name: data.habitname || data.name || 'Unnamed Habit',
        description: data.description || '',
        icon: data.icon || '📝',
        goldReward: data.goldReward || 0,
        type: data.type || 'daily',
        isActive: data.isActive !== false, // Default to true
        createdAt: data.createdAt?.toDate() || new Date(),
        makam: data.makam || 0 // Firebase'den number olarak direkt kullan
      };
      
      console.log('Mapped habit:', habit);
      allHabits.push(habit);
    });
    
    console.log('All habits mapped:', allHabits);
    console.log('=== HABITS FETCH END ===');
    return allHabits;
    
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

export const createHabit = async (habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habitData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating habit:', error);
    throw error;
  }
};

// Initialize default habits if collection is empty
export const initializeDefaultHabits = async (): Promise<void> => {
  try {
    console.log('Checking if habits collection exists...');
    const habitsSnapshot = await getDocs(collection(db, 'habits'));
    console.log('Habits collection size:', habitsSnapshot.size);
    
    if (habitsSnapshot.empty) {
      console.log('No habits found, creating default habits...');
      
      const defaultHabits = [
        {
          name: 'Su İçme',
          description: 'Günde 2 litre su iç',
          icon: '💧',
          goldReward: 10,
          type: 'daily' as const,
          isActive: true,
        },
        {
          name: 'Kitap Okuma',
          description: '30 dakika kitap oku',
          icon: '📚',
          goldReward: 25,
          type: 'daily' as const,
          isActive: true,
        },
        {
          name: 'Egzersiz',
          description: '20 dakika spor yap',
          icon: '🏃‍♂️',
          goldReward: 30,
          type: 'daily' as const,
          isActive: true,
        },
        {
          name: 'Meditasyon',
          description: '10 dakika nefes egzersizi',
          icon: '🧘‍♀️',
          goldReward: 20,
          type: 'daily' as const,
          isActive: true,
        },
        {
          name: 'Sağlıklı Beslenme',
          description: 'Sebze ve meyve tüket',
          icon: '🥗',
          goldReward: 15,
          type: 'daily' as const,
          isActive: true,
        }
      ];

      let createdCount = 0;
      for (const habit of defaultHabits) {
        try {
          const habitId = await createHabit(habit);
          console.log(`Created habit: ${habit.name} with ID: ${habitId}`);
          createdCount++;
        } catch (habitError) {
          console.error(`Failed to create habit ${habit.name}:`, habitError);
        }
      }
      
      console.log(`Successfully created ${createdCount} default habits`);
    } else {
      console.log('Habits already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing default habits:', error);
    throw error;
  }
};

// Force create habits for debugging
export const forceCreateHabits = async (): Promise<void> => {
  console.log('Force creating habits...');
  
  const defaultHabits = [
    {
      name: 'Su İçme',
      description: 'Günde 2 litre su iç',
      icon: '💧',
      goldReward: 10,
      type: 'daily' as const,
      isActive: true,
    },
    {
      name: 'Kitap Okuma',
      description: '30 dakika kitap oku',
      icon: '📚',
      goldReward: 25,
      type: 'daily' as const,
      isActive: true,
    }
  ];

  for (const habit of defaultHabits) {
    try {
      const habitId = await createHabit(habit);
      console.log(`Force created habit: ${habit.name} with ID: ${habitId}`);
    } catch (habitError) {
      console.error(`Failed to force create habit ${habit.name}:`, habitError);
    }
  }
};

// Habit completion operations
export const getHabitCompletions = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  try {
    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const completionsSnapshot = await getDocs(completionsQuery);
    return completionsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate() || new Date()
    } as HabitCompletion));
  } catch (error) {
    console.error('Error fetching habit completions:', error);
    throw error;
  }
};

export const completeHabit = async (userId: string, habitId: string, date: string, goldReward: number): Promise<void> => {
  try {
    // Add habit completion
    await addDoc(collection(db, 'habitCompletions'), {
      habitId,
      userId,
      date,
      completed: true,
      completedAt: serverTimestamp(),
      goldEarned: goldReward
    });

    // Try to update user's gold (will log warning if user doesn't exist)
    try {
      await updateUserGold(userId, goldReward);
    } catch (goldError) {
      console.warn('Could not update user gold, user may not exist:', goldError);
    }
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
};

export const uncompleteHabit = async (userId: string, habitId: string, date: string, goldReward: number): Promise<void> => {
  try {
    // Find and update the completion
    const completionsQuery = query(
      collection(db, 'habitCompletions'),
      where('userId', '==', userId),
      where('habitId', '==', habitId),
      where('date', '==', date)
    );
    const completionsSnapshot = await getDocs(completionsQuery);
    
    if (!completionsSnapshot.empty) {
      const completionDoc = completionsSnapshot.docs[0];
      await setDoc(doc(db, 'habitCompletions', completionDoc.id), {
        ...completionDoc.data(),
        completed: false
      });

      // Try to remove gold from user (will log warning if user doesn't exist)
      try {
        await updateUserGold(userId, -goldReward);
      } catch (goldError) {
        console.warn('Could not update user gold, user may not exist:', goldError);
      }
    }
  } catch (error) {
    console.error('Error uncompleting habit:', error);
    throw error;
  }
};

// Clear all habits for debugging
export const clearAllHabits = async (): Promise<void> => {
  try {
    console.log('Clearing all habits...');
    const habitsSnapshot = await getDocs(collection(db, 'habits'));
    
    const deletePromises = habitsSnapshot.docs.map(doc => {
      console.log('Deleting habit:', doc.id, doc.data().name);
      return setDoc(doc.ref, { ...doc.data(), isActive: false });
    });
    
    await Promise.all(deletePromises);
    console.log('All habits cleared (set to inactive)');
  } catch (error) {
    console.error('Error clearing habits:', error);
    throw error;
  }
}; 