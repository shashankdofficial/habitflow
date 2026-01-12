"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Habit, HabitLog } from "@/types";
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
} from "@/lib/habits";
import toast from "react-hot-toast";

export function useHabits(userId: string | undefined) {
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
      toast.success("Habit created successfully!");
    },
    onError: () => {
      toast.error("Failed to create habit");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Habit> }) =>
      updateHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update habit");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete habit");
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
    mutationFn: (date: Date) => checkInHabit(habitId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs", habitId] });
      toast.success("Great job! Keep it up! 🔥");
    },
    onError: () => {
      toast.error("Failed to check in");
    },
  });

  const undoMutation = useMutation({
    mutationFn: (date: Date) => undoCheckIn(habitId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Check-in undone");
    },
    onError: () => {
      toast.error("Failed to undo check-in");
    },
  });

  return {
    logs,
    isLoading,
    checkIn: checkInMutation.mutate,
    undoCheckIn: undoMutation.mutate,
    isCheckingIn: checkInMutation.isPending,
    isUndoing: undoMutation.isPending,
  };
}

export function useTodayHabits(userId: string | undefined) {
  const { habits, isLoading } = useHabits(userId);
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  const todayHabits = habits ? getTodayHabits(habits, allLogs) : [];

  const habitStreaks = habits.map((habit) => {
    const logs = allLogs.filter((l) => l.habit_id === habit.id);
    return {
      habitId: habit.id,
      ...calculateStreak(logs),
    };
  });

  const getHabitStatus = (habitId: string, date: Date, logs: HabitLog[]) =>
    getHabitStatusForDay(habitId, date, logs);

  return {
    todayHabits,
    isLoading,
    habitStreaks,
    getHabitStatus,
    setAllLogs,
  };
}
