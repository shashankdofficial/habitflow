import { View, Text, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { getHabitLogs, calculateStreak } from "../../lib/habits";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, Flame, CheckCircle2, Search, X } from "lucide-react-native";
import { subDays, isSameDay, format } from "date-fns";
import { useSearch } from "../../context/SearchContext";

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  
  const { habits, isLoading: habitsLoading } = useHabits(user?.uid);

  const { data: allLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["allHabitLogsAnalytics", user?.uid],
    queryFn: async () => {
      if (!user?.uid || habits.length === 0) return [];
      const logsPromises = habits.map((h) => getHabitLogs(h.id));
      const logsArrays = await Promise.all(logsPromises);
      return logsArrays.flat();
    },
    enabled: !!user?.uid && habits.length > 0,
  });

  const isLoading = habitsLoading || logsLoading;

  // Stats Calculations
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

  // Weekly Chart Data
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

  const weeklyData = getWeeklyCompletionData();

  // Habit Performance Data filtered by Search
  const filteredHabits = habits.filter((habit) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      habit.title.toLowerCase().includes(query) ||
      !!(habit.description && habit.description.toLowerCase().includes(query))
    );
  });

  const habitPerformance = filteredHabits.map((habit) => {
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

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Global Search Bar */}
        <View className="mt-4 mb-4">
          <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-sm">
            <Search size={18} color="#71717a" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search analytics..."
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

        <View className="mb-6">
          <Text className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">Analytics</Text>
          <Text className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Track your progress and mastery 📊</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : habits.length === 0 ? (
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl items-center shadow-sm">
            <TrendingUp size={32} color="#71717a" />
            <Text className="text-zinc-800 dark:text-zinc-300 text-center text-lg font-semibold mt-4 mb-2">No data yet</Text>
            <Text className="text-zinc-500 text-center text-sm">Check-in to your habits to generate analytics!</Text>
          </View>
        ) : (
          <View>
            {/* Bento Grid High Level Metrics */}
            <View className="flex-row flex-wrap justify-between gap-2.5 mb-6">
              <View className="w-[48%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-1">
                <Text className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Total Habits</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{habits.length}</Text>
                  <Target size={20} color="#3b82f6" />
                </View>
              </View>

              <View className="w-[48%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-1">
                <Text className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Total Check-ins</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{totalCheckInsCount}</Text>
                  <CheckCircle2 size={20} color="#22c55e" />
                </View>
              </View>

              <View className="w-[48%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                <Text className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Avg. Completion</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{avgCompletionRate}%</Text>
                  <TrendingUp size={20} color="#eab308" />
                </View>
              </View>

              <View className="w-[48%] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-sm">
                <Text className="text-blue-600 dark:text-blue-300 text-[10px] uppercase font-mono tracking-wider mb-2">Longest Streak</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-zinc-900 dark:text-white text-3xl font-bold">{maxStreak}</Text>
                  <Flame size={20} color="#f97316" />
                </View>
              </View>
            </View>

            {/* Weekly Completion Bar Chart */}
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-zinc-900 dark:text-white text-lg font-bold mb-1">Weekly Completion</Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-6">Last 7 days consistency rate</Text>
              
              <View className="flex-row justify-between items-end h-32 px-2">
                {weeklyData.map((day, idx) => (
                  <View key={idx} className="items-center w-[12%]">
                    <View className="w-full h-24 justify-end">
                      <View 
                        className="w-full bg-blue-600 rounded-t-md" 
                        style={{ height: `${Math.max(day.completion, 5)}%` }}
                      />
                    </View>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs mt-2">{day.dayName}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Habit Performance List */}
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-zinc-900 dark:text-white text-lg font-bold mb-5">Habit Performance</Text>
              
              {habitPerformance.length === 0 ? (
                <Text className="text-zinc-500 text-xs">No habits match search query.</Text>
              ) : (
                habitPerformance.map((habit) => (
                  <View key={habit.id} className="mb-4">
                    <View className="flex-row justify-between items-center mb-1.5">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="bg-zinc-100 dark:bg-zinc-800 w-8 h-8 rounded-lg items-center justify-center mr-3">
                          <Text className="text-zinc-900 dark:text-white font-bold text-xs">{habit.title.slice(0, 2).toUpperCase()}</Text>
                        </View>
                        <Text className="text-zinc-900 dark:text-white font-semibold text-sm truncate flex-1" numberOfLines={1}>{habit.title}</Text>
                      </View>
                      <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">{habit.completionRate}% Rate</Text>
                    </View>
                    
                    <View className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-1 overflow-hidden">
                      <View 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${habit.completionRate}%` }}
                      />
                    </View>
                    
                    <View className="flex-row items-center mt-0.5">
                      <Flame size={10} color="#f97316" />
                      <Text className="text-zinc-500 text-[10px] ml-1">{habit.currentStreak} day streak</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}
