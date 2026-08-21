"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHabitLogs, useHabits } from "@/hooks/useHabits";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

interface HabitCardProps {
  habit: {
    id: string;
    title: string;
    description?: string;
    color: string;
    frequency: "daily" | "weekly";
    icon: string;
    target_value?: number;
    target_unit?: string;
    time_of_day?: "morning" | "afternoon" | "evening" | "anytime";
  };
  status: "completed" | "pending" | "missed";
  streak: number;
  onToggle: () => void;
}

export function HabitCard({ habit, status, streak, onToggle }: HabitCardProps) {
  const { user } = useAuth();
  const { deleteHabit, isDeleting } = useHabits(user?.id);
  const { logs, checkIn, undoCheckIn, isCheckingIn, isUndoing } = useHabitLogs(habit.id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = () => {
    deleteHabit(habit.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        if (onToggle) onToggle();
      },
    });
  };

  // Today's log for target values
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = logs.find((l) => l.date === todayStr);
  const currentValue = todayLog?.value || (status === "completed" && habit.target_value ? habit.target_value : 0);

  const isCompleted = status === "completed";

  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCompleted) {
      undoCheckIn(new Date(), {
        onSuccess: () => {
          onToggle();
          toast.success("Marked habit as incomplete");
        },
      });
    } else {
      const logValue = habit.target_value || 1;
      checkIn(new Date(), logValue, {
        onSuccess: () => {
          onToggle();
          triggerConfetti();
          toast.success("Habit completed! Keep it up! 🎉");
        },
      });
    }
  };

  const handleIncrement = (e: React.MouseEvent, increment: number) => {
    e.stopPropagation();
    if (!habit.target_value) return;

    const newValue = Math.min(habit.target_value, currentValue + increment);
    checkIn(new Date(), newValue, {
      onSuccess: () => {
        onToggle();
        if (newValue >= habit.target_value!) {
          triggerConfetti();
          toast.success("Target reached! Excellent job! 🏆");
        } else {
          toast.success(`Logged +${increment} ${habit.target_unit || ""}`);
        }
      },
    });
  };

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
      water: "water_drop",
      fitness: "fitness_center",
      self_improvement: "self_improvement",
      book: "menu_book",
      sleep: "bedtime",
      work: "work",
      food: "restaurant",
      more: "more_horiz",
    };

    const sym = mapping[iconStr];
    if (sym) {
      return <span className="material-symbols-outlined text-[28px]">{sym}</span>;
    }

    if (iconStr && iconStr.match(/^[a-z_]+$/)) {
      return <span className="material-symbols-outlined text-[28px]">{iconStr}</span>;
    }

    return <span className="text-[28px] leading-none">{iconStr}</span>;
  };

  // Color mapper
  const getColorClasses = (color: string) => {
    const mapping: Record<string, { bg: string; text: string; fill: string }> = {
      blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", fill: "bg-blue-500" },
      green: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", fill: "bg-emerald-500" },
      purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", fill: "bg-purple-500" },
      red: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", fill: "bg-red-500" },
      orange: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", fill: "bg-amber-500" },
      pink: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400", fill: "bg-pink-500" },
    };
    return mapping[color] || mapping.blue;
  };

  const getTimeOfDayBadge = (tod?: string) => {
    if (!tod || tod === "anytime") return null;
    const badges: Record<string, { label: string; icon: string; style: string }> = {
      morning: { label: "Morning", icon: "wb_sunny", style: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" },
      afternoon: { label: "Afternoon", icon: "light_mode", style: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300" },
      evening: { label: "Evening", icon: "bedtime", style: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300" },
    };
    const b = badges[tod];
    if (!b) return null;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${b.style}`}>
        <span className="material-symbols-outlined text-[12px]">{b.icon}</span>
        {b.label}
      </span>
    );
  };

  const colors = getColorClasses(habit.color);
  const targetPct = habit.target_value ? Math.min(100, Math.round((currentValue / habit.target_value) * 100)) : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        className={`p-5 rounded-2xl flex flex-col justify-between border border-white dark:border-zinc-800 transition-all select-none gap-4 ${
          isCompleted
            ? "bg-surface-container-lowest/70 dark:bg-zinc-900/60 opacity-80 shadow-none"
            : "bg-surface-container-lowest dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
              {getIconElement(habit.icon)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold text-[18px] md:text-headline-md text-on-surface dark:text-zinc-100 ${isCompleted ? "line-through opacity-60" : ""}`}>
                  {habit.title}
                </h3>
                {getTimeOfDayBadge(habit.time_of_day)}
              </div>

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

          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={isCheckingIn || isUndoing}
              onClick={handleToggle}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 active:scale-90 ${
                isCompleted
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "border-outline-variant dark:border-zinc-700 text-zinc-400 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600"
              }`}
              title={isCompleted ? "Mark incomplete" : "Complete habit"}
            >
              <span className="material-symbols-outlined font-bold text-[22px]" style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : undefined }}>
                check
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={isDeleting}
              title="Delete habit"
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/40 transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>

        {/* Target Progress Bar & Increment controls */}
        {habit.target_value && habit.target_value > 0 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 dark:text-zinc-400">
                Progress: <strong className="text-zinc-800 dark:text-zinc-200">{currentValue}</strong> / {habit.target_value} {habit.target_unit}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{targetPct}%</span>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className={`h-full ${colors.fill} transition-all duration-300`} style={{ width: `${targetPct}%` }} />
            </div>

            {!isCompleted && (
              <div className="flex items-center gap-2 pt-1 justify-end">
                <button
                  onClick={(e) => handleIncrement(e, Math.ceil(habit.target_value! * 0.25))}
                  className="text-[11px] font-semibold font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/60 transition"
                >
                  +{Math.ceil(habit.target_value * 0.25)} {habit.target_unit}
                </button>
                <button
                  onClick={(e) => handleIncrement(e, Math.ceil(habit.target_value! * 0.5))}
                  className="text-[11px] font-semibold font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700/60 transition"
                >
                  +{Math.ceil(habit.target_value * 0.5)} {habit.target_unit}
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(false);
            }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 text-white rounded-3xl max-w-md w-full p-6 border border-zinc-800 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30 shrink-0">
                  <span className="material-symbols-outlined text-2xl">delete_forever</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Habit?</h3>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                    Are you sure you want to delete <strong className="text-white">&quot;{habit.title}&quot;</strong>? This will permanently remove the habit and its history.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80 mt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  {isDeleting ? "Deleting..." : "Delete Habit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
