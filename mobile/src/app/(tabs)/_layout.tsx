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

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
            backgroundColor: "#09090b", // dark slate/zinc
            borderTopColor: "#27272a",
            paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 8,
            paddingTop: 8,
            height: 62 + (insets.bottom > 0 ? insets.bottom : 0),
          },
          tabBarActiveTintColor: "#3b82f6",
          tabBarInactiveTintColor: "#a1a1aa",
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
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center -mt-5 shadow-lg border-4 border-zinc-950">
                <Plus size={24} color="#ffffff" strokeWidth={3} />
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
            href: null, // Hidden tab route accessible from drawer
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
          {/* Backdrop Tap Area */}
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => setIsDrawerOpen(false)} 
          />

          {/* Sliding Side Drawer Content */}
          <View 
            className="w-4/5 max-w-[320px] bg-zinc-900 h-full border-l border-zinc-800 p-6 flex-col justify-between"
            style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }}
          >
            <View>
              {/* Drawer Header */}
              <View className="flex-row items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                <View>
                  <Text className="text-white font-bold text-lg">Menu & Navigation</Text>
                  <Text className="text-zinc-400 text-xs">{user?.email}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsDrawerOpen(false)} className="p-2 bg-zinc-800 rounded-full">
                  <X size={18} color="#a1a1aa" />
                </TouchableOpacity>
              </View>

              {/* User Rank Card in Drawer */}
              <View className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl mb-6">
                <View className="flex-row items-center mb-2">
                  <Trophy size={16} color="#eab308" style={{ marginRight: 6 }} />
                  <Text className="text-white font-bold text-sm">Level {gamification.level} Rank</Text>
                </View>
                <Text className="text-yellow-500 font-bold text-xs">{gamification.xp} XP Earned</Text>
              </View>

              {/* Drawer Links */}
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push("/(tabs)/analytics");
                  }}
                  className="flex-row items-center p-3 bg-zinc-800/60 rounded-2xl border border-zinc-800 mb-3"
                >
                  <View className="p-2 bg-blue-500/20 rounded-xl mr-3">
                    <BarChart3 size={18} color="#60a5fa" />
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-sm">Analytics Dashboard</Text>
                    <Text className="text-zinc-400 text-xs">Charts & habit performance</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push("/(tabs)/settings");
                  }}
                  className="flex-row items-center p-3 bg-zinc-800/60 rounded-2xl border border-zinc-800 mb-3"
                >
                  <View className="p-2 bg-purple-500/20 rounded-xl mr-3">
                    <SettingsIcon size={18} color="#c084fc" />
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-sm">Account Settings</Text>
                    <Text className="text-zinc-400 text-xs">Profile, theme & password</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Out Button in Drawer */}
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-2xl flex-row items-center justify-center"
            >
              <LogOut size={16} color="#ef4444" style={{ marginRight: 8 }} />
              <Text className="text-red-400 font-bold text-sm">Sign Out</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}
