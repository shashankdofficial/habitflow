import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits, useHabitLogs } from "../../hooks/useHabits";
import { Habit } from "../../types";
import { Flame, Target, Check, CalendarDays, Plus, Search, X } from "lucide-react-native";
import { getHabitStatusForDay, calculateStreak } from "../../lib/habits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs } from "../../lib/habits";
import { useSearch } from "../../context/SearchContext";
import { useRouter } from "expo-router";

export default function AllHabits() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  
  const { habits, isLoading } = useHabits(user?.uid);

  // Fetch all logs to calculate streaks for all habits
  const { data: allLogs = [] } = useQuery({
    queryKey: ["allLogs", user?.uid],
    queryFn: async () => {
      if (!user?.uid || habits.length === 0) return [];
      const logsPromises = habits.map((h) => getHabitLogs(h.id));
      const logsArrays = await Promise.all(logsPromises);
      return logsArrays.flat();
    },
    enabled: !!user?.uid && habits.length > 0,
  });

  const filteredHabits = habits.filter((habit) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      habit.title.toLowerCase().includes(q) ||
      (!!habit.description && habit.description.toLowerCase().includes(q)) ||
      habit.frequency.toLowerCase().includes(q) ||
      (!!habit.time_of_day && habit.time_of_day.toLowerCase().includes(q))
    );
  });

  const HabitCard = ({ habit }: { habit: Habit }) => {
    const { checkIn, undoCheckIn, isCheckingIn, isUndoing } = useHabitLogs(habit.id);
    const today = new Date();
    
    const habitLogs = allLogs.filter(l => l.habit_id === habit.id);
    const status = getHabitStatusForDay(habit.id, today, habitLogs);
    const streakData = calculateStreak(habitLogs);
    
    const isCompleted = status === "completed";
    const isProcessing = isCheckingIn || isUndoing;

    const handleToggle = () => {
      if (isProcessing) return;
      if (isCompleted) {
        undoCheckIn(today);
      } else {
        checkIn(today);
      }
    };

    return (
      <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-sm">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-zinc-900 dark:text-white text-lg font-semibold mr-2">{habit.title}</Text>
            <View className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs flex-row items-center">
              <CalendarDays size={12} color="#94a3b8" />
              <Text className="text-zinc-600 dark:text-zinc-400 text-[10px] ml-1 capitalize">{habit.frequency}</Text>
            </View>
          </View>
          
          {habit.description ? (
            <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-2" numberOfLines={1}>{habit.description}</Text>
          ) : null}

          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center mr-4">
              <Flame size={14} color="#f97316" />
              <Text className="text-orange-500 text-xs ml-1 font-medium">
                {streakData.currentStreak || 0} Day Streak
              </Text>
            </View>
            
            {habit.target_value && (
              <View className="flex-row items-center">
                <Target size={14} color="#a1a1aa" />
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs ml-1">
                  {habit.target_value} {habit.target_unit || "times"}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleToggle}
          disabled={isProcessing}
          className={`h-12 w-12 rounded-full border-2 items-center justify-center transition-colors ${
            isCompleted ? "bg-blue-600 border-blue-600" : "border-zinc-300 dark:border-zinc-700 bg-transparent"
          }`}
          style={{ opacity: isProcessing ? 0.5 : 1 }}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={isCompleted ? "#fff" : "#3b82f6"} />
          ) : isCompleted ? (
            <Check size={24} color="#fff" strokeWidth={3} />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

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

        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">All Habits</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
              Tracking {filteredHabits.length} of {habits.length} habits
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/create" as any)}
            className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-md"
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : filteredHabits.length > 0 ? (
          <View>
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl items-center shadow-sm mt-4">
            <View className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-4">
              <Check size={32} color="#71717a" />
            </View>
            <Text className="text-zinc-800 dark:text-zinc-300 text-center text-lg font-semibold mb-2">No habits found.</Text>
            <Text className="text-zinc-500 text-center text-sm mb-4">Try clearing your search query or create your first habit.</Text>
            <TouchableOpacity
              onPress={() => router.push("/create" as any)}
              className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center shadow-md"
            >
              <Plus size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-semibold text-sm">Create Habit</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
