"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs, calculateStreak } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths, subDays } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { habits, isLoading } = useHabits(user?.id);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const logs = await Promise.all(
        habits.map(async (habit) => {
          const habitLogs = await getHabitLogs(habit.id);
          return habitLogs.map((log) => ({ ...log, color: habit.color }));
        })
      );
      return logs.flat();
    },
    enabled: !!user?.id && habits.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Calculations for current selected month
  const currentMonthLogs = allLogs.filter((log) => {
    const logDate = new Date(log.date);
    return isSameMonth(logDate, currentDate);
  });

  const completedMonthLogsCount = currentMonthLogs.filter((l) => l.status === "completed").length;
  // Total expected logs in month for habits
  const totalDaysInMonth = days.length;
  const totalExpectedLogsCount = habits.length * totalDaysInMonth;
  const monthCompletionRate = totalExpectedLogsCount > 0 
    ? Math.round((completedMonthLogsCount / totalExpectedLogsCount) * 100) 
    : 0;

  // Streak calculations for stats
  const maxStreak = habits.length > 0
    ? Math.max(...habits.map((h) => {
        const habitLogs = allLogs.filter((log) => log.habit_id === h.id);
        return calculateStreak(habitLogs).longestStreak;
      }))
    : 0;

  const getCompletionDataForDay = (day: Date) => {
    const dayLogs = allLogs.filter((log) =>
      isSameDay(new Date(log.date), day)
    );
    const completed = dayLogs.filter((log) => log.status === "completed").length;
    const total = habits.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getHeatmapColor = (day: Date) => {
    const { percentage, total } = getCompletionDataForDay(day);
    if (total === 0 || percentage === 0) return "bg-slate-100 dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-400";
    if (percentage < 25) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300";
    if (percentage < 50) return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
    if (percentage < 100) return "bg-emerald-300 dark:bg-emerald-800/60 text-emerald-950 dark:text-emerald-200";
    return "bg-emerald-600 text-white font-semibold";
  };

  // Helper to fetch completion indicators for the last 5 days of focus habits
  const getRecentCompletionIndicators = (habitId: string) => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = subDays(new Date(), 4 - i);
      const isCompleted = allLogs.some((l) => l.habit_id === habitId && l.status === "completed" && isSameDay(new Date(l.date), date));
      return isCompleted;
    });
  };

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
        className="px-margin-mobile md:px-margin-desktop py-12 w-full"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-display text-headline-lg text-primary dark:text-white font-bold mb-2">
              Calendar View
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-md">
              Track your habit consistency over time 🗓️
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 text-on-surface dark:text-zinc-200 font-semibold rounded-xl hover:bg-surface-container dark:hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Main Calendar Card */}
          <div className="flex-grow bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-outline-variant/50 dark:border-zinc-800 rounded-[24px] p-6 md:p-8 shadow-sm">
            {/* Calendar Navigation */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-surface-container-high dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-90 text-on-surface-variant dark:text-zinc-300"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="font-display text-headline-md font-bold text-on-surface dark:text-white">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-surface-container-high dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-90 text-on-surface-variant dark:text-zinc-300"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <button
                onClick={goToToday}
                className="px-5 py-2 text-on-surface dark:text-zinc-200 font-semibold rounded-lg hover:bg-surface-container dark:hover:bg-zinc-800 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 mb-4">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div key={day} className="text-center font-mono text-label-caps text-on-surface-variant dark:text-zinc-400 py-2 text-[11px] tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-3">
              {/* Empty spacers for alignment */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 md:h-28 rounded-xl bg-transparent"></div>
              ))}

              {/* Day Cells */}
              {days.map((day) => {
                const { completed, total, percentage } = getCompletionDataForDay(day);
                const isToday = isSameDay(day, new Date());
                const heatColor = getHeatmapColor(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={`h-24 md:h-28 rounded-xl p-3 border border-outline-variant/30 dark:border-zinc-800/40 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer group ${heatColor} ${
                      isToday ? "ring-2 ring-primary dark:ring-white border-transparent" : ""
                    }`}
                  >
                    <span className="font-mono text-label-caps text-[12px]">{format(day, "dd")}</span>
                    {total > 0 && (
                      <div className="flex flex-col items-center">
                        <span className={`text-[11px] font-medium leading-none ${percentage === 100 ? "text-white" : "opacity-70"}`}>
                          {completed}/{total}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 p-4 bg-surface-container-lowest dark:bg-zinc-950 rounded-xl border border-outline-variant/20 dark:border-zinc-800">
              <span className="text-label-md text-on-surface-variant dark:text-zinc-400 font-semibold">Consistency:</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-zinc-800 border border-outline-variant/30 dark:border-zinc-700"></div>
                  <span className="text-label-md text-body-sm text-on-surface-variant dark:text-zinc-400">0%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/20"></div>
                  <span className="text-label-md text-body-sm text-on-surface-variant dark:text-zinc-400">1-24%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-100 dark:bg-emerald-900/30"></div>
                  <span className="text-label-md text-body-sm text-on-surface-variant dark:text-zinc-400">25-49%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-300 dark:bg-emerald-800/60"></div>
                  <span className="text-label-md text-body-sm text-on-surface-variant dark:text-zinc-400">50-99%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600"></div>
                  <span className="text-label-md text-body-sm text-on-surface-variant dark:text-zinc-400">Mastery (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Sidebar */}
          <aside className="w-full lg:w-80 flex flex-col gap-gutter shrink-0">
            {/* Monthly Mastery Card */}
            <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-outline-variant/50 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm">
              <h3 className="font-display text-headline-md font-bold text-on-surface dark:text-white mb-6">
                Monthly Mastery
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-on-surface-variant dark:text-zinc-400 text-body-sm">Completion Rate</span>
                    <span className="font-display text-headline-md font-bold text-primary dark:text-white">{monthCompletionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${monthCompletionRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container dark:bg-zinc-800 rounded-xl flex flex-col justify-between">
                    <p className="text-label-md text-on-surface-variant dark:text-zinc-400 mb-1">Max Streak</p>
                    <p className="font-display text-headline-md font-bold text-primary dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-orange-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        local_fire_department
                      </span>
                      {maxStreak}
                    </p>
                  </div>
                  <div className="p-4 bg-surface-container dark:bg-zinc-800 rounded-xl flex flex-col justify-between">
                    <p className="text-label-md text-on-surface-variant dark:text-zinc-400 mb-1">Total Done</p>
                    <p className="font-display text-headline-md font-bold text-primary dark:text-white flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        task_alt
                      </span>
                      {completedMonthLogsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Habits Progress List */}
            <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-outline-variant/50 dark:border-zinc-800 rounded-[24px] p-6 shadow-sm flex-grow">
              <h3 className="font-display text-headline-md font-bold text-on-surface dark:text-white mb-4">
                Focus Habits
              </h3>
              
              {habits.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 py-4">No active habits. Create one to begin!</p>
              ) : (
                <div className="space-y-4">
                  {habits.slice(0, 4).map((habit) => {
                    const indicators = getRecentCompletionIndicators(habit.id);
                    return (
                      <div key={habit.id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/30 dark:border-zinc-800">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-zinc-800 flex items-center justify-center text-primary dark:text-zinc-300 font-bold shrink-0">
                          {habit.icon.length === 1 ? habit.icon : habit.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <p className="text-body-sm font-semibold truncate text-on-surface dark:text-zinc-200">{habit.title}</p>
                          {/* 5-day sparkline checkmarks */}
                          <div className="flex gap-1 mt-1.5">
                            {indicators.map((isDone, i) => (
                              <div
                                key={i}
                                className={`w-full h-1 rounded-full ${isDone ? "bg-emerald-500" : "bg-surface-container dark:bg-zinc-800"}`}
                                title={isDone ? "Completed" : "Incomplete"}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link
                href="/dashboard"
                className="w-full mt-6 py-2.5 bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all text-center block"
              >
                View All Habits
              </Link>
            </div>
          </aside>
        </div>
      </motion.div>
    </Navbar>
  );
}
