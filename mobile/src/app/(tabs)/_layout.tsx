import { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Home, ListTodo, Calendar, Plus, Menu, BarChart3, Settings as SettingsIcon, LogOut, Trophy, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTodayHabits } from "../../hooks/useHabits";
import { calculateUserGamification } from "../../lib/habits";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useColorScheme } from "nativewind";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isDark = colorScheme === "dark";
  const { todayHabits, allLogs } = useTodayHabits(user?.uid);
  const gamification = calculateUserGamification(todayHabits, allLogs);

  const handleSignOut = async () => {
    setIsDrawerOpen(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#09090b" : "#ffffff",
            borderTopColor: isDark ? "#27272a" : "#e4e4e7",
            paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 6,
            paddingTop: 6,
            height: 64 + (insets.bottom > 0 ? insets.bottom : 0),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: isDark ? "#a1a1aa" : "#71717a",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Habits",
            tabBarIcon: ({ color }) => <ListTodo size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "",
            tabBarIcon: () => (
              <View className="items-center justify-center -mt-7">
                {/* Outer Curved Dock Circle */}
                <View className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-950 items-center justify-center shadow-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  {/* Inner Glowing Plus Button */}
                  <View className="w-13 h-13 rounded-full bg-blue-600 items-center justify-center shadow-md shadow-blue-500/50">
                    <Plus size={28} color="#ffffff" strokeWidth={2.5} />
                  </View>
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "More",
            tabBarIcon: ({ color }) => <Menu size={22} color={color} />,
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as any)}
                onPress={() => setIsDrawerOpen(true)}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Hamburger Side Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <View className="flex-1 bg-black/60 flex-row justify-end">
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => setIsDrawerOpen(false)} 
          />

          <View 
            className="w-4/5 max-w-[320px] bg-white dark:bg-zinc-900 h-full border-l border-zinc-200 dark:border-zinc-800 p-6 flex-col justify-between"
            style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
          >
            <View>
              {/* Drawer Header */}
              <View className="flex-row items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <View>
                  <Text className="text-zinc-900 dark:text-white font-bold text-lg">Menu & Navigation</Text>
                  <Text className="text-zinc-500 dark:text-zinc-400 text-xs">{user?.email}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsDrawerOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  <X size={18} color={isDark ? "#a1a1aa" : "#71717a"} />
                </TouchableOpacity>
              </View>

              {/* User Rank Card */}
              <View className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl mb-6">
                <View className="flex-row items-center mb-2">
                  <Trophy size={16} color="#eab308" style={{ marginRight: 6 }} />
                  <Text className="text-zinc-900 dark:text-white font-bold text-sm">Level {gamification.level} Rank</Text>
                </View>
                <Text className="text-yellow-600 dark:text-yellow-500 font-bold text-xs">{gamification.xp} XP Earned</Text>
              </View>

              {/* Drawer Links */}
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push("/(tabs)/analytics");
                  }}
                  className="flex-row items-center p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-3"
                >
                  <View className="p-2 bg-blue-500/20 rounded-xl mr-3">
                    <BarChart3 size={18} color="#3b82f6" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-semibold text-sm">Analytics Dashboard</Text>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Charts & habit performance</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push("/(tabs)/settings");
                  }}
                  className="flex-row items-center p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-3"
                >
                  <View className="p-2 bg-purple-500/20 rounded-xl mr-3">
                    <SettingsIcon size={18} color="#a855f7" />
                  </View>
                  <View>
                    <Text className="text-zinc-900 dark:text-white font-semibold text-sm">Account Settings</Text>
                    <Text className="text-zinc-500 dark:text-zinc-400 text-xs">Profile, theme & password</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Out */}
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl flex-row items-center justify-center"
            >
              <LogOut size={16} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-500 font-bold text-sm">Sign Out</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}
