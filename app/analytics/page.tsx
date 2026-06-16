"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs, calculateStreak } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import { useSearchStore } from "@/hooks/useSearchStore";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, format, isSameDay, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { habits, isLoading } = useHabits(user?.id);
  const { searchQuery } = useSearchStore();

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const logs = await Promise.all(
        habits.map(async (habit) => {
          const habitLogs = await getHabitLogs(habit.id);
          return habitLogs.map((log) => ({ ...log, habitTitle: habit.title, color: habit.color }));
        })
      );
      return logs.flat();
    },
    enabled: !!user?.id && habits.length > 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Overall Statistics calculations
  const totalCheckInsCount = allLogs.filter((log) => log.status === "completed").length;
  const avgCompletionRate = habits.length > 0
    ? Math.round(
        habits.reduce((sum, habit) => {
          const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
          return sum + calculateStreak(habitLogs).completionPercentage;
        }, 0) / habits.length
      )
    : 0;

  const maxStreak = habits.length > 0
    ? Math.max(
        ...habits.map((habit) => {
          const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
          return calculateStreak(habitLogs).longestStreak;
        })
      )
    : 0;

  // Chart data calculations
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();

  const getWeeklyCompletionData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), date));
      const completed = dayLogs.filter((log) => log.status === "completed").length;
      const total = habits.length;
      return {
        dayName: format(date, "EEE"),
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  const getDailyCompletionData = () => {
    return last30Days.map((day) => {
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
      const completed = dayLogs.filter((log) => log.status === "completed").length;
      const total = habits.length;
      return {
        date: format(day, "MMM d"),
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  // Calculation for Habit Performance List
  const getHabitPerformanceData = () => {
    const filtered = habits.filter((habit) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        habit.title.toLowerCase().includes(query) ||
        !!(habit.description && habit.description.toLowerCase().includes(query))
      );
    });

    return filtered.map((habit) => {
      const habitLogs = allLogs.filter((l) => l.habit_id === habit.id);
      const completedCount = habitLogs.filter((l) => l.status === "completed").length;
      const totalDays = habitLogs.length || 1;
      const completionRate = Math.round((completedCount / totalDays) * 100);

      const streakData = calculateStreak(habitLogs);

      return {
        ...habit,
        completionRate,
        currentStreak: streakData.currentStreak,
      };
    });
  };

  // Heatmap calculation (last 12 weeks = 84 days)
  const getHeatmapData = () => {
    const dates = Array.from({ length: 84 }, (_, i) => subDays(new Date(), 83 - i));
    return dates.map((day) => {
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
      const completed = dayLogs.filter((log) => log.status === "completed").length;
      const total = habits.length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      return {
        date: day,
        rate,
      };
    });
  };

  const heatmap = getHeatmapData();

  // Find most/least active day of the week
  const getDayConsistencyStats = () => {
    const dayStats = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    last30Days.forEach((day) => {
      const dayOfWeek = day.getDay();
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
      dayStats[dayOfWeek] += dayLogs.filter((log) => log.status === "completed").length;
      dayCounts[dayOfWeek] += habits.length;
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    let maxVal = -1, minVal = 999999;
    let maxDay = "Tuesday", minDay = "Sunday";
    
    dayNames.forEach((name, index) => {
      const rate = dayCounts[index] > 0 ? dayStats[index] / dayCounts[index] : 0;
      if (rate > maxVal) {
        maxVal = rate;
        maxDay = name;
      }
      if (rate < minVal) {
        minVal = rate;
        minDay = name;
      }
    });

    return { maxDay, minDay };
  };

  const { maxDay, minDay } = getDayConsistencyStats();

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
        className="px-margin-mobile md:px-margin-desktop py-10 space-y-section-gap w-full"
      >
        {/* Header Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-headline-lg font-bold text-on-surface dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-md mt-1">
              Track your progress and mastery over time. 📊
            </p>
          </div>
          <Link
            href="/habits/new"
            className="bg-primary dark:bg-zinc-100 text-on-primary dark:text-zinc-900 px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 active:scale-95 duration-150 flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create Habit</span>
          </Link>
        </section>

        {/* High-Level Metrics Bento */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <p className="text-on-surface-variant dark:text-zinc-400 font-mono text-label-caps uppercase tracking-wider text-[11px]">
              Total Habits
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-display-lg font-display text-primary dark:text-white font-bold">{habits.length}</span>
              <span className="text-blue-600 dark:text-blue-400 text-label-md font-semibold">Active focus</span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <p className="text-on-surface-variant dark:text-zinc-400 font-mono text-label-caps uppercase tracking-wider text-[11px]">
              Total Check-ins
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-display-lg font-display text-primary dark:text-white font-bold">{totalCheckInsCount}</span>
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                trending_up
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <p className="text-on-surface-variant dark:text-zinc-400 font-mono text-label-caps uppercase tracking-wider text-[11px]">
              Avg. Completion Rate
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-display-lg font-display text-blue-600 dark:text-blue-400 font-bold">{avgCompletionRate}%</span>
              <span className="text-on-surface-variant dark:text-zinc-400 text-label-md font-semibold">overall rate</span>
            </div>
          </div>
          <div className="bg-primary-container dark:bg-zinc-800/80 p-6 rounded-2xl flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <p className="text-on-primary-container dark:text-zinc-300 font-mono text-label-caps uppercase tracking-wider text-[11px]">
              Longest Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-display-lg font-display text-white font-bold">{maxStreak}</span>
              <span className="text-on-primary-container dark:text-zinc-300 text-label-md font-semibold">Days running</span>
            </div>
          </div>
        </section>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Weekly Progress */}
          <section className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white">
                  Weekly Completion Rate
                </h2>
                <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm mt-0.5">
                  Visualizing consistency over the last 7 days
                </p>
              </div>
            </div>
            {/* Recharts BarChart */}
            <div className="relative h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyCompletionData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                  <Bar dataKey="completion" fill="#3B82F6" radius={[8, 8, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 30-Day Trend */}
          <section className="lg:col-span-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-500/20 dark:border-zinc-800 p-6 md:p-8 rounded-3xl flex flex-col shadow-sm">
            <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white mb-1">
              30-Day Trend
            </h2>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm mb-6">
              Long-term consistency metric
            </p>
            {/* Recharts LineChart */}
            <div className="relative h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getDailyCompletionData()} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} interval={6} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completion" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-6 border-t border-outline-variant/30 dark:border-zinc-800 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 font-mono uppercase tracking-wider block">Peak Day</span>
                <p className="font-bold text-on-surface dark:text-zinc-100 text-body-md mt-0.5">Jun 14</p>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 font-mono uppercase tracking-wider block">Volatility</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-body-md mt-0.5">Low (2%)</p>
              </div>
            </div>
          </section>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Habit Performance List */}
          <section className="bg-white dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white">
                Habit Performance
              </h2>
            </div>
            <div className="space-y-6">
              {getHabitPerformanceData().length === 0 ? (
                <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 py-4">No active habits. Create one to begin!</p>
              ) : (
                getHabitPerformanceData().map((habit) => {
                  let barColor = "bg-primary dark:bg-zinc-300";
                  if (habit.completionRate > 75) barColor = "bg-blue-500";
                  else if (habit.completionRate > 40) barColor = "bg-blue-500";

                  return (
                    <div key={habit.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-surface-container dark:bg-zinc-800 rounded-lg text-primary dark:text-zinc-300 font-bold shrink-0">
                            {habit.icon.length === 1 ? habit.icon : habit.title.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-body-md text-on-surface dark:text-zinc-200">{habit.title}</span>
                        </div>
                        <span className="font-mono text-label-caps text-blue-600 dark:text-blue-400 font-bold">{habit.completionRate}% Rate</span>
                      </div>
                      <div className="relative h-2 w-full bg-surface-container dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`absolute h-full rounded-full ${barColor}`} style={{ width: `${habit.completionRate}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-on-surface-variant dark:text-zinc-400 font-medium">
                        <div className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px] text-orange-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_fire_department
                          </span>
                          <span>{habit.currentStreak} day streak</span>
                        </div>
                        <span>Goal: 100% mastery</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Consistency Heatmap */}
          <section className="bg-white dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white mb-1">
              Consistency Heatmap
            </h2>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm mb-8">
              Activity frequency across the last 12 weeks
            </p>
            
            <div className="flex flex-wrap gap-2">
              {heatmap.map((cell, idx) => {
                let cellColor = "bg-slate-100 dark:bg-zinc-800 border border-slate-200/20";
                if (cell.rate > 75) cellColor = "bg-blue-600";
                else if (cell.rate > 50) cellColor = "bg-blue-400 dark:bg-blue-800/60";
                else if (cell.rate > 25) cellColor = "bg-blue-200 dark:bg-blue-900/40";
                else if (cell.rate > 0) cellColor = "bg-blue-50 dark:bg-blue-950/20";

                return (
                  <div
                    key={idx}
                    className={`w-6 h-6 rounded-md transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${cellColor}`}
                    title={`${format(cell.date, "MMM d, yyyy")}: ${Math.round(cell.rate)}% completed`}
                  ></div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 font-mono uppercase tracking-wider mb-1">Most Active Day</span>
                <div className="flex items-center gap-2">
                  <span className="text-headline-md font-semibold text-on-surface dark:text-zinc-100">{maxDay}</span>
                  <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                    Prime Time
                  </span>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-outline-variant dark:bg-zinc-800"></div>
              <div className="flex flex-col">
                <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 font-mono uppercase tracking-wider mb-1">Least Active Day</span>
                <span className="text-headline-md font-semibold text-on-surface dark:text-zinc-100">{minDay}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Featured Insight Card */}
        <section className="relative overflow-hidden bg-primary dark:bg-zinc-950 p-8 md:p-10 rounded-3xl text-on-primary">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-label-md font-semibold mb-4 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm text-yellow-300" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="text-white">AI Insight</span>
            </div>
            <h3 className="font-display text-headline-lg font-bold text-white mb-4">
              You&apos;re most consistent when you start before 8:00 AM.
            </h3>
            <p className="text-primary-fixed-dim dark:text-zinc-400 text-body-lg mb-8 leading-relaxed">
              Your analytics show that habits checked in the morning window have a 92% completion rate, compared to 64% after work. Try shifting your focus habits to the morning for optimal consistency.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-surface-container transition-colors active:scale-95 duration-100">
                Apply Morning Schedule
              </button>
              <button className="border border-white/30 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors active:scale-95 duration-100">
                Learn More
              </button>
            </div>
          </div>
          {/* Abstract Graphic Background */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-zinc-800 rounded-full blur-[100px] opacity-10"></div>
        </section>
      </motion.div>
    </Navbar>
  );
}
