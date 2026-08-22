import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View 
      className="flex-1 bg-zinc-950 items-center justify-center p-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl items-center shadow-xl max-w-sm w-full">
        <Text className="text-white text-3xl font-extrabold mb-2 tracking-tight">
          HabitFlow
        </Text>
        <Text className="text-zinc-400 text-center mb-8">
          Your cross-platform AI habit tracker, perfectly synced.
        </Text>
        
        <TouchableOpacity 
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 w-full py-4 rounded-xl items-center"
          onPress={() => router.push("/(tabs)")}
        >
          <Text className="text-white font-semibold text-lg">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
