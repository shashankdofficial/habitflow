import { Slot, useRouter, useSegments } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "../context/SearchContext";
import { useColorScheme } from "nativewind";

const queryClient = new QueryClient();

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (user && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!user && !inAuthGroup && segments.length > 0 && (segments[0] as string) !== "") {
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? "dark bg-zinc-950" : "bg-zinc-50"}`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "dark bg-zinc-950" : "bg-zinc-50"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          <SafeAreaProvider>
            <InitialLayout />
          </SafeAreaProvider>
        </SearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
