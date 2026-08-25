"use client";

import React from "react";

const ICON_MAP: Record<string, string> = {
  // Material symbols
  fitness_center: "fitness_center",
  water_drop: "water_drop",
  self_improvement: "self_improvement",
  menu_book: "menu_book",
  bedtime: "bedtime",
  work: "work",
  restaurant: "restaurant",
  more_horiz: "more_horiz",
  emoji_events: "emoji_events",
  track_changes: "track_changes",

  // Lucide names from Mobile
  Dumbbell: "fitness_center",
  Droplets: "water_drop",
  Smile: "self_improvement",
  BookOpen: "menu_book",
  Bed: "bedtime",
  Briefcase: "work",
  Utensils: "restaurant",
  MoreHorizontal: "more_horiz",
  Target: "track_changes",

  // Emojis / short keys
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
  book: "menu_book",
  sleep: "bedtime",
  food: "restaurant",
  more: "more_horiz",
};

interface HabitIconProps {
  icon?: string;
  title?: string;
  className?: string;
}

export function HabitIcon({ icon, title, className = "text-[28px]" }: HabitIconProps) {
  if (!icon) {
    return <span className={`material-symbols-outlined ${className}`}>track_changes</span>;
  }

  // 1. Direct mapping check
  const mappedSymbol = ICON_MAP[icon];
  if (mappedSymbol) {
    return <span className={`material-symbols-outlined ${className}`}>{mappedSymbol}</span>;
  }

  // 2. Check if valid material symbol string (snake_case)
  if (/^[a-z_]+$/.test(icon)) {
    return <span className={`material-symbols-outlined ${className}`}>{icon}</span>;
  }

  // 3. Check if single emoji or non-ascii character
  if (icon.length <= 2 && icon.charCodeAt(0) > 127) {
    return <span className={`leading-none ${className}`}>{icon}</span>;
  }

  // 4. Default fallback symbol instead of displaying raw text strings like "MoreHorizontal" or "EV"
  return <span className={`material-symbols-outlined ${className}`}>track_changes</span>;
}
