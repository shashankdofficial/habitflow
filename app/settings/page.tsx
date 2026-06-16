"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs, calculateStreak } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import { useColorMode } from "@chakra-ui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { habits, isLoading: habitsLoading } = useHabits(user?.id);
  const { colorMode, toggleColorMode } = useColorMode();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const isPasswordUser = auth.currentUser
    ? auth.currentUser.providerData.some((prov) => prov.providerId === "password")
    : true;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const logs = await Promise.all(
        habits.map(async (habit) => {
          const habitLogs = await getHabitLogs(habit.id);
          return habitLogs.map((log) => ({ ...log, color: habit.color }));
        })
      );
      return logs.flat();
    },
    enabled: !!user?.id && habits.length > 0,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
        });
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("No active user session found.");
      }
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword) {
      toast.error("New password cannot be empty");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (auth.currentUser && auth.currentUser.email) {
        // First re-authenticate the user
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Then update the password
        await updatePassword(auth.currentUser, newPassword);
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        throw new Error("No active user session found.");
      }
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error?.code === "auth/invalid-credential" || error?.code === "auth/wrong-password") {
        toast.error("Incorrect current password. Please try again.");
      } else {
        toast.error(error?.message || "Failed to update password");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Stats calculation
  const totalCompletedCount = allLogs.filter((log) => log.status === "completed").length;
  
  const avgCompletionRate = habits.length > 0
    ? Math.round(
        habits.reduce((sum, habit) => {
          const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
          return sum + calculateStreak(habitLogs).completionPercentage;
        }, 0) / habits.length
      )
    : 0;

  const maxStreak = habits.length > 0
    ? Math.max(
        ...habits.map((habit) => {
          const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
          return calculateStreak(habitLogs).longestStreak;
        })
      )
    : 0;

  const rank = avgCompletionRate > 80 ? "Master" : avgCompletionRate > 50 ? "Achiever" : "Novice";

  if (authLoading || habitsLoading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-white"></div>
      </div>
    );
  }

  if (!user) return null;

  const userInitials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "US";

  return (
    <Navbar>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-margin-mobile md:px-margin-desktop py-12"
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-section-gap gap-4">
          <div>
            <h1 className="font-display text-headline-lg font-bold text-primary dark:text-white mb-2">
              Settings
            </h1>
            <p className="text-on-surface-variant dark:text-zinc-400 text-body-md flex items-center gap-2">
              <span>Manage your account and preferences</span>
              <span className="material-symbols-outlined text-[16px]">settings</span>
            </p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant dark:border-zinc-800 text-on-surface dark:text-zinc-200 rounded-lg text-body-md hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-all active:scale-95 duration-150 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col gap-gutter">
          {/* Profile Information Card */}
          <section className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-6 mb-8 border-b border-outline-variant/30 dark:border-zinc-800 pb-8">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-surface-container-low dark:bg-zinc-800 border-2 border-outline-variant dark:border-zinc-700 flex items-center justify-center text-primary dark:text-zinc-300 font-bold text-xl md:text-2xl">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-headline-md font-bold text-primary dark:text-white truncate">
                  {name || "User"}
                </h2>
                <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm truncate">{email}</p>
                <p className="text-outline dark:text-zinc-500 font-mono text-[11px] uppercase tracking-wider mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[22px]">person</span>
              <h3 className="font-semibold text-body-lg">Profile Information</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 max-w-2xl">
              <div className="space-y-2">
                <label className="block font-medium text-label-md text-on-surface-variant dark:text-zinc-400">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-zinc-950 border border-outline-variant dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-on-surface dark:text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-label-md text-on-surface-variant dark:text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-zinc-950 border border-outline-variant dark:border-zinc-800 rounded-xl outline-none text-on-surface/50 dark:text-zinc-400/50 cursor-not-allowed"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-3 bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>

          {/* Notifications Card */}
          <section className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-8 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <h3 className="font-semibold text-body-lg">Notifications</h3>
            </div>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-body-md text-on-surface dark:text-zinc-200">Email Notifications</p>
                  <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm">
                    Receive daily reminders and progress updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-body-md text-on-surface dark:text-zinc-200">Push Notifications</p>
                  <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm">
                    Get notified when it&apos;s time to complete habits
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Appearance Card */}
          <section className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-8 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[22px]">dark_mode</span>
              <h3 className="font-semibold text-body-lg">Appearance</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-body-md text-on-surface dark:text-zinc-200">Dark Mode</p>
                <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm">
                  Switch between light and dark themes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={colorMode === "dark"}
                  onChange={toggleColorMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </section>

          {/* Account Security Card */}
          <section className="bg-white dark:bg-zinc-900 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 dark:border-zinc-800 rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-8 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[22px]">security</span>
              <h3 className="font-semibold text-body-lg">Account & Security</h3>
            </div>
            <div className="space-y-8">
              <div className="border-b border-outline-variant/30 dark:border-zinc-800 pb-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-body-md text-on-surface dark:text-zinc-200">Change Password</p>
                    <p className="text-on-surface-variant dark:text-zinc-400 text-body-sm">
                      {isPasswordUser
                        ? "Update your password regularly for security"
                        : "Your account is linked with Google. Manage password via Google settings."}
                    </p>
                  </div>
                  {isPasswordUser && (
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-6 py-2 border border-outline-variant dark:border-zinc-800 text-on-surface dark:text-zinc-200 rounded-lg text-body-sm hover:bg-surface-container-low dark:hover:bg-zinc-800 transition-colors"
                    >
                      {showPasswordForm ? "Cancel" : "Change"}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isPasswordUser && showPasswordForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-4 max-w-2xl bg-surface-container-lowest dark:bg-zinc-950 p-6 rounded-xl border border-outline-variant dark:border-zinc-800"
                    >
                      <div className="space-y-2">
                        <label className="block font-medium text-label-md text-on-surface-variant dark:text-zinc-400">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-on-surface dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px] select-none block">
                              {showCurrentPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-medium text-label-md text-on-surface-variant dark:text-zinc-400">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-on-surface dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px] select-none block">
                              {showNewPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block font-medium text-label-md text-on-surface-variant dark:text-zinc-400">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-zinc-900 border border-outline-variant dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-on-surface dark:text-zinc-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px] select-none block">
                              {showConfirmPassword ? "visibility_off" : "visibility"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdatePassword}
                        disabled={isUpdatingPassword}
                        className="w-full mt-2 py-3 bg-blue-600 dark:bg-blue-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-4 border border-red-500 text-red-500 font-semibold rounded-xl hover:bg-red-500/5 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Stats Footer */}
        <div className="mt-section-gap grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div className="bg-surface-container dark:bg-zinc-900 p-4 rounded-xl text-center border border-outline-variant/20 dark:border-zinc-800">
            <p className="text-outline dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">STREAK</p>
            <p className="font-display text-headline-md font-bold text-primary dark:text-white flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-orange-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span>{maxStreak} Days</span>
            </p>
          </div>
          <div className="bg-surface-container dark:bg-zinc-900 p-4 rounded-xl text-center border border-outline-variant/20 dark:border-zinc-800">
            <p className="text-outline dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">COMPLETED</p>
            <p className="font-display text-headline-md font-bold text-primary dark:text-white">
              {totalCompletedCount} Habits
            </p>
          </div>
          <div className="bg-surface-container dark:bg-zinc-900 p-4 rounded-xl text-center border border-outline-variant/20 dark:border-zinc-800">
            <p className="text-outline dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">ACCURACY</p>
            <p className="font-display text-headline-md font-bold text-primary dark:text-white">
              {avgCompletionRate}%
            </p>
          </div>
          <div className="bg-surface-container dark:bg-zinc-900 p-4 rounded-xl text-center border border-outline-variant/20 dark:border-zinc-800">
            <p className="text-outline dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-1">RANK</p>
            <p className="font-display text-headline-md font-bold text-primary dark:text-white">
              {rank}
            </p>
          </div>
        </div>
      </motion.div>
    </Navbar>
  );
}
