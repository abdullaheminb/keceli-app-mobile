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
        maxHealth: userData.maxHealth || 100, // schema: maxHealth
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
    await updateDoc(userRef, {
      altin: increment(goldAmount) // schema: altin
    });
  } catch (error) {
    console.error('Error updating user gold:', error);
    throw error;
  }
};

// Update user can (lives) with maxHealth check
export const updateUserCan = async (userId: string, canAmount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // First get current user data to check maxHealth
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentCan = userData.can || 0;
      const maxHealth = userData.maxHealth || 100;
      
      // Calculate new can value
      const newCan = currentCan + canAmount;
      
      // Prevent can from exceeding maxHealth
      const cappedCan = Math.min(newCan, maxHealth);
      
      // Only update if the value would actually change
      if (cappedCan !== currentCan) {
        await updateDoc(userRef, {
          can: cappedCan // Set absolute value instead of increment to prevent exceeding maxHealth
        });
      }
    }
  } catch (error) {
    console.error('Error updating user can:', error);
    throw error;
  }
};

// Utility function to fix existing users who exceed maxHealth
export const fixUserMaxHealth = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentCan = userData.can || 0;
      let maxHealth = userData.maxHealth;
      
      const updates: any = {};
      
      // If maxHealth doesn't exist, set it to 100
      if (!maxHealth) {
        maxHealth = 100;
        updates.maxHealth = maxHealth;
        console.log(`User ${userId} maxHealth set to ${maxHealth}`);
      }
      
      // If current can exceeds maxHealth, cap it
      if (currentCan > maxHealth) {
        updates.can = maxHealth;
        console.log(`User ${userId} can reduced from ${currentCan} to ${maxHealth}`);
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }
    }
  } catch (error) {
    console.error('Error fixing user maxHealth:', error);
    throw error;
  }
};

// Debug function to check user data
export const debugUserData = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`=== DEBUG USER DATA for ${userId} ===`);
      console.log('Raw Firebase data:', userData);
      console.log('can:', userData.can);
      console.log('maxHealth:', userData.maxHealth);
      console.log('username:', userData.username);
      console.log('=====================================');
    } else {
      console.log(`User ${userId} does not exist in Firebase`);
    }
  } catch (error) {
    console.error('Error debugging user data:', error);
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
        canReward: data.canReward || 0, // schema: canReward
        points: data.points || 0, // schema: points
        type: data.frequency || 'daily', // schema: frequency (daily/weekly)
        repeat: data.repeat || 1, // schema: repeat
        weekday: data.weekday || '', // schema: weekday
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
    // 🔍 Query ALL habitLogs for this user+date (both completed and uncompleted)
    const allLogsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('date', '==', date) // schema: date
      // NOTE: Don't filter by completed here - we need to see all logs
    );
    
    const allLogsSnapshot = await getDocs(allLogsQuery);
    
    // ✅ Only return logs that are actually completed (for UI display)
    const completions = allLogsSnapshot.docs
      .filter(doc => doc.data().completed === true) // Only show completed ones
      .map(doc => {
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

// Get weekly habit completions for current week
export const getWeeklyHabitCompletions = async (userId: string, selectedDate: string): Promise<HabitCompletion[]> => {
  try {
    // Calculate week range (Saturday to Friday)
    const date = new Date(selectedDate);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Get Saturday of current week
    const start = new Date(date);
    const daysToSaturday = day === 6 ? 0 : (day + 1);
    start.setDate(date.getDate() - daysToSaturday);
    
    // Get Friday of current week (Saturday + 6 days)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    
    // Query all logs for this user within the week range
    const weekLogsQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('date', '>=', startDate), // schema: date
      where('date', '<=', endDate) // schema: date
    );
    
    const weekLogsSnapshot = await getDocs(weekLogsQuery);
    
    // Return all completed logs for the week
    const completions = weekLogsSnapshot.docs
      .filter(doc => doc.data().completed === true)
      .map(doc => {
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
    console.error('Error fetching weekly habit completions:', error);
    throw error;
  }
};

export const completeHabit = async (userId: string, habitId: string, date: string, goldReward: number, canReward: number = 0): Promise<void> => {
  try {
    // 🔍 First, check if a log already exists for this habit+date combination
    const existingLogQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('habitID', '==', habitId), // schema: habitID
      where('date', '==', date) // schema: date
      // NOTE: Don't filter by completed, we want any log for this habit+date
    );
    
    const existingLogSnapshot = await getDocs(existingLogQuery);
    
    if (!existingLogSnapshot.empty) {
      // ✅ Log exists, update it to completed: true
      const existingDoc = existingLogSnapshot.docs[0];
      
      await updateDoc(existingDoc.ref, {
        completed: true, // schema: completed
        state: 'approved', // schema: state
        timestamp: new Date().toISOString() // schema: timestamp
      });
    } else {
      // 🆕 No log exists, create a new one
      const habitLogData = {
        habitID: habitId, // schema: habitID (not habitId)
        completed: true, // schema: completed
        createdAt: serverTimestamp(), // schema: createdAt
        date: date, // schema: date
        state: 'approved', // schema: state
        timestamp: new Date().toISOString(), // schema: timestamp
        userId: userId // schema: userId
      };
      
      await addDoc(collection(db, 'habitLogs'), habitLogData);
    }

    // Try to update user's gold (altin field)
    try {
      if (goldReward > 0) {
        await updateUserGold(userId, goldReward);
      }
    } catch (goldError) {
      console.warn('Could not update user gold, user may not exist:', goldError);
    }

    // Try to update user's can (can field)
    try {
      if (canReward > 0) {
        await updateUserCan(userId, canReward);
      }
    } catch (canError) {
      console.warn('Could not update user can, user may not exist:', canError);
    }
  } catch (error) {
    console.error('Error completing habit:', error);
    throw error;
  }
};

export const uncompleteHabit = async (userId: string, habitId: string, date: string, goldReward: number, canReward: number = 0): Promise<void> => {
  try {
    // 🔍 Find any habit log for this habit+date combination (not just completed ones)
    const logQuery = query(
      collection(db, 'habitLogs'),
      where('userId', '==', userId), // schema: userId
      where('habitID', '==', habitId), // schema: habitID
      where('date', '==', date) // schema: date
      // NOTE: Don't filter by completed, we want any log for this habit+date
    );
    
    const logSnapshot = await getDocs(logQuery);
    
    if (!logSnapshot.empty) {
      const logDoc = logSnapshot.docs[0];
      
      // ❌ Update to uncompleted state
      await updateDoc(logDoc.ref, {
        completed: false, // schema: completed
        state: 'cancelled', // schema: state
        timestamp: new Date().toISOString() // schema: timestamp
      });

      // Try to remove gold from user (altin field)
      try {
        if (goldReward > 0) {
          await updateUserGold(userId, -goldReward);
        }
      } catch (goldError) {
        console.warn('Could not update user gold, user may not exist:', goldError);
      }

      // Try to remove can from user (can field)
      try {
        if (canReward > 0) {
          await updateUserCan(userId, -canReward);
        }
      } catch (canError) {
        console.warn('Could not update user can, user may not exist:', canError);
      }
    }
  } catch (error) {
    console.error('Error uncompleting habit:', error);
    throw error;
  }
}; 