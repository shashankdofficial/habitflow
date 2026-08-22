import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { getHabitLogs, calculateStreak } from "../../lib/habits";
import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, Flame, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react-native";
import { subDays, isSameDay, format } from "date-fns";

export default function Analytics() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
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

  // Habit Performance Data
  const habitPerformance = habits.map((habit) => {
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
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        <View className="mt-4 mb-8">
          <Text className="text-white text-3xl font-extrabold tracking-tight">Analytics</Text>
          <Text className="text-zinc-400 mt-1 text-base">Track your progress and mastery</Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : habits.length === 0 ? (
          <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl items-center shadow-xl">
            <TrendingUp size={32} color="#71717a" />
            <Text className="text-zinc-300 text-center text-lg font-semibold mt-4 mb-2">No data yet</Text>
            <Text className="text-zinc-500 text-center text-sm">Check-in to your habits to generate analytics!</Text>
          </View>
        ) : (
          <View>
            {/* Bento Grid High Level Metrics */}
            <View className="flex-row flex-wrap justify-between gap-3 mb-8">
              <View className="w-[48%] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm mb-3">
                <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Total Habits</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-3xl font-bold">{habits.length}</Text>
                  <Target size={20} color="#3b82f6" />
                </View>
              </View>

              <View className="w-[48%] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm mb-3">
                <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Total Check-ins</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-3xl font-bold">{totalCheckInsCount}</Text>
                  <CheckCircle2 size={20} color="#22c55e" />
                </View>
              </View>

              <View className="w-[48%] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm">
                <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-2">Avg. Completion</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-3xl font-bold">{avgCompletionRate}%</Text>
                  <TrendingUp size={20} color="#eab308" />
                </View>
              </View>

              <View className="w-[48%] bg-blue-900/30 border border-blue-900 rounded-2xl p-4 shadow-sm">
                <Text className="text-blue-300 text-[10px] uppercase font-mono tracking-wider mb-2">Longest Streak</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-3xl font-bold">{maxStreak}</Text>
                  <Flame size={20} color="#f97316" />
                </View>
              </View>
            </View>

            {/* Weekly Completion Bar Chart */}
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-8 shadow-sm">
              <Text className="text-white text-lg font-bold mb-1">Weekly Completion</Text>
              <Text className="text-zinc-400 text-xs mb-6">Last 7 days consistency rate</Text>
              
              <View className="flex-row justify-between items-end h-32 px-2">
                {weeklyData.map((day, idx) => (
                  <View key={idx} className="items-center w-[12%]">
                    <View className="w-full h-24 justify-end">
                      <View 
                        className="w-full bg-blue-500 rounded-t-md" 
                        style={{ height: `${Math.max(day.completion, 5)}%` }} // Give at least 5% so it's visible
                      />
                    </View>
                    <Text className="text-zinc-400 text-xs mt-2">{day.dayName}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Habit Performance List */}
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-8 shadow-sm">
              <Text className="text-white text-lg font-bold mb-6">Habit Performance</Text>
              
              {habitPerformance.map((habit) => (
                <View key={habit.id} className="mb-5">
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View className="bg-zinc-800 w-8 h-8 rounded-lg items-center justify-center mr-3">
                        <Text className="text-white font-bold text-xs">{habit.title.slice(0, 2).toUpperCase()}</Text>
                      </View>
                      <Text className="text-white font-semibold">{habit.title}</Text>
                    </View>
                    <Text className="text-blue-400 font-bold text-xs">{habit.completionRate}% Rate</Text>
                  </View>
                  
                  <View className="w-full h-2 bg-zinc-800 rounded-full mb-1 overflow-hidden">
                    <View 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${habit.completionRate}%` }}
                    />
                  </View>
                  
                  <View className="flex-row items-center mt-1">
                    <Flame size={10} color="#f97316" />
                    <Text className="text-zinc-500 text-[10px] ml-1">{habit.currentStreak} day streak</Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
}
