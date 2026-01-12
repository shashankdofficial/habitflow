import { Habit, HabitLog, StreakData } from "@/types";
import { startOfDay, subDays, format } from "date-fns";
import { supabase } from "./supabase";

export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createHabit(habit: Omit<Habit, "id" | "created_at">) {
  console.log("Inserting habit into Supabase:", habit);

  try {
    const { data, error } = await supabase
      .from("habits")
      .insert([habit])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      const errorMessage = error.message || "Unknown error";
      const details = error.details || "";
      const hint = error.hint || "";

      throw new Error(`Failed to create habit: ${errorMessage}${details ? ` - ${details}` : ""}${hint ? ` (${hint})` : ""}`);
    }

    console.log("Habit created successfully:", data);
    return data;
  } catch (err) {
    console.error("createHabit error:", err);
    throw err;
  }
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string) {
  const { error } = await supabase.from("habits").delete().eq("id", id);
  if (error) throw error;
}

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function checkInHabit(habitId: string, date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("habit_logs")
    .upsert(
      {
        habit_id: habitId,
        date: dateStr,
        status: "completed",
      },
      { onConflict: "habit_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function undoCheckIn(habitId: string, date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("date", dateStr);

  if (error) throw error;
}

export function calculateStreak(logs: HabitLog[]): StreakData {
  if (!logs || logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      completionPercentage: 0,
    };
  }

  const today = startOfDay(new Date());

  // Filter completed logs and sort by date descending
  const completedLogs = logs
    .filter((log) => log.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (completedLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      completionPercentage: 0,
    };
  }

  // Get unique dates sorted descending
  const sortedDates = Array.from(
    new Set(completedLogs.map((log) => startOfDay(new Date(log.date)).getTime()))
  ).map((time) => new Date(time));

  // 1. Calculate Current Streak
  let currentStreak = 0;
  let isStreakActive = false;

  // Check if the most recent log is today or yesterday
  const mostRecent = sortedDates[0];
  const diffToToday = Math.floor(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffToToday <= 1) {
    currentStreak = 1;
    isStreakActive = true;
  }

  if (isStreakActive) {
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const curr = sortedDates[i];
      const next = sortedDates[i + 1];
      const diff = Math.floor(
        (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // 2. Calculate Longest Streak
  let longestStreak = 0;
  let tempStreak = 1;
  if (sortedDates.length > 0) longestStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const curr = sortedDates[i];
    const next = sortedDates[i + 1];
    const diff = Math.floor(
      (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // 3. Completion Percentage
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));
  const completionCount = last30Days.filter((date) =>
    completedLogs.some(
      (log) =>
        format(new Date(log.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    )
  ).length;

  return {
    currentStreak,
    longestStreak,
    completionPercentage: Math.round((completionCount / 30) * 100),
  };
}

export function getTodayHabits(habits: Habit[], logs: HabitLog[]): Habit[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const dayOfWeek = new Date().getDay();

  return habits.filter((habit) => {
    if (habit.frequency === "daily") return true;
    if (habit.frequency === "weekly" && habit.days_of_week) {
      return habit.days_of_week.includes(dayOfWeek);
    }
    return false;
  });
}

export function getHabitStatusForDay(habitId: string, date: Date, logs: HabitLog[]): "completed" | "pending" | "missed" {
  const dateStr = format(date, "yyyy-MM-dd");
  const log = logs.find((l) => l.habit_id === habitId && l.date === dateStr);
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);

  if (log?.status === "completed") return "completed";
  if (targetDate < today) return "missed";
  return "pending";
}
