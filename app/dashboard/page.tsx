"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTodayHabits } from "@/hooks/useHabits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getHabitLogs, calculateUserGamification } from "@/lib/habits";
import { Habit } from "@/types";
import { Navbar } from "@/components/Navbar";
import { HabitCard } from "@/components/HabitCard";
import { GamificationHeader } from "@/components/GamificationHeader";
import { AICoachWidget } from "@/components/AICoachWidget";
import Link from "next/link";
import { subDays, format, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/hooks/useSearchStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todayHabits, isLoading, habitStreaks, getHabitStatus, setAllLogs } =
    useTodayHabits(user?.id);
  const queryClient = useQueryClient();

  const [activeFrequencyFilter, setActiveFrequencyFilter] = useState<"all" | "daily" | "weekly">("all");
  const [activeRoutineFilter, setActiveRoutineFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const { data: allLogs } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const habits = await Promise.all(
        todayHabits.map(async (habit) => {
          const logs = await getHabitLogs(habit.id);
          return logs.map((log) => ({ ...log, color: habit.color }));
        })
      );
      return habits.flat();
    },
    enabled: !!user?.id && todayHabits.length > 0,
  });

  useEffect(() => {
    if (allLogs) {
      setAllLogs(allLogs);
    }
  }, [allLogs, setAllLogs]);

  const logsList = allLogs || [];

  // Calculate User Gamification (XP, Levels, Achievements)
  const gamification = calculateUserGamification(todayHabits, logsList);

  const completedTodayList = todayHabits.filter((habit) => {
    const logs = logsList.filter((log) => log.habit_id === habit.id && log.status === "completed");
    const today = new Date();
    return logs.some((log) => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === today.toDateString();
    });
  });

  const completedTodayCount = completedTodayList.length;
  const totalTodayCount = todayHabits.length;
  const completionPercentage = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const remainingTodayCount = totalTodayCount - completedTodayCount;

  const totalStreakDays = habitStreaks.reduce(
    (sum, s) => sum + s.currentStreak,
    0
  );

  const maxStreak = habitStreaks.length > 0 
    ? Math.max(...habitStreaks.map(s => s.longestStreak)) 
    : 0;

  // Filter habits based on Frequency, Routine Time-of-day, and Search Query
  const { searchQuery } = useSearchStore();

  const getHabitRoutineMatch = (habit: Habit, filter: string) => {
    if (filter === "all") return true;
    const tod = habit.time_of_day || "anytime";
    if (tod === "anytime") return true;
    if (tod === filter) return true;
    if (habit.title.toLowerCase().includes(filter)) return true;
    return false;
  };

  const routineCounts = {
    all: todayHabits.length,
    morning: todayHabits.filter((h) => getHabitRoutineMatch(h, "morning")).length,
    afternoon: todayHabits.filter((h) => getHabitRoutineMatch(h, "afternoon")).length,
    evening: todayHabits.filter((h) => getHabitRoutineMatch(h, "evening")).length,
  };

  const filteredHabits = todayHabits.filter((habit) => {
    const matchesRoutine = getHabitRoutineMatch(habit, activeRoutineFilter);
    const matchesFrequency = activeFrequencyFilter === "all" || habit.frequency === activeFrequencyFilter;

    let matchesSearch = true;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      matchesSearch =
        habit.title.toLowerCase().includes(q) ||
        (!!habit.description && habit.description.toLowerCase().includes(q)) ||
        habit.frequency.toLowerCase().includes(q) ||
        (!!habit.time_of_day && habit.time_of_day.toLowerCase().includes(q)) ||
        (!!habit.target_unit && habit.target_unit.toLowerCase().includes(q));
    }

    return matchesRoutine && matchesFrequency && matchesSearch;
  });

  // Calculate Last 7 Days Activity
  const getLast7DaysCompletion = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayLogs = logsList.filter((log) => isSameDay(new Date(log.date), date));
      const completed = dayLogs.filter((log) => log.status === "completed").length;
      const total = todayHabits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      return {
        label: format(date, "EEEEE"),
        rate,
        isToday: isSameDay(date, new Date()),
        dateStr: format(date, "MMM d"),
      };
    });
  };

  const last7Days = getLast7DaysCompletion();

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Navbar>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-margin-mobile md:px-margin-desktop py-8"
      >
        {/* Gamification Level & XP Header */}
        <GamificationHeader gamification={gamification} />

        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-background dark:text-white font-bold">
              Welcome back, {user.user_metadata?.name || "Friend"}! 👋
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-md mt-1">
              Consistency is the key to mastery.{" "}
              {remainingTodayCount > 0 ? (
                <>You have <span className="font-semibold text-primary dark:text-white">{remainingTodayCount}</span> habits left for today.</>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-semibold">All habits completed today! Superb! 🎉</span>
              )}
            </p>
          </div>
          <Link
            href="/habits/new"
            className="bg-primary dark:bg-zinc-100 text-on-primary dark:text-zinc-900 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create Habit</span>
          </Link>
        </section>

        {/* AI Habit Coach Widget */}
        <AICoachWidget
          habits={todayHabits}
          logs={logsList}
          onOpenAIGenerator={() => router.push("/habits/new?ai=true")}
        />

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
          {/* Today's Progress */}
          <div className="bg-surface-container-lowest dark:bg-zinc-900 p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-surface-container-low dark:bg-zinc-800 p-3 rounded-xl text-primary dark:text-zinc-200">
                <span className="material-symbols-outlined text-[22px]">task_alt</span>
              </div>
              <span className="text-label-caps text-on-surface-variant dark:text-zinc-400 font-mono tracking-wider text-[11px]">TODAY&apos;S GOAL</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-lg font-display text-on-surface dark:text-white font-bold">{completionPercentage}</span>
                <span className="text-headline-md text-on-surface-variant dark:text-zinc-400">%</span>
              </div>
              <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                {completedTodayCount} of {totalTodayCount} habits completed
              </p>
            </div>
            <div className="w-full bg-surface-container dark:bg-zinc-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Current Streaks */}
          <div className="bg-surface-container-lowest dark:bg-zinc-900 p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <span className="text-label-caps text-on-surface-variant dark:text-zinc-400 font-mono tracking-wider text-[11px]">TOTAL STREAK</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-lg font-display text-on-surface dark:text-white font-bold">{totalStreakDays}</span>
                <span className="text-headline-md text-on-surface-variant dark:text-zinc-400">Days</span>
              </div>
              <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                Personal record: {maxStreak} days 🔥
              </p>
            </div>
            <div className="flex gap-1 mt-auto">
              {last7Days.map((day, idx) => (
                <div
                  key={idx}
                  className={`w-full h-1 rounded-full ${
                    day.rate > 75 
                      ? "bg-blue-500" 
                      : day.rate > 0 
                        ? "bg-blue-300 dark:bg-blue-800" 
                        : "bg-surface-container dark:bg-zinc-800"
                  }`}
                  title={`${day.dateStr}: ${Math.round(day.rate)}% completed`}
                ></div>
              ))}
            </div>
          </div>

          {/* Active Focus */}
          <div className="bg-surface-container-lowest dark:bg-zinc-900 p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-xl text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[22px]">trending_up</span>
              </div>
              <span className="text-label-caps text-on-surface-variant dark:text-zinc-400 font-mono tracking-wider text-[11px]">ACTIVE FOCUS</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-display-lg font-display text-on-surface dark:text-white font-bold">{totalTodayCount}</span>
                <span className="text-headline-md text-on-surface-variant dark:text-zinc-400">Habits</span>
              </div>
              <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                Building positive momentum! 💪
              </p>
            </div>
            <div className="mt-auto">
              <div className="flex -space-x-2">
                {todayHabits.slice(0, 3).map((h) => (
                  <div
                    key={h.id}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-bold text-white uppercase bg-blue-500"
                  >
                    {h.title.slice(0, 2)}
                  </div>
                ))}
                {todayHabits.length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-950 bg-surface-container dark:bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-on-surface-variant dark:text-zinc-300">
                    +{todayHabits.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-section-gap items-start">
          {/* Left Column: Habits List */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white">
                Today&apos;s Routines
              </h2>

              {/* Routine Time-of-Day Filters */}
              <div className="flex flex-wrap gap-1 bg-surface-container dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                <button
                  onClick={() => setActiveRoutineFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeRoutineFilter === "all"
                      ? "bg-white dark:bg-zinc-800 shadow-sm text-blue-600 dark:text-white font-bold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  All Routines <span className="opacity-70 font-mono">({routineCounts.all})</span>
                </button>
                <button
                  onClick={() => setActiveRoutineFilter("morning")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeRoutineFilter === "morning"
                      ? "bg-amber-500 text-white shadow-sm font-bold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <span>🌅 Morning</span>
                  <span className="opacity-70 font-mono">({routineCounts.morning})</span>
                </button>
                <button
                  onClick={() => setActiveRoutineFilter("afternoon")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeRoutineFilter === "afternoon"
                      ? "bg-orange-500 text-white shadow-sm font-bold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <span>☀️ Afternoon</span>
                  <span className="opacity-70 font-mono">({routineCounts.afternoon})</span>
                </button>
                <button
                  onClick={() => setActiveRoutineFilter("evening")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    activeRoutineFilter === "evening"
                      ? "bg-indigo-600 text-white shadow-sm font-bold"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  <span>🌙 Evening</span>
                  <span className="opacity-70 font-mono">({routineCounts.evening})</span>
                </button>
              </div>
            </div>

            {/* Frequency Sub-Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFrequencyFilter("all")}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  activeFrequencyFilter === "all"
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "border-zinc-300 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                All Frequencies
              </button>
              <button
                onClick={() => setActiveFrequencyFilter("daily")}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  activeFrequencyFilter === "daily"
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "border-zinc-300 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                Daily Only
              </button>
              <button
                onClick={() => setActiveFrequencyFilter("weekly")}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  activeFrequencyFilter === "weekly"
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "border-zinc-300 dark:border-zinc-800 text-zinc-500"
                }`}
              >
                Weekly Only
              </button>
            </div>

            {/* Habits Checklist */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredHabits.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 bg-surface-container-lowest dark:bg-zinc-900 border border-white dark:border-zinc-800 rounded-2xl text-center flex flex-col items-center gap-4"
                  >
                    <p className="text-on-surface-variant dark:text-zinc-400 text-body-md">
                      No habits found for the selected routine filter.
                    </p>
                    <Link
                      href="/habits/new"
                      className="bg-primary dark:bg-zinc-100 text-on-primary dark:text-zinc-900 px-4 py-2 rounded-xl text-body-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                    >
                      Create Habit
                    </Link>
                  </motion.div>
                ) : (
                  filteredHabits.map((habit) => {
                    const status = getHabitStatus(habit.id, new Date(), logsList);
                    const streakData = habitStreaks.find((s) => s.habitId === habit.id);

                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        status={status}
                        streak={streakData?.currentStreak || 0}
                        onToggle={() => {
                          queryClient.invalidateQueries({ queryKey: ["allHabitLogs", user?.id] });
                        }}
                      />
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Insights & Quick Tips */}
          <aside className="space-y-gutter">
            {/* Weekly Activity Blocks */}
            <div className="bg-surface-container-lowest dark:bg-zinc-900 p-6 rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800">
              <h3 className="font-display text-headline-md font-bold text-on-surface dark:text-white mb-6">
                Weekly Consistency
              </h3>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="text-center text-label-md text-on-surface-variant dark:text-zinc-400 font-semibold">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {last7Days.map((day, idx) => {
                  let cellColor = "bg-surface-container dark:bg-zinc-800";
                  if (day.rate > 75) cellColor = "bg-blue-600";
                  else if (day.rate > 50) cellColor = "bg-blue-500/80";
                  else if (day.rate > 25) cellColor = "bg-blue-300 dark:bg-blue-700/60";
                  else if (day.rate > 0) cellColor = "bg-blue-100 dark:bg-blue-900/30";

                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg ${cellColor} transition-transform hover:scale-105 duration-200 cursor-pointer ${
                        day.isToday ? "ring-2 ring-primary dark:ring-white" : ""
                      }`}
                      title={`${day.dateStr}: ${Math.round(day.rate)}% completed`}
                    ></div>
                  );
                })}
              </div>
              <Link
                href="/analytics"
                className="w-full mt-6 text-blue-600 dark:text-blue-400 font-semibold text-body-sm hover:underline flex items-center justify-center gap-1"
              >
                <span>View Full Analytics & Heatmap</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* Quick Tip Card */}
            <div className="bg-primary-container p-6 rounded-2xl relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                <span className="text-label-caps text-[#7c839b] font-mono tracking-wider text-[11px] mb-2 block">QUICK TIP</span>
                <h4 className="text-headline-md font-bold text-white mb-3">Atomic Habits Rule</h4>
                <p className="text-zinc-400 text-body-sm leading-relaxed">
                  Focus 1% better every day. Small consistent daily actions compound into massive long-term identity changes.
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-[120px] text-white select-none">tips_and_updates</span>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </Navbar>
  );
}
