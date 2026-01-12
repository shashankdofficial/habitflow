"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTodayHabits } from "@/hooks/useHabits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getHabitLogs } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import { HabitCard } from "@/components/HabitCard";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Progress,
  useColorModeValue,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Plus, Flame, TrendingUp, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todayHabits, isLoading, habitStreaks, getHabitStatus, setAllLogs } =
    useTodayHabits(user?.id);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const habits = await Promise.all(
        todayHabits.map(async (habit) => {
          const logs = await getHabitLogs(habit.id);
          return logs.map((log) => ({ ...log, color: habit.color }));
        })
      );
      return habits.flat();
    },
    enabled: !!user?.id && todayHabits.length > 0,
  });

  useEffect(() => {
    if (allLogs) {
      setAllLogs(allLogs);
    }
  }, [allLogs, setAllLogs]);

  const completedToday = todayHabits.filter((habit) => {
    const logs = allLogs.filter((log) => log.habit_id === habit.id && log.status === "completed");
    const today = new Date();
    return logs.some((log) => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === today.toDateString();
    });
  }).length;

  const totalStreakDays = habitStreaks.reduce(
    (sum, s) => sum + s.currentStreak,
    0
  );

  if (authLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) return null;

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      <Navbar />
      <Box maxW="6xl" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
          <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
            <Box>
              <Heading size="xl">Welcome back, {user.user_metadata?.name || "Friend"}! 👋</Heading>
              <Text color="gray.600" mt={2}>
                Let's keep those streaks going!
              </Text>
            </Box>
            <Button
              as={NextLink}
              href="/habits/new"
              leftIcon={<Plus size={20} />}
              colorScheme="blue"
              width={{ base: "full", md: "auto" }}
            >
              New Habit
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="lg">
              <Flex align="center" gap={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.600"
                >
                  <Calendar size={24} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Today's Progress
                  </Text>
                  <Heading size="lg">
                    {completedToday}/{todayHabits.length}
                  </Heading>
                </VStack>
              </Flex>
              <Progress
                value={
                  todayHabits.length > 0
                    ? (completedToday / todayHabits.length) * 100
                    : 0
                }
                colorScheme="blue"
                mt={4}
              />
            </Box>

            <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="lg">
              <Flex align="center" gap={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg="orange.100"
                  color="orange.600"
                >
                  <Flame size={24} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Total Streaks
                  </Text>
                  <Heading size="lg">{totalStreakDays} days</Heading>
                </VStack>
              </Flex>
              <Text fontSize="sm" color="gray.500" mt={4}>
                Keep it up! Consistency is key 🔥
              </Text>
            </Box>

            <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="lg">
              <Flex align="center" gap={4}>
                <Box
                  p={3}
                  borderRadius="full"
                  bg="green.100"
                  color="green.600"
                >
                  <TrendingUp size={24} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    Active Habits
                  </Text>
                  <Heading size="lg">{todayHabits.length}</Heading>
                </VStack>
              </Flex>
              <Text fontSize="sm" color="gray.500" mt={4}>
                You're building momentum! 💪
              </Text>
            </Box>
          </SimpleGrid>

          <Box bg={useColorModeValue("white", "gray.800")} borderRadius="lg" p={6}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md">Today's Habits</Heading>
                <Text fontSize="sm" color="gray.500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </Flex>

              {todayHabits.length === 0 ? (
                <VStack py={8} spacing={4} align="center">
                  <Text color="gray.500">
                    No habits scheduled for today. Time to create one!
                  </Text>
                  <Button
                    as={NextLink}
                    href="/habits/new"
                    colorScheme="blue"
                    size="sm"
                  >
                    Create Your First Habit
                  </Button>
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  {todayHabits.map((habit) => {
                    const status = getHabitStatus(habit.id, new Date(), allLogs);
                    const streakData = habitStreaks.find(
                      (s) => s.habitId === habit.id
                    );

                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        status={status}
                        streak={streakData?.currentStreak || 0}
                        onToggle={() => {
                          queryClient.invalidateQueries({ queryKey: ["allHabitLogs", user?.id] });
                        }}
                      />
                    );
                  })}
                )}
                </VStack>
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
