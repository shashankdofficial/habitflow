import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit, HabitLog } from "../types";
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitLogs,
  checkInHabit,
  undoCheckIn,
  getTodayHabits,
  calculateStreak,
  getHabitStatusForDay,
} from "../lib/habits";
import { Alert } from "react-native";

export function useHabits(userId: string | undefined | null) {
  const queryClient = useQueryClient();

  const {
    data: habits = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["habits", userId],
    queryFn: () => (userId ? getHabits(userId) : []),
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: (habit: Omit<Habit, "id" | "created_at">) => createHabit(habit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to create habit: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Habit> }) =>
      updateHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to update habit: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["allHabitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["allLogs"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to delete habit: " + error.message);
    },
  });

  return {
    habits,
    isLoading,
    error,
    createHabit: createMutation.mutate,
    updateHabit: updateMutation.mutate,
    deleteHabit: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useHabitLogs(habitId: string) {
  const queryClient = useQueryClient();

  const {
    data: logs = [],
    isLoading,
  } = useQuery({
    queryKey: ["habitLogs", habitId],
    queryFn: () => getHabitLogs(habitId),
    enabled: !!habitId,
  });

  const checkInMutation = useMutation({
    mutationFn: ({ date, value }: { date: Date; value?: number }) => checkInHabit(habitId, date, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs", habitId] });
      queryClient.invalidateQueries({ queryKey: ["allLogs"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to check in: " + error.message);
    },
  });

  const undoMutation = useMutation({
    mutationFn: (date: Date) => undoCheckIn(habitId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs", habitId] });
      queryClient.invalidateQueries({ queryKey: ["allLogs"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to undo check-in: " + error.message);
    },
  });

  return {
    logs,
    isLoading,
    checkIn: (date: Date, value?: number, options?: any) =>
      checkInMutation.mutate({ date, value }, options),
    undoCheckIn: (date: Date, options?: any) =>
      undoMutation.mutate(date, options),
    isCheckingIn: checkInMutation.isPending,
    isUndoing: undoMutation.isPending,
  };
}

export function useTodayHabits(userId: string | undefined | null) {
  const { habits, isLoading } = useHabits(userId);
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  // Fetch all logs for today's habits to calculate streaks correctly
  const { data: logsData } = useQuery({
    queryKey: ["allLogs", userId],
    queryFn: async () => {
      if (!userId || habits.length === 0) return [];
      const logsPromises = habits.map((h) => getHabitLogs(h.id));
      const logsArrays = await Promise.all(logsPromises);
      return logsArrays.flat();
    },
    enabled: !!userId && habits.length > 0,
  });

  // Update state when data changes
  if (logsData && logsData !== allLogs) {
    setAllLogs(logsData);
  }

  const todayHabits = habits ? getTodayHabits(habits, allLogs) : [];

  const habitStreaks = habits.map((habit) => {
    const logs = allLogs.filter((l) => l.habit_id === habit.id);
    return {
      habitId: habit.id,
      ...calculateStreak(logs),
    };
  });

  const getHabitStatus = (habitId: string, date: Date) => {
    const logs = allLogs.filter((l) => l.habit_id === habitId);
    return getHabitStatusForDay(habitId, date, logs);
  };

  return {
    todayHabits,
    isLoading,
    habitStreaks,
    getHabitStatus,
    allLogs,
  };
}
