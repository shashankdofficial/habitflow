import { Slot, useRouter, useSegments } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function InitialLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (user && !inTabsGroup) {
      // If user is signed in and not in tabs, redirect to dashboard
      router.replace("/(tabs)");
    } else if (!user && !inAuthGroup && segments.length > 0 && segments[0] !== "") {
      // If user is not signed in and trying to access restricted screens, redirect to login
      // We allow them to stay on the index ("") screen.
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#60a5fa" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <InitialLayout />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
