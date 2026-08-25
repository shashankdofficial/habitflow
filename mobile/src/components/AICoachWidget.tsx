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
        colors={isDark ? ["#18181b", "#1e1b4b", "#1e1b4b"] : ["#eef2ff", "#f0f9ff", "#f5f3ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <View className="flex-row items-center gap-2.5 mb-3">
          <View className="w-8 h-8 rounded-xl bg-blue-600 items-center justify-center shadow-sm">
            <Sparkles size={16} color="#fff" />
          </View>
          <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            AI Habit Coach
          </Text>
        </View>

        <Text className="text-zinc-900 dark:text-zinc-100 text-lg font-bold mb-1.5 leading-tight">
          {insight.headline}
        </Text>
        <Text className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed mb-4">
          {insight.summary}
        </Text>

        <View className="gap-2.5 mt-1">
          {insight.tips.map((tip, idx) => (
            <View
              key={idx}
              className="bg-white/90 dark:bg-zinc-800/90 p-3.5 rounded-2xl border border-blue-100/80 dark:border-zinc-700/60 flex-row items-start shadow-sm"
            >
              <View className="mr-2.5 mt-0.5 w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 items-center justify-center shrink-0">
                <Lightbulb size={13} color="#3b82f6" />
              </View>
              <Text className="text-zinc-800 dark:text-zinc-200 text-xs font-medium leading-relaxed flex-1">
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
