import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Calendar() {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="flex-1 bg-zinc-950 p-6"
      style={{ paddingTop: insets.top + 20 }}
    >
      <Text className="text-white text-3xl font-bold mb-6">Calendar</Text>
      
      <View className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl items-center shadow-md">
        <Text className="text-zinc-400 text-center">Calendar view will appear here.</Text>
      </View>
    </View>
  );
}
