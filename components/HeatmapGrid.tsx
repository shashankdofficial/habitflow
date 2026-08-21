"use client";

import { useMemo } from "react";
import { HabitLog } from "@/types";
import { subDays, format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";

interface HeatmapGridProps {
  logs: HabitLog[];
  daysCount?: number;
}

export function HeatmapGrid({ logs, daysCount = 119 }: HeatmapGridProps) {
  const today = useMemo(() => new Date(), []);
  const startDate = useMemo(() => subDays(today, daysCount), [today, daysCount]);

  // Compute log count per date
  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.status === "completed") {
        const dateKey = log.date;
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    return map;
  }, [logs]);

  // Generate grid columns (weeks)
  const days = useMemo(() => {
    const intervalStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const intervalEnd = endOfWeek(today, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: intervalStart, end: intervalEnd });
  }, [startDate, today]);

  // Color intensity mapping
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200/50 dark:border-zinc-700/30";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700";
    if (count === 2) return "bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500";
    return "bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 shadow-sm";
  };

  return (
    <div className="bg-surface-container-lowest dark:bg-zinc-900 border border-outline-variant/30 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">
            grid_view
          </span>
          <h3 className="font-bold text-on-surface dark:text-zinc-100 text-base">
            Consistency Activity Heatmap
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-zinc-400 font-mono">
          <span>Less</span>
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/30" />
          <div className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900/60" />
          <div className="w-3 h-3 rounded bg-emerald-400 dark:bg-emerald-600" />
          <div className="w-3 h-3 rounded bg-emerald-600 dark:bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[650px]">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const count = countsByDate[dateStr] || 0;
            const isToday = format(today, "yyyy-MM-dd") === dateStr;

            return (
              <div
                key={dateStr}
                title={`${format(day, "MMM d, yyyy")}: ${count} habits completed`}
                className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 cursor-pointer ${getColorClass(
                  count
                )} ${isToday ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-900" : ""}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
