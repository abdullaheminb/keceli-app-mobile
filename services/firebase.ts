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

// ====================================================================
// 🎯 MODULAR COMPLETION SYSTEM (NEW SUBCOLLECTION APPROACH)
// ====================================================================

/**
 * Interface for completion data structure
 */
interface CompletionData {
  id: string;
  completed: boolean;
  completedAt: any; // Firebase timestamp
  dates: string[]; // Array of completion dates
  progress: number;
  state: string;
}

/**
 * Generic completion service for any completion type (habits, quests, events, etc.)
 * This modular approach allows easy extension for future features
 */
class CompletionService {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get user's completions for a specific date
   */
  async getCompletionsForDate(userId: string, date: string): Promise<CompletionData[]> {
    try {
      const completionsRef = collection(db, 'users', userId, this.collectionName);
      const snapshot = await getDocs(completionsRef);
      
      return snapshot.docs
        .map(doc => ({
          id: doc.id, // This is the habitId/questId/eventId
          ...doc.data()
        } as CompletionData))
        .filter(completion => 
          completion.completed === true && 
          completion.dates && 
          completion.dates.includes(date)
        );
    } catch (error) {
      console.error(`Error getting ${this.collectionName} for date:`, error);
      return [];
    }
  }

  /**
   * Get user's completions for a date range (for weekly habits, etc.)
   */
  async getCompletionsForDateRange(userId: string, startDate: string, endDate: string): Promise<CompletionData[]> {
    try {
      const completionsRef = collection(db, 'users', userId, this.collectionName);
      const snapshot = await getDocs(completionsRef);
      
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CompletionData))
        .filter(completion => {
          if (!completion.completed || !completion.dates) return false;
          
          // Check if any date in the array falls within the range
          return completion.dates.some(date => 
            date >= startDate && date <= endDate
          );
        });
    } catch (error) {
      console.error(`Error getting ${this.collectionName} for date range:`, error);
      return [];
    }
  }

  /**
   * Check if a specific item is completed for a date
   */
  async isCompleted(userId: string, itemId: string, date: string): Promise<boolean> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const completionDoc = await getDoc(completionRef);
      
      if (completionDoc.exists()) {
        const data = completionDoc.data() as CompletionData;
        return data.completed === true && data.dates && data.dates.includes(date);
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking ${this.collectionName} completion:`, error);
      return false;
    }
  }

  /**
   * Complete an item (habit, quest, event, etc.)
   */
  async complete(
    userId: string, 
    itemId: string, 
    date: string, 
    itemData: any,
    customData: any = {}
  ): Promise<void> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const existingCompletion = await getDoc(completionRef);
      
      if (existingCompletion.exists()) {
        const data = existingCompletion.data() as CompletionData;
        const currentDates = data.dates || [];
        
        // Only add date if it's not already in the array
        if (!currentDates.includes(date)) {
          await updateDoc(completionRef, {
            completed: true,
            completedAt: serverTimestamp(),
            dates: [...currentDates, date], // Add new date to array
            progress: increment(1), // Increment total progress
            state: itemData.approval === 'manual' ? 'pending' : 'approved',
            ...customData
          });
        }
      } else {
        // Create new completion with dates array
        await setDoc(completionRef, {
          completed: true,
          completedAt: serverTimestamp(),
          dates: [date], // Initialize with first date
          progress: 1,
          state: itemData.approval === 'manual' ? 'pending' : 'approved',
          ...customData
        });
      }

    } catch (error) {
      console.error(`Error completing ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Uncomplete an item for a specific date
   */
  async uncomplete(userId: string, itemId: string, date: string): Promise<void> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const existingCompletion = await getDoc(completionRef);
      
      if (existingCompletion.exists()) {
        const data = existingCompletion.data() as CompletionData;
        const currentDates = data.dates || [];
        
        if (currentDates.includes(date)) {
          const updatedDates = currentDates.filter(d => d !== date);
          
          if (updatedDates.length > 0) {
            // Still has other completion dates, just remove this date
            await updateDoc(completionRef, {
              dates: updatedDates,
              progress: increment(-1),
              completedAt: serverTimestamp()
            });
          } else {
            // No more completion dates, mark as uncompleted
            await updateDoc(completionRef, {
              completed: false,
              dates: [],
              progress: 0,
              completedAt: serverTimestamp(),
              state: 'cancelled'
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error uncompleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get completion progress for specific date (how many times completed on that date)
   */
  async getProgress(userId: string, itemId: string, date: string): Promise<number> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const completionDoc = await getDoc(completionRef);
      
      if (completionDoc.exists()) {
        const data = completionDoc.data() as CompletionData;
        if (data.dates && data.dates.includes(date)) {
          // Count how many times this date appears (for same-day multiple completions)
          return data.dates.filter(d => d === date).length;
        }
      }
      
      return 0;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} progress:`, error);
      return 0;
    }
  }

  /**
   * Get total completion count for an item
   */
  async getTotalProgress(userId: string, itemId: string): Promise<number> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const completionDoc = await getDoc(completionRef);
      
      if (completionDoc.exists()) {
        const data = completionDoc.data() as CompletionData;
        return data.progress || 0;
      }
      
      return 0;
    } catch (error) {
      console.error(`Error getting total ${this.collectionName} progress:`, error);
      return 0;
    }
  }

  /**
   * Get all completion dates for an item
   */
  async getCompletionDates(userId: string, itemId: string): Promise<string[]> {
    try {
      const completionRef = doc(db, 'users', userId, this.collectionName, itemId);
      const completionDoc = await getDoc(completionRef);
      
      if (completionDoc.exists()) {
        const data = completionDoc.data() as CompletionData;
        return data.dates || [];
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting ${this.collectionName} completion dates:`, error);
      return [];
    }
  }
}

// ====================================================================
// 🎯 SPECIFIC SERVICE INSTANCES
// ====================================================================

// Habits completion service
export const habitsCompletionService = new CompletionService('completedHabits');

// Future services (ready for extension)
export const questsCompletionService = new CompletionService('completedQuests');
export const eventsCompletionService = new CompletionService('completedEvents');
export const challengesCompletionService = new CompletionService('completedChallenges');

// ====================================================================
// 🎯 HABIT-SPECIFIC WRAPPER FUNCTIONS (NEW SUBCOLLECTION APPROACH)
// ====================================================================

/**
 * Get user's habit completions for a specific date
 */
export const getHabitCompletionsNew = async (userId: string, date: string): Promise<HabitCompletion[]> => {
  try {
    const completions = await habitsCompletionService.getCompletionsForDate(userId, date);
    
    return completions.map(completion => ({
      id: completion.id,
      habitId: completion.id, // Document ID is the habitId
      userId: userId,
      date: date, // The specific date we're querying for
      completed: completion.completed,
      completedAt: completion.completedAt?.toDate(),
      goldEarned: 0 // Will be calculated from habit data
    }));
  } catch (error) {
    console.error('Error fetching habit completions (new):', error);
    return [];
  }
};

/**
 * Get user's weekly habit completions
 */
export const getWeeklyHabitCompletionsNew = async (userId: string, selectedDate: string): Promise<HabitCompletion[]> => {
  try {
    // Calculate week range (Saturday to Friday)
    const date = new Date(selectedDate);
    const day = date.getDay();
    
    const start = new Date(date);
    const daysToSaturday = day === 6 ? 0 : (day + 1);
    start.setDate(date.getDate() - daysToSaturday);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const startDate = start.toISOString().split('T')[0];
    const endDate = end.toISOString().split('T')[0];
    
    const completions = await habitsCompletionService.getCompletionsForDateRange(userId, startDate, endDate);
    
    // Flatten the results - create one HabitCompletion for each date in the range
    const flattenedCompletions: HabitCompletion[] = [];
    
    completions.forEach(completion => {
      completion.dates.forEach(completionDate => {
        if (completionDate >= startDate && completionDate <= endDate) {
          flattenedCompletions.push({
            id: `${completion.id}_${completionDate}`, // Unique ID for each date completion
            habitId: completion.id,
            userId: userId,
            date: completionDate,
            completed: completion.completed,
            completedAt: completion.completedAt?.toDate(),
            goldEarned: 0
          });
        }
      });
    });
    
    return flattenedCompletions;
  } catch (error) {
    console.error('Error fetching weekly habit completions (new):', error);
    return [];
  }
};

/**
 * Complete a habit using new subcollection approach
 */
export const completeHabitNew = async (
  userId: string, 
  habitId: string, 
  date: string, 
  goldReward: number, 
  canReward: number = 0,
  habitData: Partial<Habit> = {}
): Promise<void> => {
  try {
    // Complete the habit in subcollection
    await habitsCompletionService.complete(userId, habitId, date, habitData);

    // Update user's gold and can with maxHealth check
    await updateUserRewards(userId, goldReward, canReward);

  } catch (error) {
    console.error('Error completing habit (new):', error);
    throw error;
  }
};

/**
 * Uncomplete a habit using new subcollection approach
 */
export const uncompleteHabitNew = async (
  userId: string, 
  habitId: string, 
  date: string, 
  goldReward: number, 
  canReward: number = 0
): Promise<void> => {
  try {
    // Uncomplete the habit in subcollection
    await habitsCompletionService.uncomplete(userId, habitId, date);

    // Subtract user's gold and can
    await updateUserRewards(userId, -goldReward, -canReward);

  } catch (error) {
    console.error('Error uncompleting habit (new):', error);
    throw error;
  }
};

/**
 * Helper function to update user rewards with maxHealth check
 */
const updateUserRewards = async (userId: string, goldAmount: number, canAmount: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update gold
    if (goldAmount !== 0) {
      await updateDoc(userRef, {
        altin: increment(goldAmount)
      });
    }
    
    // Update can with maxHealth check
    if (canAmount !== 0) {
      await updateUserCan(userId, canAmount);
    }
  } catch (error) {
    console.error('Error updating user rewards:', error);
    throw error;
  }
};

// ====================================================================
// 🎯 EXISTING USER AND HABIT FUNCTIONS (UNCHANGED)
// ====================================================================

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

// ====================================================================
// 🎯 SLIDERS OPERATIONS
// ====================================================================

export interface Slider {
  id: string;
  title: string;
  description: string;
  feat_img: string;
  page: string;
}

/**
 * Get sliders for a specific page
 */
export const getSlidersForPage = async (page: string): Promise<Slider[]> => {
  try {
    const slidersRef = collection(db, 'sliders');
    const slidersQuery = query(slidersRef, where('page', '==', page));
    const snapshot = await getDocs(slidersQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const sliders: Slider[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      const slider: Slider = {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        feat_img: data.feat_img || '',
        page: data.page || ''
      };
      
      sliders.push(slider);
    });
    
    return sliders;
    
  } catch (error) {
    console.error('Error fetching sliders:', error);
    throw error;
  }
};

// ====================================================================
// 🎯 QUESTS OPERATIONS
// ====================================================================

export interface Quest {
  id: string;
  title: string;
  description: string;
  brief_desc: string;
  feat_img: string;
  reward: number;
  weekday: string;
  isActive: boolean;
  createdAt: Date;
  makam: number;
}

/**
 * Get active quests
 */
export const getActiveQuests = async (): Promise<Quest[]> => {
  try {
    const questsRef = collection(db, 'quests');
    const questsQuery = query(questsRef, where('isActive', '==', true));
    const snapshot = await getDocs(questsQuery);
    
    if (snapshot.empty) {
      return [];
    }
    
    const quests: Quest[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      const quest: Quest = {
        id: doc.id,
        title: data.title || 'Unnamed Quest',
        description: data.description || '',
        brief_desc: data.brief_desc || '',
        feat_img: data.feat_img || '',
        reward: data.reward || 0,
        weekday: data.weekday || 'any',
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        makam: data.makam || 0
      };
      
      quests.push(quest);
    });
    
    return quests;
    
  } catch (error) {
    console.error('Error fetching quests:', error);
    throw error;
  }
}; 