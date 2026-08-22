import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Habit, HabitLog } from "../types";
import { getAICoachInsights, AICoachInsight } from "../lib/ai";
import { Sparkles, Lightbulb } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

interface AICoachWidgetProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function AICoachWidget({ habits, logs }: AICoachWidgetProps) {
  const [insight, setInsight] = useState<AICoachInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      const res = await getAICoachInsights(habits, logs);
      setInsight(res);
      setLoading(false);
    }
    loadInsights();
  }, [habits, logs]);

  if (loading) {
    return (
      <View className="w-full bg-blue-50/50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded-3xl p-5 mb-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900/50 mr-3" />
          <View className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </View>
        <View className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
        <View className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </View>
    );
  }

  if (!insight) return null;

  return (
    <View className="rounded-3xl overflow-hidden mb-6 shadow-sm border border-blue-200/60 dark:border-indigo-900/40">
      <LinearGradient
        colors={isDark ? ["#18181b", "#1e1b4b"] : ["#eef2ff", "#f5f3ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        <View className="flex-row items-center gap-2 mb-3">
          <View className="p-2 bg-blue-600 rounded-xl shadow-sm">
            <Sparkles size={16} color="#fff" />
          </View>
          <Text className="text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase tracking-wider font-bold">
            AI Habit Coach
          </Text>
        </View>

        <Text className="text-zinc-900 dark:text-white text-lg font-bold mb-1.5 leading-tight">
          {insight.headline}
        </Text>
        <Text className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed mb-4">
          {insight.summary}
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {insight.tips.map((tip, idx) => (
            <View
              key={idx}
              className="bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-full border border-blue-100 dark:border-zinc-700/60 flex-row items-center"
            >
              <Lightbulb size={12} color="#3b82f6" style={{ marginRight: 4 }} />
              <Text className="text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold">{tip}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
