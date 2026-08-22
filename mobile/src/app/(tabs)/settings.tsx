import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../lib/firebase";
import { signOut, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { useHabits } from "../../hooks/useHabits";
import { getHabitLogs, calculateStreak } from "../../lib/habits";
import { useQuery } from "@tanstack/react-query";
import { User, LogOut, ChevronDown, ChevronUp, Bell, Shield, Moon, Save, KeyRound, Flame, CheckCircle2, Award } from "lucide-react-native";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { habits } = useHabits(user?.uid);

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preference Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Password Form State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const isPasswordUser = auth.currentUser
    ? auth.currentUser.providerData.some((prov) => prov.providerId === "password")
    : true;

  useEffect(() => {
    if (user) {
      setName(user.displayName || user.email?.split("@")[0] || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Fetch logs for summary stats footer
  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogsSettings", user?.uid],
    queryFn: async () => {
      if (!user?.uid || habits.length === 0) return [];
      const logsPromises = habits.map((h) => getHabitLogs(h.id));
      const logsArrays = await Promise.all(logsPromises);
      return logsArrays.flat();
    },
    enabled: !!user?.uid && habits.length > 0,
  });

  // Footer Stats Calculation
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

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setIsSavingProfile(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
        });
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        throw new Error("No active user session.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        
        Alert.alert("Success", "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        
        <View className="mt-4 mb-6">
          <Text className="text-white text-3xl font-extrabold tracking-tight">Settings</Text>
          <Text className="text-zinc-400 mt-1 text-sm">Manage your account and preferences ⚙️</Text>
        </View>

        {/* Profile Header Card */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm flex-row items-center">
          <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4 border-2 border-zinc-700">
            <Text className="text-white font-bold text-xl">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg" numberOfLines={1}>
              {name || "User"}
            </Text>
            <Text className="text-zinc-400 text-xs" numberOfLines={1}>{email}</Text>
            <Text className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mt-1">
              Member Account
            </Text>
          </View>
        </View>

        {/* Profile Information Section */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <User size={18} color="#60a5fa" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">Profile Information</Text>
          </View>

          <View className="mb-4">
            <Text className="text-zinc-400 text-xs font-semibold mb-1.5">Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#71717a"
              className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-white text-sm outline-none"
            />
          </View>

          <View className="mb-5">
            <Text className="text-zinc-400 text-xs font-semibold mb-1.5">Email Address</Text>
            <TextInput
              value={email}
              editable={false}
              className="bg-zinc-950/60 border border-zinc-800/60 rounded-2xl px-4 py-3 text-zinc-500 text-sm"
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-blue-600 py-3 rounded-2xl flex-row items-center justify-center"
          >
            {isSavingProfile ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Save size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-white font-semibold text-sm">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Bell size={18} color="#60a5fa" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">Notifications</Text>
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-zinc-800/80">
            <View>
              <Text className="text-zinc-200 font-medium text-sm">Email Notifications</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">Daily reminders & updates</Text>
            </View>
            <Switch
              value={emailNotifs}
              onValueChange={setEmailNotifs}
              trackColor={{ false: "#27272a", true: "#3b82f6" }}
              thumbColor="#fff"
            />
          </View>

          <View className="flex-row items-center justify-between pt-3">
            <View>
              <Text className="text-zinc-200 font-medium text-sm">Push Notifications</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">Habit check-in prompts</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: "#27272a", true: "#3b82f6" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Moon size={18} color="#60a5fa" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">Appearance</Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-zinc-200 font-medium text-sm">Dark Mode</Text>
              <Text className="text-zinc-400 text-xs mt-0.5">Optimized dark theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#27272a", true: "#3b82f6" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Account & Security Section */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Shield size={18} color="#60a5fa" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">Account & Security</Text>
            </View>
            {isPasswordUser ? (
              <TouchableOpacity 
                onPress={() => setShowPasswordForm(!showPasswordForm)}
                className="flex-row items-center bg-zinc-800 px-3 py-1.5 rounded-xl"
              >
                <KeyRound size={14} color="#94a3b8" style={{ marginRight: 4 }} />
                <Text className="text-zinc-300 text-xs font-semibold">Change Password</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {!isPasswordUser && (
            <Text className="text-zinc-400 text-xs mt-1">
              Your account is signed in via Google OAuth. Password management is handled by Google.
            </Text>
          )}

          {/* Expandable Password Form */}
          {showPasswordForm && isPasswordUser && (
            <View className="mt-4 pt-4 border-t border-zinc-800">
              <View className="mb-3">
                <Text className="text-zinc-400 text-xs font-semibold mb-1">Current Password</Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                  placeholderTextColor="#71717a"
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <View className="mb-3">
                <Text className="text-zinc-400 text-xs font-semibold mb-1">New Password</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="At least 6 characters"
                  placeholderTextColor="#71717a"
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <View className="mb-4">
                <Text className="text-zinc-400 text-xs font-semibold mb-1">Confirm New Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Re-enter new password"
                  placeholderTextColor="#71717a"
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-white text-sm"
                />
              </View>

              <TouchableOpacity
                onPress={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="bg-blue-600 py-2.5 rounded-2xl items-center"
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-xs">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Summary Footer */}
        <View className="flex-row justify-between gap-2 mb-6">
          <View className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl items-center">
            <Flame size={16} color="#f97316" />
            <Text className="text-zinc-500 font-mono text-[9px] uppercase mt-1">Streak</Text>
            <Text className="text-white font-bold text-base mt-0.5">{maxStreak} Days</Text>
          </View>

          <View className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl items-center">
            <CheckCircle2 size={16} color="#3b82f6" />
            <Text className="text-zinc-500 font-mono text-[9px] uppercase mt-1">Completed</Text>
            <Text className="text-white font-bold text-base mt-0.5">{totalCompletedCount}</Text>
          </View>

          <View className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl items-center">
            <Award size={16} color="#eab308" />
            <Text className="text-zinc-500 font-mono text-[9px] uppercase mt-1">Rank</Text>
            <Text className="text-white font-bold text-base mt-0.5">{rank}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex-row items-center justify-center mb-6"
        >
          <LogOut size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text className="text-red-400 font-bold text-base">Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
