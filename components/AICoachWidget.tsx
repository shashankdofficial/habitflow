"use client";

import { useState, useEffect } from "react";
import { Habit, HabitLog } from "@/types";
import { getAICoachInsights, AICoachInsight } from "@/lib/ai";
import { motion } from "framer-motion";

interface AICoachWidgetProps {
  habits: Habit[];
  logs: HabitLog[];
  onOpenAIGenerator?: () => void;
}

export function AICoachWidget({ habits, logs, onOpenAIGenerator }: AICoachWidgetProps) {
  const [insight, setInsight] = useState<AICoachInsight | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="w-full bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 rounded-3xl p-6 shadow-sm animate-pulse mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/50" />
          <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-indigo-950/30 border border-blue-200/60 dark:border-indigo-900/40 rounded-3xl p-6 shadow-sm mb-8 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">psychology</span>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              AI Habit Coach
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-on-surface dark:text-zinc-100 flex items-center gap-2">
              {insight.headline}
            </h3>
            <p className="text-sm text-on-surface-variant dark:text-zinc-300 mt-1 leading-relaxed">
              {insight.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {insight.tips.map((tip, idx) => (
              <span
                key={idx}
                className="bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60 font-medium flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-blue-500 text-sm">tips_and_updates</span>
                {tip}
              </span>
            ))}
          </div>
        </div>

        {onOpenAIGenerator && (
          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              onClick={onOpenAIGenerator}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                auto_awesome
              </span>
              AI Habit Generator
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
