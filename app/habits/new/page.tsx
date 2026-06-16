"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { motion } from "framer-motion";
import Link from "next/link";
import { Habit } from "@/types";
import toast from "react-hot-toast";

// Icon options list (corresponds to getIconElement mapper inside HabitCard.tsx)
const ICONS = [
  { name: "fitness_center", label: "Fitness" },
  { name: "water_drop", label: "Water" },
  { name: "self_improvement", label: "Meditation" },
  { name: "menu_book", label: "Reading" },
  { name: "bedtime", label: "Sleep" },
  { name: "work", label: "Work" },
  { name: "restaurant", label: "Food" },
  { name: "more_horiz", label: "More" },
];

const COLORS = [
  { value: "blue", label: "BLUE", hexClass: "bg-blue-500 hover:ring-blue-500", ringClass: "ring-blue-500" },
  { value: "green", label: "GREEN", hexClass: "bg-emerald-500 hover:ring-emerald-500", ringClass: "ring-emerald-500" },
  { value: "purple", label: "PURPLE", hexClass: "bg-purple-500 hover:ring-purple-500", ringClass: "ring-purple-500" },
  { value: "red", label: "RED", hexClass: "bg-red-500 hover:ring-red-500", ringClass: "ring-red-500" },
  { value: "orange", label: "ORANGE", hexClass: "bg-amber-500 hover:ring-amber-500", ringClass: "ring-amber-500" },
  { value: "pink", label: "PINK", hexClass: "bg-pink-500 hover:ring-pink-500", ringClass: "ring-pink-500" },
];

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function NewHabitPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createHabit, isCreating } = useHabits(user?.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [showCustomDays, setShowCustomDays] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState("");
  const [color, setColor] = useState("blue");
  const [icon, setIcon] = useState("fitness_center");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleDayToggle = (dayVal: number) => {
    if (daysOfWeek.includes(dayVal)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayVal));
    } else {
      setDaysOfWeek([...daysOfWeek, dayVal].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a habit name");
      toast.error("Please enter a habit name");
      return;
    }

    const habitData: Omit<Habit, "id" | "created_at"> = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || undefined,
      frequency,
      days_of_week: frequency === "weekly" || showCustomDays ? (daysOfWeek.length > 0 ? daysOfWeek : undefined) : undefined,
      reminder_time: reminderTime || undefined,
      color,
      icon,
      is_active: true,
    };

    createHabit(habitData, {
      onSuccess: () => {
        toast.success("Habit created successfully!");
        router.push("/dashboard");
      },
      onError: (err: any) => {
        console.error("Failed to create habit:", err);
        const errorMsg = err?.message || "Failed to create habit. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-surface dark:bg-zinc-950 text-on-surface dark:text-zinc-100 font-sans min-h-screen">
      {/* Shell Suppression layout */}
      <main className="w-full px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col items-center">
        {/* Top Back Nav Link */}
        <div className="w-full max-w-2xl flex justify-start mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-white transition-colors group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-mono text-label-caps text-[11px] tracking-wider font-semibold">
              BACK TO DASHBOARD
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-2xl bg-surface-container-lowest dark:bg-zinc-900 rounded-2xl shadow-sm border border-outline-variant/30 dark:border-zinc-800/80 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 md:px-8 md:pt-10 md:pb-6 border-b border-outline-variant/20 dark:border-zinc-800">
            <h1 className="font-display text-headline-lg text-primary dark:text-white font-bold mb-2">
              Create New Habit
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-md">
              Design a routine that fits your lifestyle. Consistency starts here.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 md:mx-8 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-body-sm font-semibold border border-red-200/40 dark:border-red-900/30">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Habit Name & Desc */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="habit-name" className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                  Habit Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="habit-name"
                  type="text"
                  required
                  placeholder="e.g., Morning Meditation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-zinc-800 bg-surface dark:bg-zinc-950 text-on-surface dark:text-zinc-100 placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="habit-desc" className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                  Description <span className="text-on-surface-variant dark:text-zinc-400 font-normal text-body-sm">(optional)</span>
                </label>
                <textarea
                  id="habit-desc"
                  rows={3}
                  placeholder="Why is this habit important to you?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-zinc-800 bg-surface dark:bg-zinc-950 text-on-surface dark:text-zinc-100 placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                ></textarea>
              </div>
            </div>

            {/* Frequency & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-2">
                <label htmlFor="frequency" className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="frequency"
                    value={showCustomDays ? "custom" : frequency}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setShowCustomDays(true);
                        setFrequency("weekly");
                      } else {
                        setShowCustomDays(false);
                        setFrequency(val as "daily" | "weekly");
                        if (val === "daily") {
                          setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
                        }
                      }
                    }}
                    className="w-full appearance-none px-4 py-3 rounded-lg border border-outline-variant dark:border-zinc-800 bg-surface dark:bg-zinc-950 text-on-surface dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pr-10 cursor-pointer transition-all"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekly">Weekly (Once a Week)</option>
                    <option value="custom">Custom Days</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant dark:text-zinc-400">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reminder-time" className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                  Reminder Time <span className="text-on-surface-variant dark:text-zinc-400 font-normal text-body-sm">(optional)</span>
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-zinc-800 bg-surface dark:bg-zinc-950 text-on-surface dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Custom Days Checkbox Row */}
            {(showCustomDays || frequency === "weekly") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <label className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                  Select Days <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => {
                    const isSelected = daysOfWeek.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleDayToggle(day.value)}
                        className={`px-4 py-2 rounded-xl text-body-sm font-semibold transition-all border ${
                          isSelected
                            ? "bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent"
                            : "border-outline-variant dark:border-zinc-800 hover:bg-surface-container text-on-surface dark:text-zinc-300"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Color Identity */}
            <div className="space-y-3">
              <label className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                Visual Identity <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => {
                  const isSelected = color === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-12 h-12 rounded-full ${c.hexClass} border-4 transition-all ${
                        isSelected 
                          ? `border-white dark:border-zinc-900 ring-2 ${c.ringClass}` 
                          : "border-transparent"
                      }`}
                      title={c.label}
                    ></button>
                  );
                })}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-3">
              <label className="font-display text-headline-md font-bold text-on-surface dark:text-zinc-200 block">
                Representative Icon <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                {ICONS.map((i) => {
                  const isSelected = icon === i.name;
                  return (
                    <button
                      key={i.name}
                      type="button"
                      onClick={() => setIcon(i.name)}
                      className={`w-full aspect-square flex items-center justify-center rounded-xl border-2 transition-all ${
                        isSelected
                          ? "bg-primary dark:bg-zinc-100 border-primary dark:border-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                          : "bg-surface dark:bg-zinc-950 border-outline-variant/30 dark:border-zinc-800 text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container dark:hover:bg-zinc-900"
                      }`}
                      title={i.label}
                    >
                      <span className="material-symbols-outlined text-[24px]">{i.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit & Discard Action buttons */}
            <div className="pt-6 border-t border-outline-variant/20 dark:border-zinc-800 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{isCreating ? "Creating..." : "Create Habit"}</span>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </button>
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl border border-outline-variant dark:border-zinc-800 text-on-surface-variant dark:text-zinc-400 hover:bg-surface-container dark:hover:bg-zinc-900 transition-all font-semibold active:scale-[0.98] text-center"
              >
                Discard
              </Link>
            </div>
          </form>
        </div>

        {/* Bottom Motivational Cards */}
        <div className="w-full max-w-2xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container dark:bg-zinc-900 p-6 rounded-xl border border-outline-variant/20 dark:border-zinc-800/80 flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-secondary-container dark:bg-blue-950/60 text-on-secondary-container dark:text-blue-300 shrink-0">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h4 className="font-display text-headline-md font-bold text-primary dark:text-white mb-1">Small Steps</h4>
              <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                Atomic habits grow into major transformations. Start with something you can&apos;t say no to.
              </p>
            </div>
          </div>
          <div className="bg-surface-container dark:bg-zinc-900 p-6 rounded-xl border border-outline-variant/20 dark:border-zinc-800/80 flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-full bg-slate-200 dark:bg-zinc-800 text-primary dark:text-zinc-300 shrink-0">
              <span className="material-symbols-outlined text-[20px]">insights</span>
            </div>
            <div>
              <h4 className="font-display text-headline-md font-bold text-primary dark:text-white mb-1">Smart Tracking</h4>
              <p className="text-body-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                We&apos;ll analyze your consistency patterns to help you optimize your schedule automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
