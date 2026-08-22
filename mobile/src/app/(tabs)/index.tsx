import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTodayHabits, useHabitLogs } from "../../hooks/useHabits";
import { calculateUserGamification } from "../../lib/habits";
import { Check, Flame, Target, Trophy, Target as TargetIcon, TrendingUp } from "lucide-react-native";
import { Habit } from "../../types";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const { todayHabits, isLoading, habitStreaks, getHabitStatus, allLogs } = useTodayHabits(user?.uid);

  // Gamification Logic
  const gamification = calculateUserGamification(todayHabits, allLogs);
  
  // Dashboard Metrics
  const completedTodayList = todayHabits.filter((habit) => getHabitStatus(habit.id, new Date()) === "completed");
  const completedTodayCount = completedTodayList.length;
  const totalTodayCount = todayHabits.length;
  const completionPercentage = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const remainingTodayCount = totalTodayCount - completedTodayCount;

  const totalStreakDays = habitStreaks.reduce((sum, s) => sum + s.currentStreak, 0);

  const HabitCard = ({ habit }: { habit: Habit }) => {
    const { checkIn, undoCheckIn, isCheckingIn, isUndoing } = useHabitLogs(habit.id);
    const today = new Date();
    const status = getHabitStatus(habit.id, today);
    const streakData = habitStreaks.find((s) => s.habitId === habit.id);
    
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
      <View className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-md">
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-white text-lg font-semibold mr-2">{habit.title}</Text>
            {habit.time_of_day && habit.time_of_day !== "anytime" && (
              <View className="bg-zinc-800 px-2 py-1 rounded text-xs">
                <Text className="text-zinc-400 text-xs capitalize">{habit.time_of_day}</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center mt-2">
            <View className="flex-row items-center mr-4">
              <Flame size={14} color="#f97316" />
              <Text className="text-orange-500 text-xs ml-1 font-medium">
                {streakData?.currentStreak || 0} Day Streak
              </Text>
            </View>
            
            {habit.target_value && (
              <View className="flex-row items-center">
                <Target size={14} color="#a1a1aa" />
                <Text className="text-zinc-400 text-xs ml-1">
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
            isCompleted ? "bg-blue-500 border-blue-500" : "border-zinc-700 bg-transparent"
          }`}
          style={{ opacity: isProcessing ? 0.5 : 1 }}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={isCompleted ? "#fff" : "#60a5fa"} />
          ) : isCompleted ? (
            <Check size={24} color="#fff" strokeWidth={3} />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Header and Welcome */}
        <View className="mt-4 mb-6">
          <Text className="text-white text-3xl font-extrabold tracking-tight">Today</Text>
          <Text className="text-zinc-400 mt-1 text-base">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Gamification Header */}
        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="bg-yellow-500/20 p-2 rounded-xl mr-3">
                <Trophy size={20} color="#eab308" />
              </View>
              <View>
                <Text className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-0.5">Current Rank</Text>
                <Text className="text-white font-bold text-lg">Level {gamification.level}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-0.5">Total XP</Text>
              <Text className="text-yellow-500 font-bold text-lg">{gamification.xp} XP</Text>
            </View>
          </View>
          
          <View className="w-full bg-zinc-800 rounded-full h-2 mt-2 mb-2 overflow-hidden">
            <View
              className="bg-yellow-500 h-full rounded-full"
              style={{ width: `${gamification.xpCurrentLevelProgress}%` }}
            ></View>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-zinc-500 text-[10px]">{gamification.xpCurrentLevelProgress}% progress</Text>
            <Text className="text-zinc-500 text-[10px]">{gamification.xpToNextLevel} XP to Level {gamification.level + 1}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-8 gap-3">
          {/* Today's Goal */}
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <View className="bg-blue-500/20 w-8 h-8 rounded-lg items-center justify-center mb-2">
              <TargetIcon size={16} color="#3b82f6" />
            </View>
            <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-1">Today's Goal</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-2xl font-bold">{completionPercentage}</Text>
              <Text className="text-zinc-500 text-sm ml-1">%</Text>
            </View>
          </View>

          {/* Total Streak */}
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <View className="bg-orange-500/20 w-8 h-8 rounded-lg items-center justify-center mb-2">
              <Flame size={16} color="#f97316" />
            </View>
            <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-1">Total Streak</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-2xl font-bold">{totalStreakDays}</Text>
              <Text className="text-zinc-500 text-sm ml-1">Days</Text>
            </View>
          </View>

          {/* Active Focus */}
          <View className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <View className="bg-green-500/20 w-8 h-8 rounded-lg items-center justify-center mb-2">
              <TrendingUp size={16} color="#22c55e" />
            </View>
            <Text className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider mb-1">Active Focus</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-2xl font-bold">{totalTodayCount}</Text>
              <Text className="text-zinc-500 text-sm ml-1">Habits</Text>
            </View>
          </View>
        </View>

        <Text className="text-white text-xl font-bold mb-4">Your Routines</Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : todayHabits.length > 0 ? (
          <View>
            {todayHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </View>
        ) : (
          <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl items-center shadow-xl mt-2">
            <View className="w-16 h-16 bg-zinc-800 rounded-full items-center justify-center mb-4">
              <Check size={32} color="#71717a" />
            </View>
            <Text className="text-zinc-300 text-center text-lg font-semibold mb-2">No habits scheduled for today.</Text>
            <Text className="text-zinc-500 text-center text-sm">Create your first habit to get started!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
