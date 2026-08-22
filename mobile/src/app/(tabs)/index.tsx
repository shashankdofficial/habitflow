import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTodayHabits, useHabitLogs } from "../../hooks/useHabits";
import { Check, Flame, Target } from "lucide-react-native";
import { Habit } from "../../types";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const { todayHabits, isLoading, habitStreaks, getHabitStatus } = useTodayHabits(user?.uid);

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
        <View className="flex-row items-center justify-between mb-8 mt-4">
          <View>
            <Text className="text-white text-3xl font-extrabold tracking-tight">Today</Text>
            <Text className="text-zinc-400 mt-1 text-base">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : todayHabits.length > 0 ? (
          <View>
            {todayHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </View>
        ) : (
          <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl items-center shadow-xl mt-4">
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
