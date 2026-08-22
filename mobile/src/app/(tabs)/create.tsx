import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { useRouter } from "expo-router";
import { Plus, Sun, Sunset, Moon, Clock, Target, CalendarDays, Palette, Sparkles } from "lucide-react-native";

export default function CreateHabit() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const { createHabit, isCreating } = useHabits(user?.uid);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "anytime">("anytime");
  const [targetValue, setTargetValue] = useState("1");
  const [targetUnit, setTargetUnit] = useState("times");
  const [color, setColor] = useState("#3b82f6");

  const colors = [
    { label: "Blue", hex: "#3b82f6" },
    { label: "Green", hex: "#22c55e" },
    { label: "Purple", hex: "#a855f7" },
    { label: "Orange", hex: "#f97316" },
    { label: "Amber", hex: "#eab308" },
    { label: "Rose", hex: "#f43f5e" },
  ];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "User session not found");
      return;
    }

    createHabit(
      {
        user_id: user.uid,
        title: title.trim(),
        description: description.trim() || undefined,
        frequency,
        time_of_day: timeOfDay,
        target_value: parseInt(targetValue, 10) || 1,
        target_unit: targetUnit.trim() || "times",
        color,
        icon: title.slice(0, 2).toUpperCase(),
        is_active: true,
      },
      {
        onSuccess: () => {
          Alert.alert("Success 🎉", "Habit created successfully!");
          setTitle("");
          setDescription("");
          setTargetValue("1");
          setTargetUnit("times");
          router.push("/(tabs)");
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Header */}
        <View className="mt-4 mb-6">
          <Text className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">Create Habit</Text>
          <Text className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Design a new positive routine ✨</Text>
        </View>

        {/* Title Input */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm mb-2">Habit Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Drink 2L Water, Morning Run, Read..."
            placeholderTextColor="#a1a1aa"
            className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none"
          />
        </View>

        {/* Description Input */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm mb-2">Description (Optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Why do you want to build this habit?"
            placeholderTextColor="#a1a1aa"
            multiline
            numberOfLines={2}
            className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none"
          />
        </View>

        {/* Routine / Time of Day Picker */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Clock size={16} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Time of Day</Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {[
              { id: "anytime", label: "Anytime", icon: Sparkles },
              { id: "morning", label: "Morning", icon: Sun },
              { id: "afternoon", label: "Afternoon", icon: Sunset },
              { id: "evening", label: "Evening", icon: Moon },
            ].map((tod) => {
              const IconComp = tod.icon;
              const isSelected = timeOfDay === tod.id;
              return (
                <TouchableOpacity
                  key={tod.id}
                  onPress={() => setTimeOfDay(tod.id as any)}
                  className={`px-3.5 py-2.5 rounded-2xl border flex-row items-center mr-2 mb-2 ${
                    isSelected ? "bg-blue-600 border-blue-500" : "bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <IconComp size={14} color={isSelected ? "#fff" : "#71717a"} style={{ marginRight: 6 }} />
                  <Text className={`text-xs font-semibold ${isSelected ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {tod.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Frequency Picker */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          <View className="flex-row items-center mb-3">
            <CalendarDays size={16} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Frequency</Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setFrequency("daily")}
              className={`flex-1 py-3 rounded-2xl border items-center ${
                frequency === "daily" ? "bg-blue-600 border-blue-500" : "bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <Text className={`text-xs font-bold ${frequency === "daily" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                Daily Routine
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFrequency("weekly")}
              className={`flex-1 py-3 rounded-2xl border items-center ${
                frequency === "weekly" ? "bg-blue-600 border-blue-500" : "bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <Text className={`text-xs font-bold ${frequency === "weekly" ? "text-white" : "text-zinc-600 dark:text-zinc-400"}`}>
                Weekly Routine
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Value & Unit */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Target size={16} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Target Goal</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Target Number</Text>
              <TextInput
                value={targetValue}
                onChangeText={setTargetValue}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#a1a1aa"
                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-zinc-900 dark:text-white text-sm"
              />
            </View>

            <View className="flex-1">
              <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Unit Label</Text>
              <TextInput
                value={targetUnit}
                onChangeText={setTargetUnit}
                placeholder="times, pages, mins..."
                placeholderTextColor="#a1a1aa"
                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2.5 text-zinc-900 dark:text-white text-sm"
              />
            </View>
          </View>
        </View>

        {/* Color Palette */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Palette size={16} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Theme Color</Text>
          </View>

          <View className="flex-row justify-between items-center px-2">
            {colors.map((c) => (
              <TouchableOpacity
                key={c.hex}
                onPress={() => setColor(c.hex)}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  color === c.hex ? "border-2 border-white dark:border-zinc-200 scale-110" : ""
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isCreating}
          className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center shadow-lg"
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">Create Habit</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
