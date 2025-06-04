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
      
      // Map Firebase fields to app fields according to new schema
      const user = { 
        id: userDoc.id, 
        name: userData.username || userData.name || 'Kullanıcı', // schema: username
        profileImage: userData.profilePic || userData.profileImage, // schema: profilePic
        lives: userData.can || userData.lives || 5, // schema: can
        gold: userData.altin || userData.gold || 0, // schema: altin
        makam: userData.makam || 0, // schema: makam (number 0-4)
      } as User;
      
      console.log('=== MAPPED USER OBJECT ===');
      console.log('Final mapped user:', user);
      console.log('Field mappings (NEW SCHEMA):');
      console.log('  username:', userData.username, '->', user.name);
      console.log('  profilePic:', userData.profilePic, '->', user.profileImage);
      console.log('  can:', userData.can, '->', user.lives);
      console.log('  altin:', userData.altin, '->', user.gold);
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
    
    // Use new schema field names
    const newUserData = {
      username: userData.name || 'Nur Yolcusu', // schema: username
      can: userData.lives || 100, // schema: can (lives)
      altin: userData.gold || 0, // schema: altin (gold)
      makam: userData.makam || 0, // schema: makam (0-4)
      profilePic: userData.profileImage || null, // schema: profilePic
      ihlas: 0, // schema: ihlas (new field)
      role: 'user', // schema: role (new field)
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };
    
    await setDoc(userRef, newUserData);
    console.log('User created successfully with new schema');
    
    return { 
      id: userId, 
      name: newUserData.username,
      lives: newUserData.can,
      gold: newUserData.altin,
      makam: newUserData.makam,
      profileImage: newUserData.profilePic
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
    
    // Use new schema field name: altin
    await updateDoc(userRef, {
      altin: increment(goldAmount), // schema: altin (not gold)
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
    console.log('=== HABITS FETCH START (NEW SCHEMA) ===');
    console.log('Fetching habits from Firebase...');
    
    const habitsRef = collection(db, 'habits');
    const snapshot = await getDocs(habitsRef);
    console.log('Got snapshot, size:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('No habits found in Firebase');
      return [];
    }
    
    console.log('Processing', snapshot.size, 'habit documents...');
    const allHabits: Habit[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('--- Processing habit doc (NEW SCHEMA) ---');
      console.log('Doc ID:', doc.id);
      console.log('Raw data:', data);
      console.log('habitname field:', data.habitname); // schema: habitname
      console.log('makam field:', data.makam, `(type: ${typeof data.makam})`);
      console.log('isActive field:', data.isActive);
      console.log('reward field:', data.reward); // schema: reward (not goldReward)
      console.log('frequency field:', data.frequency); // schema: frequency
      
      const habit: Habit = {
        id: doc.id,
        name: data.habitname || 'Unnamed Habit', // schema: habitname
        description: data.description || '',
        icon: data.icon || '📝',
        goldReward: data.reward || data.points || 0, // schema: reward, points
        type: data.frequency || 'daily', // schema: frequency (daily/weekly)
        isActive: data.isActive !== false, // schema: isActive
        createdAt: data.createdAt?.toDate() || new Date(),
        makam: data.makam || 0 // schema: makam (0-4)
      };
      
      console.log('Mapped habit (NEW SCHEMA):', habit);
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
    // Map to new schema field names
    const newHabitData = {
      habitname: habitData.name, // schema: habitname
      makam: habitData.makam || 0, // schema: makam
      approval: 'auto', // schema: approval
      canReward: 0, // schema: canReward
      frequency: habitData.type || 'daily', // schema: frequency
      isActive: habitData.isActive !== false, // schema: isActive
      points: habitData.goldReward || 0, // schema: points
      repeat: 1, // schema: repeat
      reward: habitData.goldReward || 0, // schema: reward
      weekday: '', // schema: weekday
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'habits'), newHabitData);
    console.log('Habit created with new schema:', docRef.id);
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

// Habit completion operations - Updated for new habitLogs schema
export const getHabitCompletions = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  try {
    console.log('=== FETCHING HABIT LOGS (NEW SCHEMA) ===');
    console.log('User ID:', userId, 'Date:', date);
    
    // Query habitLogs collection with new schema fields
    const completionsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('date', '==', date), // schema: date
      where('completed', '==', true) // schema: completed
    );
    
    const completionsSnapshot = await getDocs(completionsQuery);
    console.log('Found', completionsSnapshot.size, 'habit logs');
    
    const completions = completionsSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing habit log:', doc.id, data);
      
      return { 
        id: doc.id, 
        habitId: data.habitID || data.habitId, // schema: habitID
        userId: data.userId, // schema: userId
        date: data.date, // schema: date
        completed: data.completed, // schema: completed
        completedAt: data.createdAt?.toDate() || new Date(), // schema: createdAt
        goldEarned: 0 // Not in schema, will calculate from habit
      } as HabitCompletion;
    });
    
    console.log('Mapped completions:', completions);
    console.log('=== HABIT LOGS FETCH END ===');
    return completions;
  } catch (error) {
    console.error('Error fetching habit completions:', error);
    throw error;
  }
};

export const completeHabit = async (userId: string, habitId: string, date: string, goldReward: number): Promise<void> => {
  try {
    console.log('=== COMPLETING HABIT (NEW SCHEMA) ===');
    console.log('User:', userId, 'Habit:', habitId, 'Date:', date);
    
    // Add habit log with new schema fields
    const habitLogData = {
      habitID: habitId, // schema: habitID (not habitId)
      completed: true, // schema: completed
      createdAt: serverTimestamp(), // schema: createdAt
      date: date, // schema: date
      state: 'approved', // schema: state
      timestamp: new Date().toISOString(), // schema: timestamp
      userId: userId // schema: userId
    };
    
    const docRef = await addDoc(collection(db, 'habitLogs'), habitLogData);
    console.log('Habit log created:', docRef.id);

    // Try to update user's gold (altin field)
    try {
      await updateUserGold(userId, goldReward);
      console.log('User gold updated:', goldReward);
    } catch (goldError) {
      console.warn('Could not update user gold, user may not exist:', goldError);
    }
    
    console.log('=== HABIT COMPLETION END ===');
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
};

export const uncompleteHabit = async (userId: string, habitId: string, date: string, goldReward: number): Promise<void> => {
  try {
    console.log('=== UNCOMPLETING HABIT (NEW SCHEMA) ===');
    console.log('User:', userId, 'Habit:', habitId, 'Date:', date);
    
    // Find the habit log with new schema fields
    const completionsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('habitID', '==', habitId), // schema: habitID
      where('date', '==', date), // schema: date
      where('completed', '==', true) // schema: completed
    );
    
    const completionsSnapshot = await getDocs(completionsQuery);
    console.log('Found', completionsSnapshot.size, 'habit logs to uncomplete');
    
    if (!completionsSnapshot.empty) {
      const completionDoc = completionsSnapshot.docs[0];
      console.log('Updating habit log:', completionDoc.id);
      
      // Update to uncompleted state
      await updateDoc(completionDoc.ref, {
        completed: false, // schema: completed
        state: 'cancelled', // schema: state
        timestamp: new Date().toISOString() // schema: timestamp
      });

      // Try to remove gold from user (altin field)
      try {
        await updateUserGold(userId, -goldReward);
        console.log('User gold reduced:', goldReward);
      } catch (goldError) {
        console.warn('Could not update user gold, user may not exist:', goldError);
      }
    } else {
      console.log('No habit log found to uncomplete');
    }
    
    console.log('=== HABIT UNCOMPLETION END ===');
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