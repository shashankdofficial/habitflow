import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTodayHabits, useHabitLogs, useHabits } from "../../hooks/useHabits";
import { calculateUserGamification } from "../../lib/habits";
import { Check, Flame, Target, Trophy, Target as TargetIcon, TrendingUp, Search, Sparkles, X, Sun, Sunset, Moon, Dumbbell, Droplets, Smile, BookOpen, Bed, Briefcase, Utensils, MoreHorizontal, Bell } from "lucide-react-native";
import { Habit } from "../../types";
import { useSearch } from "../../context/SearchContext";
import { AICoachWidget } from "../../components/AICoachWidget";
import { useFocusEffect } from "expo-router";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();

  const [activeRoutineFilter, setActiveRoutineFilter] = useState<"all" | "morning" | "afternoon" | "evening">("all");
  const [activeFrequencyFilter, setActiveFrequencyFilter] = useState<"all" | "daily" | "weekly">("all");
  
  const { todayHabits, isLoading, habitStreaks, getHabitStatus, allLogs, refetchAll } = useTodayHabits(user?.uid);
  const { deleteHabit } = useHabits(user?.uid);

  useFocusEffect(
    useCallback(() => {
      refetchAll();
    }, [refetchAll])
  );

  // Gamification Logic
  const gamification = calculateUserGamification(todayHabits, allLogs);
  
  // Dashboard Metrics
  const completedTodayList = todayHabits.filter((habit) => getHabitStatus(habit.id, new Date()) === "completed");
  const completedTodayCount = completedTodayList.length;
  const totalTodayCount = todayHabits.length;
  const completionPercentage = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;
  const remainingTodayCount = totalTodayCount - completedTodayCount;

  const totalStreakDays = habitStreaks.reduce((sum, s) => sum + s.currentStreak, 0);

  // Filter Helper Logic matching Web App
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

    const getIcon = (iconName?: string) => {
      switch (iconName) {
        case "Dumbbell":
        case "fitness_center": return <Dumbbell size={20} color={habit.color || "#3b82f6"} />;
        case "Droplets":
        case "water_drop": return <Droplets size={20} color={habit.color || "#3b82f6"} />;
        case "Smile":
        case "self_improvement": return <Smile size={20} color={habit.color || "#3b82f6"} />;
        case "BookOpen":
        case "menu_book": return <BookOpen size={20} color={habit.color || "#3b82f6"} />;
        case "Bed":
        case "bedtime": return <Bed size={20} color={habit.color || "#3b82f6"} />;
        case "Briefcase":
        case "work": return <Briefcase size={20} color={habit.color || "#3b82f6"} />;
        case "Utensils":
        case "restaurant": return <Utensils size={20} color={habit.color || "#3b82f6"} />;
        case "MoreHorizontal":
        case "more_horiz": return <MoreHorizontal size={20} color={habit.color || "#3b82f6"} />;
        default: return <TargetIcon size={20} color={habit.color || "#3b82f6"} />;
      }
    };

    const confirmDelete = () => {
      Alert.alert(
        "Delete Habit",
        `Are you sure you want to delete "${habit.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) }
        ]
      );
    };

    return (
      <TouchableOpacity 
        onLongPress={confirmDelete}
        delayLongPress={500}
        activeOpacity={0.8}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-1 mr-4">
          <View className="flex-row items-center mb-1">
            <View className="w-8 h-8 rounded-full items-center justify-center mr-2 bg-zinc-100 dark:bg-zinc-800">
              {getIcon(habit.icon)}
            </View>
            <Text className="text-zinc-900 dark:text-white text-lg font-semibold mr-2">{habit.title}</Text>
            {habit.time_of_day && habit.time_of_day !== "anytime" && (
              <View className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                <Text className="text-zinc-600 dark:text-zinc-400 text-xs capitalize">{habit.time_of_day}</Text>
              </View>
            )}
          </View>
          
          {habit.description ? (
            <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-2" numberOfLines={1}>{habit.description}</Text>
          ) : null}

          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center mr-4">
              <Flame size={14} color="#f97316" />
              <Text className="text-orange-500 text-xs ml-1 font-medium">
                {streakData?.currentStreak || 0} Day Streak
              </Text>
            </View>
            
            {habit.target_value && (
              <View className="flex-row items-center mr-4">
                <Target size={14} color="#a1a1aa" />
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs ml-1">
                  {habit.target_value} {habit.target_unit || "times"}
                </Text>
              </View>
            )}

            {habit.reminder_time && (
              <View className="flex-row items-center">
                <Bell size={14} color="#a1a1aa" />
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs ml-1">
                  {habit.reminder_time}
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
      </TouchableOpacity>
    );
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || "Friend";

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Global Mobile Search Bar */}
        <View className="mt-4 mb-4">
          <View className="flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 shadow-sm">
            <Search size={18} color="#71717a" style={{ marginRight: 8 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search habits, routines, tags..."
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

        {/* Welcome Header */}
        <View className="mb-6">
          <Text className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight">
            Welcome back, {userName}! 👋
          </Text>
          <Text className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm leading-relaxed">
            Consistency is the key to mastery.{" "}
            {remainingTodayCount > 0 ? (
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">{remainingTodayCount} habits left for today.</Text>
            ) : (
              <Text className="text-green-600 dark:text-green-400 font-semibold">All habits completed today! 🎉</Text>
            )}
          </Text>
        </View>

        {/* Gamification Header */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="bg-yellow-500/20 p-2 rounded-xl mr-3">
                <Trophy size={20} color="#eab308" />
              </View>
              <View>
                <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider mb-0.5">Current Rank</Text>
                <Text className="text-zinc-900 dark:text-white font-bold text-base">Level {gamification.level}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-mono uppercase tracking-wider mb-0.5">Total XP</Text>
              <Text className="text-yellow-600 dark:text-yellow-500 font-bold text-base">{gamification.xp} XP</Text>
            </View>
          </View>
          
          <View className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mt-1 mb-2 overflow-hidden">
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

        {/* AI Habit Coach Widget */}
        <AICoachWidget habits={todayHabits} logs={allLogs} />

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-6 gap-2">
          {/* Today's Goal */}
          <View className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm">
            <View className="bg-blue-500/20 w-7 h-7 rounded-lg items-center justify-center mb-2">
              <TargetIcon size={14} color="#3b82f6" />
            </View>
            <Text className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-mono tracking-wider mb-0.5">Today's Goal</Text>
            <View className="flex-row items-baseline">
              <Text className="text-zinc-900 dark:text-white text-xl font-bold">{completionPercentage}</Text>
              <Text className="text-zinc-500 text-xs ml-0.5">%</Text>
            </View>
          </View>

          {/* Total Streak */}
          <View className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm">
            <View className="bg-orange-500/20 w-7 h-7 rounded-lg items-center justify-center mb-2">
              <Flame size={14} color="#f97316" />
            </View>
            <Text className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-mono tracking-wider mb-0.5">Total Streak</Text>
            <View className="flex-row items-baseline">
              <Text className="text-zinc-900 dark:text-white text-xl font-bold">{totalStreakDays}</Text>
              <Text className="text-zinc-500 text-xs ml-0.5">Days</Text>
            </View>
          </View>

          {/* Active Focus */}
          <View className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm">
            <View className="bg-green-500/20 w-7 h-7 rounded-lg items-center justify-center mb-2">
              <TrendingUp size={14} color="#22c55e" />
            </View>
            <Text className="text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-mono tracking-wider mb-0.5">Active Focus</Text>
            <View className="flex-row items-baseline">
              <Text className="text-zinc-900 dark:text-white text-xl font-bold">{totalTodayCount}</Text>
              <Text className="text-zinc-500 text-xs ml-0.5">Habits</Text>
            </View>
          </View>
        </View>

        {/* Routines Title & Time-of-Day Filter Pills */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-zinc-900 dark:text-white text-xl font-bold">Today's Routines</Text>
        </View>

        {/* Time of Day Filters Scrollable Horizontal Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3 gap-2">
          <TouchableOpacity
            onPress={() => setActiveRoutineFilter("all")}
            className={`px-3 py-1.5 rounded-xl border flex-row items-center mr-2 ${
              activeRoutineFilter === "all"
                ? "bg-blue-600 border-blue-500"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Text className={`text-xs font-semibold ${activeRoutineFilter === "all" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
              All ({routineCounts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveRoutineFilter("morning")}
            className={`px-3 py-1.5 rounded-xl border flex-row items-center mr-2 ${
              activeRoutineFilter === "morning"
                ? "bg-amber-600 border-amber-500"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Sun size={12} color={activeRoutineFilter === "morning" ? "#fff" : "#fbbf24"} style={{ marginRight: 4 }} />
            <Text className={`text-xs font-semibold ${activeRoutineFilter === "morning" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
              Morning ({routineCounts.morning})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveRoutineFilter("afternoon")}
            className={`px-3 py-1.5 rounded-xl border flex-row items-center mr-2 ${
              activeRoutineFilter === "afternoon"
                ? "bg-orange-600 border-orange-500"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Sunset size={12} color={activeRoutineFilter === "afternoon" ? "#fff" : "#f97316"} style={{ marginRight: 4 }} />
            <Text className={`text-xs font-semibold ${activeRoutineFilter === "afternoon" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
              Afternoon ({routineCounts.afternoon})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveRoutineFilter("evening")}
            className={`px-3 py-1.5 rounded-xl border flex-row items-center mr-2 ${
              activeRoutineFilter === "evening"
                ? "bg-indigo-600 border-indigo-500"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Moon size={12} color={activeRoutineFilter === "evening" ? "#fff" : "#818cf8"} style={{ marginRight: 4 }} />
            <Text className={`text-xs font-semibold ${activeRoutineFilter === "evening" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
              Evening ({routineCounts.evening})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Frequency Sub-Filters */}
        <View className="flex-row mb-4 gap-2">
          <TouchableOpacity
            onPress={() => setActiveFrequencyFilter("all")}
            className={`px-2.5 py-1 rounded-full border ${
              activeFrequencyFilter === "all" ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Text className={`text-[11px] ${activeFrequencyFilter === "all" ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500"}`}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveFrequencyFilter("daily")}
            className={`px-2.5 py-1 rounded-full border ${
              activeFrequencyFilter === "daily" ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Text className={`text-[11px] ${activeFrequencyFilter === "daily" ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500"}`}>Daily Only</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveFrequencyFilter("weekly")}
            className={`px-2.5 py-1 rounded-full border ${
              activeFrequencyFilter === "weekly" ? "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <Text className={`text-[11px] ${activeFrequencyFilter === "weekly" ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500"}`}>Weekly Only</Text>
          </TouchableOpacity>
        </View>

        {/* Habit List Rendering */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : filteredHabits.length > 0 ? (
          <View>
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </View>
        ) : (
          <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl items-center shadow-sm mt-2">
            <View className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full items-center justify-center mb-3">
              <Check size={28} color="#71717a" />
            </View>
            <Text className="text-zinc-800 dark:text-zinc-300 text-center text-base font-semibold mb-1">No matching habits found.</Text>
            <Text className="text-zinc-500 text-center text-xs">Try adjusting your filters or search query.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
