export interface User {
  id: string;
  name?: string;
  profileImage?: string;
  lives?: number;
  gold?: number;
  makam?: number;
  maxHealth?: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  goldReward: number;
  canReward?: number; // Can/life reward
  points?: number; // Points reward
  type: 'daily' | 'weekly' | 'monthly';
  repeat?: number; // How many times to complete in given frequency
  weekday?: string; // Which day for weekly habits (specific day name or "any")
  isActive: boolean;
  createdAt: Date;
  makam?: number;
  approval?: string; // "auto" or "manual" approval
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: Date;
  goldEarned: number;
}

// ====================================================================
// 🎯 NEW MODULAR COMPLETION SYSTEM TYPES
// ====================================================================

/**
 * Base completion interface for all completion types
 */
export interface BaseCompletion {
  id: string; // This is the itemId (habitId, questId, eventId, etc.)
  completed: boolean;
  completedAt: Date;
  dates: string[]; // Array of completion dates (YYYY-MM-DD format)
  progress: number; // Total completion count (length of dates array)
  state: 'pending' | 'approved' | 'cancelled';
}

/**
 * Habit-specific completion (extends base)
 */
export interface HabitCompletionNew extends BaseCompletion {
  habitId: string; // Same as id, but explicit for clarity
  userId: string;
  goldEarned?: number; // Calculated field
}

/**
 * Quest completion (future feature)
 */
export interface QuestCompletion extends BaseCompletion {
  questId: string;
  userId: string;
  experienceEarned?: number;
}

/**
 * Event completion (future feature)
 */
export interface EventCompletion extends BaseCompletion {
  eventId: string;
  userId: string;
  specialReward?: string;
}

/**
 * Challenge completion (future feature)
 */
export interface ChallengeCompletion extends BaseCompletion {
  challengeId: string;
  userId: string;
  achievementUnlocked?: string;
}

/**
 * Generic completion service interface
 */
export interface CompletionServiceInterface {
  getCompletionsForDate(userId: string, date: string): Promise<BaseCompletion[]>;
  getCompletionsForDateRange(userId: string, startDate: string, endDate: string): Promise<BaseCompletion[]>;
  isCompleted(userId: string, itemId: string, date: string): Promise<boolean>;
  complete(userId: string, itemId: string, date: string, itemData: any, customData?: any): Promise<void>;
  uncomplete(userId: string, itemId: string, date: string): Promise<void>;
  getProgress(userId: string, itemId: string, date: string): Promise<number>;
}

export interface UserProgress {
  userId: string;
  totalGold: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  lastUpdated: Date;
} 