import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { getHabitLogs, calculateStreak } from "../../lib/habits";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, subMonths, addMonths, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Flame, CheckCircle2, Search, X } from "lucide-react-native";
import { useSearch } from "../../context/SearchContext";

export default function Calendar() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  
  const { habits, isLoading: habitsLoading } = useHabits(user?.uid);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: allLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["allHabitLogsCalendar", user?.uid],
    queryFn: async () => {
      if (!user?.uid || habits.length === 0) return [];
      const logsPromises = habits.map((h) => getHabitLogs(h.id));
      const logsArrays = await Promise.all(logsPromises);
      return logsArrays.flat();
    },
    enabled: !!user?.uid && habits.length > 0,
  });

  const isLoading = habitsLoading || logsLoading;

  // Filter habits by search query
  const filteredFocusHabits = habits.filter((habit) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      habit.title.toLowerCase().includes(query) ||
      !!(habit.description && habit.description.toLowerCase().includes(query))
    );
  });

  // Calendar Calculations
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
  const totalDaysInMonth = days.length;
  const totalExpectedLogsCount = habits.length * totalDaysInMonth;
  const monthCompletionRate = totalExpectedLogsCount > 0 
    ? Math.round((completedMonthLogsCount / totalExpectedLogsCount) * 100) 
    : 0;

  const maxStreak = habits.length > 0
    ? Math.max(...habits.map((h) => {
        const habitLogs = allLogs.filter((log) => log.habit_id === h.id);
        return calculateStreak(habitLogs).longestStreak;
      }))
    : 0;

  const getCompletionDataForDay = (day: Date) => {
    const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
    const completed = dayLogs.filter((log) => log.status === "completed").length;
    const total = habits.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const getHeatmapBg = (day: Date) => {
    const { percentage, total } = getCompletionDataForDay(day);
    if (total === 0 || percentage === 0) return "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800";
    if (percentage < 25) return "bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50";
    if (percentage < 50) return "bg-blue-200 dark:bg-blue-900/60 border-blue-300 dark:border-blue-800";
    if (percentage < 100) return "bg-blue-400 dark:bg-blue-800 border-blue-400 dark:border-blue-700";
    return "bg-blue-600 border-blue-500";
  };

  const getRecentCompletionIndicators = (habitId: string) => {
    return Array.from({ length: 5 }, (_, i) => {
      const date = subDays(new Date(), 4 - i);
      const isCompleted = allLogs.some((l) => l.habit_id === habitId && l.status === "completed" && isSameDay(new Date(l.date), date));
      return isCompleted;
    });
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Search Bar */}
        <View className="mt-4 mb-4">
          <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-sm">
            <Search size={18} color="#71717a" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search habits..."
              placeholderTextColor="#a1a1aa"
              className="flex-1 text-zinc-900 dark:text-white text-sm py-1 outline-none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#71717a" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Page Title */}
        <View className="mb-6">
          <Text className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">Calendar</Text>
          <Text className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Track your habit consistency over time 🗓️</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <View>
            {/* Calendar Main Card */}
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 mb-6 shadow-sm">
              
              {/* Navigation Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={goToPreviousMonth} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mr-2">
                    <ChevronLeft size={18} color="#71717a" />
                  </TouchableOpacity>
                  <Text className="text-zinc-900 dark:text-white font-bold text-lg">{format(currentDate, "MMMM yyyy")}</Text>
                  <TouchableOpacity onPress={goToNextMonth} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full ml-2">
                    <ChevronRight size={18} color="#71717a" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={goToToday} className="bg-blue-50 dark:bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30">
                  <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold">Today</Text>
                </TouchableOpacity>
              </View>

              {/* Weekday Header Row */}
              <View className="flex-row mb-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <View key={day} className="flex-1 items-center">
                    <Text className="text-zinc-500 font-mono text-[10px] font-semibold">{day}</Text>
                  </View>
                ))}
              </View>

              {/* Days Grid */}
              <View className="flex-row flex-wrap">
                {/* Empty Spacers */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <View key={`empty-${i}`} className="w-[14.28%] aspect-square p-1" />
                ))}

                {/* Day Cells */}
                {days.map((day) => {
                  const { completed, total, percentage } = getCompletionDataForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const heatBg = getHeatmapBg(day);

                  return (
                    <View key={day.toISOString()} className="w-[14.28%] aspect-square p-1">
                      <View className={`w-full h-full rounded-xl border p-1 justify-between items-center ${heatBg} ${isToday ? "border-blue-500 border-2" : ""}`}>
                        <Text className={`text-[10px] font-mono font-bold ${percentage === 100 ? "text-white" : "text-zinc-700 dark:text-zinc-300"}`}>
                          {format(day, "d")}
                        </Text>

                        {total > 0 ? (
                          <Text className={`text-[9px] font-semibold ${percentage === 100 ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                            {completed}/{total}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Consistency Legend */}
              <View className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex-row flex-wrap items-center justify-between">
                <Text className="text-zinc-500 dark:text-zinc-400 text-[10px] font-semibold mr-2">Consistency:</Text>
                <View className="flex-row items-center gap-2">
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 mr-1" />
                    <Text className="text-zinc-500 text-[9px]">0%</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded bg-blue-200 dark:bg-blue-900/60 mr-1" />
                    <Text className="text-zinc-500 text-[9px]">25%</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded bg-blue-400 dark:bg-blue-800 mr-1" />
                    <Text className="text-zinc-500 text-[9px]">50%</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded bg-blue-600 mr-1" />
                    <Text className="text-zinc-500 text-[9px]">100%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Monthly Mastery Card */}
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-zinc-900 dark:text-white text-lg font-bold mb-4">Monthly Mastery</Text>
              
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Completion Rate</Text>
                  <Text className="text-blue-600 dark:text-blue-400 font-bold text-base">{monthCompletionRate}%</Text>
                </View>
                <View className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <View className="bg-blue-600 h-full rounded-full" style={{ width: `${monthCompletionRate}%` }} />
                </View>
              </View>

              <View className="flex-row justify-between gap-3">
                <View className="flex-1 bg-zinc-100 dark:bg-zinc-800/60 p-3 rounded-2xl flex-row items-center">
                  <View className="bg-orange-500/20 p-2 rounded-xl mr-3">
                    <Flame size={16} color="#f97316" />
                  </View>
                  <View>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-mono">Max Streak</Text>
                    <Text className="text-zinc-900 dark:text-white font-bold text-base">{maxStreak} Days</Text>
                  </View>
                </View>

                <View className="flex-1 bg-zinc-100 dark:bg-zinc-800/60 p-3 rounded-2xl flex-row items-center">
                  <View className="bg-blue-500/20 p-2 rounded-xl mr-3">
                    <CheckCircle2 size={16} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-mono">Total Done</Text>
                    <Text className="text-zinc-900 dark:text-white font-bold text-base">{completedMonthLogsCount}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Focus Habits Progress List */}
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-zinc-900 dark:text-white text-lg font-bold mb-4">Focus Habits (Recent 5-Day)</Text>
              
              {filteredFocusHabits.length === 0 ? (
                <Text className="text-zinc-500 text-xs">No active habits found.</Text>
              ) : (
                filteredFocusHabits.slice(0, 5).map((habit) => {
                  const indicators = getRecentCompletionIndicators(habit.id);
                  return (
                    <View key={habit.id} className="flex-row items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl mb-3 border border-zinc-200 dark:border-zinc-800">
                      <View className="flex-row items-center flex-1 mr-3">
                        <View className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-3">
                          <Text className="text-zinc-900 dark:text-white font-bold text-xs">{habit.title.slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <Text className="text-zinc-900 dark:text-white font-semibold text-sm truncate flex-1" numberOfLines={1}>{habit.title}</Text>
                      </View>

                      {/* 5-Day Sparkline Dots */}
                      <View className="flex-row gap-1">
                        {indicators.map((isDone, i) => (
                          <View
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full ${isDone ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}
