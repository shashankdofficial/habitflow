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
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  status: "completed" | "missed";
  created_at: string;
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
