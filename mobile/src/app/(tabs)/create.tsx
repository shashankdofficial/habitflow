import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { useRouter } from "expo-router";
import { Plus, Sun, Sunset, Moon, Clock, Target, CalendarDays, Palette, Sparkles, X, ArrowRight, Wand2, Dumbbell, Droplets, Smile, BookOpen, Bed, Briefcase, Utensils, MoreHorizontal, Bell } from "lucide-react-native";
import { generateAIHabitSuggestions, AIRecommendedHabit } from "../../lib/ai";
import { requestNotificationPermissions, scheduleHabitReminder } from "../../lib/notifications";

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
  const [icon, setIcon] = useState("Dumbbell");
  const [reminderTime, setReminderTime] = useState("");

  // AI Habit Generator Modal State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIRecommendedHabit[]>([]);

  const colors = [
    { label: "Blue", hex: "#3b82f6" },
    { label: "Green", hex: "#22c55e" },
    { label: "Purple", hex: "#a855f7" },
    { label: "Orange", hex: "#f97316" },
    { label: "Amber", hex: "#eab308" },
    { label: "Rose", hex: "#f43f5e" },
  ];

  const ICONS = [
    { name: "Dumbbell", label: "Fitness", icon: Dumbbell },
    { name: "Droplets", label: "Water", icon: Droplets },
    { name: "Smile", label: "Meditation", icon: Smile },
    { name: "BookOpen", label: "Reading", icon: BookOpen },
    { name: "Bed", label: "Sleep", icon: Bed },
    { name: "Briefcase", label: "Work", icon: Briefcase },
    { name: "Utensils", label: "Food", icon: Utensils },
    { name: "MoreHorizontal", label: "More", icon: MoreHorizontal },
  ];

  useEffect(() => {
    // Request notification permission when opening screen just in case
    requestNotificationPermissions();
  }, []);

  const handleGenerateAI = async () => {
    if (!aiGoalInput.trim()) {
      Alert.alert("Goal required", "Please type a goal first (e.g. Prepare for a marathon, read more books)");
      return;
    }
    setIsGeneratingAI(true);
    const results = await generateAIHabitSuggestions(aiGoalInput.trim());
    setAiSuggestions(results);
    setIsGeneratingAI(false);
  };

  const applyAISuggestion = (sug: AIRecommendedHabit) => {
    setTitle(sug.title);
    setDescription(sug.description);
    setFrequency(sug.frequency);
    setTimeOfDay(sug.time_of_day);
    if (sug.target_value) setTargetValue(sug.target_value.toString());
    if (sug.target_unit) setTargetUnit(sug.target_unit);
    if (sug.color) setColor(sug.color);
    if (sug.icon) setIcon(sug.icon);
    setShowAIModal(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a habit title");
      return;
    }

    if (!user?.uid) {
      Alert.alert("Error", "User session not found");
      return;
    }

    // Format reminder time gracefully if provided (e.g. "08:00")
    let finalReminderTime = reminderTime.trim();
    if (finalReminderTime && !finalReminderTime.includes(":")) {
      Alert.alert("Invalid Time", "Please enter time in HH:MM format (e.g., 08:30 or 14:00)");
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
        icon, // user selected icon
        reminder_time: finalReminderTime || undefined,
        is_active: true,
      },
      {
        onSuccess: (data) => {
          // Schedule Notification if reminder time is set
          if (finalReminderTime) {
            scheduleHabitReminder(data.id, title.trim(), finalReminderTime, frequency);
          }
          
          Alert.alert("Success 🎉", "Habit created successfully!");
          setTitle("");
          setDescription("");
          setTargetValue("1");
          setTargetUnit("times");
          setReminderTime("");
          router.push("/(tabs)");
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        {/* Header with AI Assistant Button */}
        <View className="mt-4 mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-900 dark:text-white text-3xl font-extrabold tracking-tight">Create Habit</Text>
            <Text className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Design a new positive routine ✨</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowAIModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-blue-600 px-3.5 py-2.5 rounded-2xl flex-row items-center shadow-md active:scale-95"
          >
            <Wand2 size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text className="text-white text-xs font-bold">AI Generator</Text>
          </TouchableOpacity>
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

        {/* Frequency & Reminder Time */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
          
          {/* Frequency Row */}
          <View className="mb-4">
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

          {/* Reminder Time Row */}
          <View className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-1">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Bell size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Reminder Time</Text>
              </View>
              <Text className="text-zinc-400 text-xs">(optional)</Text>
            </View>
            <TextInput
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="HH:MM (e.g. 08:30 or 15:45)"
              placeholderTextColor="#a1a1aa"
              keyboardType="numbers-and-punctuation"
              className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none"
            />
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
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-5 shadow-sm">
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

        {/* Representative Icon Picker */}
        <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Sparkles size={16} color="#3b82f6" style={{ marginRight: 6 }} />
            <Text className="text-zinc-700 dark:text-zinc-300 font-bold text-sm">Representative Icon</Text>
          </View>

          <View className="flex-row flex-wrap justify-between items-center mt-2">
            {ICONS.map((i) => {
              const IconComp = i.icon;
              const isSelected = icon === i.name;
              return (
                <TouchableOpacity
                  key={i.name}
                  onPress={() => setIcon(i.name)}
                  className={`w-[22%] aspect-square rounded-2xl items-center justify-center mb-3 border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                      : "border-transparent bg-zinc-100 dark:bg-zinc-950"
                  }`}
                >
                  <IconComp size={22} color={isSelected ? "#3b82f6" : "#a1a1aa"} />
                </TouchableOpacity>
              );
            })}
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

      {/* AI Habit Generator Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-black/70 justify-end">
              <View className="bg-white dark:bg-zinc-900 rounded-t-[2.5rem] p-6 border-t border-zinc-200 dark:border-zinc-800 max-h-[85%]">
                
                {/* Modal Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                      <Wand2 size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text className="text-zinc-900 dark:text-white font-bold text-lg">AI Habit Generator</Text>
                      <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Enter your objective to generate templates</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowAIModal(false)}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                  >
                    <X size={18} color="#a1a1aa" />
                  </TouchableOpacity>
                </View>

                {/* Input & Generate Button */}
                <View className="mb-4">
                  <Text className="text-zinc-700 dark:text-zinc-300 font-semibold text-xs mb-1.5">Target Goal or Milestone</Text>
                  <TextInput
                    value={aiGoalInput}
                    onChangeText={setAiGoalInput}
                    placeholder="e.g. Prepare for marathon, improve sleep, read books"
                    placeholderTextColor="#a1a1aa"
                    className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white text-sm mb-3 outline-none"
                  />

                  <TouchableOpacity
                    onPress={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="bg-blue-600 py-3.5 rounded-2xl flex-row items-center justify-center shadow-md active:scale-98"
                  >
                    {isGeneratingAI ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Wand2 size={16} color="#fff" style={{ marginRight: 6 }} />
                        <Text className="text-white font-bold text-sm">Generate AI Templates</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* AI Results */}
                <ScrollView className="max-h-[320px]" keyboardShouldPersistTaps="handled">
                  {aiSuggestions.length > 0 && (
                    <View className="space-y-3 pt-2">
                      <Text className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Recommended Routines:</Text>
                      {aiSuggestions.map((sug, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => applyAISuggestion(sug)}
                          className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 mb-3 flex-row items-center justify-between active:scale-98"
                        >
                          <View className="flex-1 pr-3">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-zinc-900 dark:text-white font-bold text-sm">{sug.title}</Text>
                              <View className="bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                                <Text className="text-[10px] text-zinc-600 dark:text-zinc-300 font-mono uppercase">{sug.time_of_day}</Text>
                              </View>
                            </View>
                            <Text className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">{sug.description}</Text>
                            {sug.target_value && (
                              <Text className="text-blue-500 dark:text-blue-400 text-[11px] font-mono">
                                Goal: {sug.target_value} {sug.target_unit}
                              </Text>
                            )}
                          </View>

                          <View className="w-8 h-8 rounded-full bg-blue-600/20 items-center justify-center">
                            <ArrowRight size={16} color="#3b82f6" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </ScrollView>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
