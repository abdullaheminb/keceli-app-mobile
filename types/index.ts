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
  type: 'daily' | 'weekly' | 'monthly';
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