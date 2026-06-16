"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useHabitLogs } from "@/hooks/useHabits";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface HabitCardProps {
  habit: {
    id: string;
    title: string;
    description?: string;
    color: string;
    frequency: "daily" | "weekly";
    icon: string;
  };
  status: "completed" | "pending" | "missed";
  streak: number;
  onToggle: () => void;
}

export function HabitCard({ habit, status, streak, onToggle }: HabitCardProps) {
  const { checkIn, undoCheckIn, isCheckingIn, isUndoing } = useHabitLogs(habit.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click bubble

    if (status === "completed") {
      undoCheckIn(new Date(), {
        onSuccess: () => {
          onToggle();
          toast.success("Marked habit as incomplete");
        },
      });
    } else {
      checkIn(new Date(), {
        onSuccess: () => {
          onToggle();
          toast.success("Habit completed! Keep it up! 🎉");
        },
      });
    }
  };

  const isCompleted = status === "completed";

  // Emoji to Material Symbol Icon mapper
  const getIconElement = (iconStr: string) => {
    const mapping: Record<string, string> = {
      "💧": "water_drop",
      "💪": "fitness_center",
      "🧘": "self_improvement",
      "📚": "menu_book",
      "😴": "bedtime",
      "🏃": "directions_run",
      "🎯": "emoji_events",
      "💼": "work",
      "water": "water_drop",
      "fitness": "fitness_center",
      "self_improvement": "self_improvement",
      "book": "menu_book",
      "sleep": "bedtime",
      "work": "work",
      "food": "restaurant",
      "more": "more_horiz"
    };

    const sym = mapping[iconStr];
    if (sym) {
      return <span className="material-symbols-outlined text-[28px]">{sym}</span>;
    }

    // Fallback: Check if it's an icon code name itself (composed of lowercase letters and underscores)
    if (iconStr && iconStr.match(/^[a-z_]+$/)) {
      return <span className="material-symbols-outlined text-[28px]">{iconStr}</span>;
    }

    // Default: Raw emoji
    return <span className="text-[28px] leading-none">{iconStr}</span>;
  };

  // Color mapper
  const getColorClasses = (color: string) => {
    const mapping: Record<string, { bg: string; text: string }> = {
      blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
      green: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
      purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400" },
      red: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400" },
      orange: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
      pink: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400" },
    };
    return mapping[color] || mapping.blue;
  };

  const colors = getColorClasses(habit.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`p-5 rounded-2xl flex items-center justify-between border border-white dark:border-zinc-800 transition-all select-none ${
        isCompleted
          ? "bg-surface-container-lowest/70 dark:bg-zinc-900/60 opacity-70 shadow-none"
          : "bg-surface-container-lowest dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md cursor-pointer"
      }`}
    >
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
          {getIconElement(habit.icon)}
        </div>
        
        <div>
          <h3 className={`font-semibold text-[18px] md:text-headline-md text-on-surface dark:text-zinc-100 ${isCompleted ? "line-through opacity-60" : ""}`}>
            {habit.title}
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {habit.description && (
              <span className="flex items-center gap-1 text-label-caps text-on-surface-variant dark:text-zinc-400 text-[11px] font-mono uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">notes</span>
                {habit.description}
              </span>
            )}
            
            <span className="flex items-center gap-1 text-label-caps text-on-surface-variant dark:text-zinc-400 text-[11px] font-mono uppercase tracking-wider">
              <span className="material-symbols-outlined text-[13px]">event</span>
              {habit.frequency}
            </span>

            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-label-caps text-orange-600 dark:text-orange-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                {streak} Day Streak
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        disabled={isCheckingIn || isUndoing}
        onClick={handleToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 active:scale-90 ${
          isCompleted
            ? "bg-secondary-container dark:bg-blue-950/80 border-transparent text-on-secondary-container dark:text-blue-300"
            : "border-outline-variant dark:border-zinc-700 text-transparent hover:border-secondary dark:hover:border-blue-500"
        }`}
      >
        <span className="material-symbols-outlined font-bold text-[22px]" style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : undefined }}>
          check
        </span>
      </button>
    </motion.div>
  );
}
