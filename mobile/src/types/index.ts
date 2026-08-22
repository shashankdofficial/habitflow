export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  timezone?: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: "daily" | "weekly";
  days_of_week?: number[];
  reminder_time?: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  target_value?: number;
  target_unit?: string;
  time_of_day?: "morning" | "afternoon" | "evening" | "anytime";
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  status: "completed" | "missed";
  created_at: string;
  value?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completionPercentage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: "streak" | "count" | "time" | "general";
}

export interface UserGamification {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpCurrentLevelProgress: number; // percentage 0-100
  totalCompletions: number;
  longestStreak: number;
  currentStreak: number;
  achievements: Achievement[];
}
