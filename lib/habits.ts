import { Habit, HabitLog, StreakData } from "@/types";
import { startOfDay, subDays, format } from "date-fns";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";

export async function getHabits(userId: string): Promise<Habit[]> {
  const habitsRef = collection(db, "habits");
  const q = query(habitsRef, where("user_id", "==", userId));
  const querySnapshot = await getDocs(q);

  const habits = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      days_of_week: data.days_of_week,
      reminder_time: data.reminder_time,
      color: data.color,
      icon: data.icon,
      is_active: data.is_active,
      created_at: data.created_at,
    } as Habit;
  });

  return habits
    .filter((h) => h.is_active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function cleanUndefined(obj: any): any {
  const clean: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  });
  return clean;
}

export async function createHabit(habit: Omit<Habit, "id" | "created_at">) {
  console.log("Inserting habit into Firestore:", habit);

  try {
    const habitsRef = collection(db, "habits");
    const cleanData = cleanUndefined({
      ...habit,
      created_at: new Date().toISOString(),
    });
    const docRef = await addDoc(habitsRef, cleanData);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Habit creation failed: document does not exist after write");
    }

    const createdHabit = { id: docSnap.id, ...docSnap.data() } as Habit;
    console.log("Habit created successfully:", createdHabit);
    return createdHabit;
  } catch (err) {
    console.error("createHabit error:", err);
    throw err;
  }
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
  try {
    const docRef = doc(db, "habits", id);
    await updateDoc(docRef, cleanUndefined(updates));
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Habit update failed: document does not exist");
    }
    return { id: docSnap.id, ...docSnap.data() } as Habit;
  } catch (err) {
    console.error("updateHabit error:", err);
    throw err;
  }
}

export async function deleteHabit(id: string) {
  try {
    const docRef = doc(db, "habits", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("deleteHabit error:", err);
    throw err;
  }
}

export async function getHabitLogs(habitId: string): Promise<HabitLog[]> {
  try {
    const logsRef = collection(db, "habit_logs");
    const q = query(logsRef, where("habit_id", "==", habitId));
    const querySnapshot = await getDocs(q);

    const logs = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        habit_id: data.habit_id,
        date: data.date,
        status: data.status,
        created_at: data.created_at,
      } as HabitLog;
    });

    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("getHabitLogs error:", err);
    throw err;
  }
}

export async function checkInHabit(habitId: string, date: Date) {
  try {
    const dateStr = format(date, "yyyy-MM-dd");
    const docId = `${habitId}_${dateStr}`;
    const logRef = doc(db, "habit_logs", docId);

    const logData = {
      habit_id: habitId,
      date: dateStr,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    await setDoc(logRef, logData, { merge: true });
    return { id: docId, ...logData } as HabitLog;
  } catch (err) {
    console.error("checkInHabit error:", err);
    throw err;
  }
}

export async function undoCheckIn(habitId: string, date: Date) {
  try {
    const dateStr = format(date, "yyyy-MM-dd");
    const docId = `${habitId}_${dateStr}`;
    const logRef = doc(db, "habit_logs", docId);
    await deleteDoc(logRef);
  } catch (err) {
    console.error("undoCheckIn error:", err);
    throw err;
  }
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
