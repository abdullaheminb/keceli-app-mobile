export interface User {
  id: string;
  name?: string;
  profileImage?: string;
  lives?: number;
  gold?: number;
  makam?: number;
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

export interface UserProgress {
  userId: string;
  totalGold: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  lastUpdated: Date;
} 