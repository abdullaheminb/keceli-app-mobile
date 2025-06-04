import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Habit, HabitCompletion, User } from '../types';

// User operations
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Map Firebase fields to app fields according to new schema
      const user = { 
        id: userDoc.id, 
        name: userData.username || userData.name || 'Kullanıcı', // schema: username
        profileImage: userData.profilePic || userData.profileImage, // schema: profilePic
        lives: userData.can || userData.lives || 5, // schema: can
        gold: userData.altin || userData.gold || 0, // schema: altin
        makam: userData.makam || 0, // schema: makam (number 0-4)
      } as User;
      
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserGold = async (userId: string, goldAmount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists first
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
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
    const habitsRef = collection(db, 'habits');
    const snapshot = await getDocs(habitsRef);
    
    if (snapshot.empty) {
      return [];
    }
    
    const allHabits: Habit[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
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
      
      allHabits.push(habit);
    });
    
    return allHabits;
    
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error;
  }
};

// Habit completion operations
export const getHabitCompletions = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  try {
    // Query habitLogs collection with new schema fields
    const completionsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('date', '==', date), // schema: date
      where('completed', '==', true) // schema: completed
    );
    
    const completionsSnapshot = await getDocs(completionsQuery);
    
    const completions = completionsSnapshot.docs.map(doc => {
      const data = doc.data();
      
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
    
    return completions;
  } catch (error) {
    console.error('Error fetching habit completions:', error);
    throw error;
  }
};

export const completeHabit = async (userId: string, habitId: string, date: string, goldReward: number): Promise<void> => {
  try {
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

    // Try to update user's gold (altin field)
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
    // Find the habit log with new schema fields
    const completionsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('habitID', '==', habitId), // schema: habitID
      where('date', '==', date), // schema: date
      where('completed', '==', true) // schema: completed
    );
    
    const completionsSnapshot = await getDocs(completionsQuery);
    
    if (!completionsSnapshot.empty) {
      const completionDoc = completionsSnapshot.docs[0];
      
      // Update to uncompleted state
      await updateDoc(completionDoc.ref, {
        completed: false, // schema: completed
        state: 'cancelled', // schema: state
        timestamp: new Date().toISOString() // schema: timestamp
      });

      // Try to remove gold from user (altin field)
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