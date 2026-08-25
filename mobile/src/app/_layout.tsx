import { Slot, useRouter, useSegments } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Appearance } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "../context/SearchContext";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

const queryClient = new QueryClient();

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeLoaded, setThemeLoaded] = useState(false);

  const isDark = colorScheme === "dark";

  // Load theme preference on boot
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("habitflow_theme");
        if (savedTheme) {
          setColorScheme(savedTheme as "light" | "dark");
          Appearance.setColorScheme(savedTheme as "light" | "dark");
        } else {
          // Default to light for new users
          setColorScheme("light");
          Appearance.setColorScheme("light");
        }
      } catch (err) {
        console.warn("Failed to load theme", err);
      } finally {
        setThemeLoaded(true);
      }
    };
    loadTheme();
  }, [setColorScheme]);

  useEffect(() => {
    if (loading || !themeLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (user && !inTabsGroup) {
      router.replace("/(tabs)");
    } else if (!user && !inAuthGroup && segments.length > 0 && (segments[0] as string) !== "") {
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments, themeLoaded]);

  if (loading || !themeLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
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
