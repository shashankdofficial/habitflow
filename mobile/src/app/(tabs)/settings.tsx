import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";

export default function Settings() {
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <View 
      className="flex-1 bg-zinc-950 p-6"
      style={{ paddingTop: insets.top + 20 }}
    >
      <Text className="text-white text-3xl font-bold mb-6">Settings</Text>
      
      <View className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl items-center shadow-md">
        <Text className="text-zinc-400 text-center mb-6">App settings will appear here.</Text>
        
        <TouchableOpacity 
          className="bg-red-500/10 border border-red-500/20 active:bg-red-500/20 w-full py-3 rounded-xl items-center"
          onPress={handleSignOut}
        >
          <Text className="text-red-400 font-semibold text-base">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
