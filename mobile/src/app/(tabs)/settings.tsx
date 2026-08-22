import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { User, LogOut, ChevronRight, Bell, Shield, CircleHelp } from "lucide-react-native";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const SettingRow = ({ icon: Icon, title, isDestructive = false, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className={`flex-row items-center justify-between py-4 border-b border-zinc-800/50 ${isDestructive ? 'mt-4 border-0' : ''}`}
    >
      <View className="flex-row items-center">
        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isDestructive ? 'bg-red-500/10' : 'bg-zinc-800'}`}>
          <Icon size={16} color={isDestructive ? "#ef4444" : "#a1a1aa"} />
        </View>
        <Text className={`text-base font-medium ${isDestructive ? 'text-red-500' : 'text-zinc-200'}`}>
          {title}
        </Text>
      </View>
      {!isDestructive && <ChevronRight size={20} color="#52525b" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-zinc-950" style={{ paddingTop: insets.top }}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        
        <View className="mt-4 mb-8">
          <Text className="text-white text-3xl font-extrabold tracking-tight">Settings</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-8 shadow-sm flex-row items-center">
          <View className="w-16 h-16 bg-blue-500/20 rounded-full items-center justify-center mr-4">
            <User size={32} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg mb-0.5">
              {user?.displayName || "HabitFlow User"}
            </Text>
            <Text className="text-zinc-400 text-sm">{user?.email}</Text>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl mb-6 shadow-sm">
          <Text className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-2">Preferences</Text>
          <SettingRow icon={Bell} title="Notifications" />
          <SettingRow icon={Shield} title="Privacy & Security" />
          <SettingRow icon={CircleHelp} title="Help & Support" />
        </View>

        <View className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl shadow-sm">
          <Text className="text-zinc-500 text-xs uppercase font-mono tracking-wider mb-2">Account</Text>
          <SettingRow 
            icon={LogOut} 
            title="Sign Out" 
            isDestructive={true} 
            onPress={handleSignOut} 
          />
        </View>

      </ScrollView>
    </View>
  );
}
