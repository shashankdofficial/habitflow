"use client";

import { useState } from "react";
import { UserGamification } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface GamificationHeaderProps {
  gamification: UserGamification;
}

export function GamificationHeader({ gamification }: GamificationHeaderProps) {
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const unlockedCount = gamification.achievements.filter((a) => a.unlocked).length;

  return (
    <div className="w-full bg-gradient-to-r from-blue-900/90 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-8 border border-white/10">
      {/* Background Glow Accents */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Level Badge & XP Info */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-zinc-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-yellow-200">
              L{gamification.level}
            </div>
            <div className="absolute -bottom-2 bg-zinc-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest shadow">
              LEVEL
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                {gamification.xp} Total XP
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {gamification.xpToNextLevel} XP to Level {gamification.level + 1}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gamification.xpCurrentLevelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats & Badges Trigger */}
        <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <div>
              <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Longest Streak</div>
              <div className="text-lg font-bold font-mono text-white">{gamification.longestStreak} Days</div>
            </div>
          </div>

          <button
            onClick={() => setShowBadgesModal(true)}
            className="bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 hover:text-amber-100 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all text-sm font-semibold group cursor-pointer"
          >
            <span className="material-symbols-outlined text-amber-300 text-xl group-hover:scale-110 transition-transform">
              workspace_premium
            </span>
            <span>
              Badges ({unlockedCount}/{gamification.achievements.length})
            </span>
          </button>
        </div>
      </div>

      {/* Badges Modal */}
      <AnimatePresence>
        {showBadgesModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 text-white rounded-3xl max-w-lg w-full p-6 border border-zinc-800 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                    <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Achievements & Badges</h2>
                    <p className="text-xs text-zinc-400">Unlock trophies by building consistent habit routines</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBadgesModal(false)}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {gamification.achievements.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                      badge.unlocked
                        ? "bg-gradient-to-br from-zinc-800 to-zinc-900 border-amber-500/30 text-white shadow-md"
                        : "bg-zinc-900/50 border-zinc-800/80 opacity-50 grayscale"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        badge.unlocked ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-1.5">
                        {badge.title}
                        {badge.unlocked && (
                          <span className="material-symbols-outlined text-amber-400 text-sm">verified</span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-snug mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setShowBadgesModal(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
