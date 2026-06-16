"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs, calculateStreak } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  SimpleGrid,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { habits, isLoading } = useHabits(user?.id);
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("gray.800", "white");
  const secTextColor = useColorModeValue("gray.600", "gray.400");

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const logs = await Promise.all(
        habits.map(async (habit) => {
          const habitLogs = await getHabitLogs(habit.id);
          return habitLogs.map((log) => ({ ...log, habitTitle: habit.title, color: habit.color }));
        })
      );
      return logs.flat();
    },
    enabled: !!user?.id && habits.length > 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();

  const getWeeklyCompletionData = () => {
    const weeks = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = subDays(new Date(), i * 7);
      const weekEnd = subDays(weekStart, 6);
      const days = eachDayOfInterval({ start: weekEnd, end: weekStart });

      let completed = 0;
      let total = 0;

      days.forEach((day) => {
        const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
        completed += dayLogs.filter((log) => log.status === "completed").length;
        total += habits.length;
      });

      weeks.push({
        week: format(weekStart, "MMM d"),
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    return weeks;
  };

  const getDailyCompletionData = () => {
    return last30Days.map((day) => {
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
      const completed = dayLogs.filter((log) => log.status === "completed").length;
      const total = habits.length;
      return {
        date: format(day, "MMM d"),
        completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  };

  const getHabitPerformanceData = () => {
    return habits.map((habit) => {
      const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
      const streakData = calculateStreak(habitLogs);
      const completedLast30 = habitLogs.filter((log) => {
        const logDate = new Date(log.date);
        return last30Days.some((day) => isSameDay(logDate, day));
      }).length;

      return {
        habit: habit.title,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        completionRate: streakData.completionPercentage,
        completedLast30,
      };
    });
  };

  const getBestDays = () => {
    const dayStats = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    last30Days.forEach((day) => {
      const dayOfWeek = day.getDay();
      const dayLogs = allLogs.filter((log) => isSameDay(new Date(log.date), day));
      const completed = dayLogs.filter((log) => log.status === "completed").length;

      dayStats[dayOfWeek] += completed;
      dayCounts[dayOfWeek] += habits.length;
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return dayNames.map((name, index) => ({
      day: name,
      completion: dayCounts[index] > 0 ? Math.round((dayStats[index] / dayCounts[index]) * 100) : 0,
    }));
  };

  const overallStats = {
    totalHabits: habits.length,
    totalCheckIns: allLogs.filter((log) => log.status === "completed").length,
    avgCompletionRate: habits.length > 0
      ? Math.round(
          habits.reduce((sum, habit) => {
            const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
            return sum + calculateStreak(habitLogs).completionPercentage;
          }, 0) / habits.length
        )
      : 0,
    longestStreak: habits.length > 0
      ? Math.max(
          ...habits.map((habit) => {
            const habitLogs = allLogs.filter((log) => log.habit_id === habit.id);
            return calculateStreak(habitLogs).longestStreak;
          })
        )
      : 0,
  };

  if (authLoading || isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) return null;

  return (
    <Box minH="100vh" bg={bg}>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box maxW="7xl" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" color={textColor}>Analytics Dashboard</Heading>
              <Text color={secTextColor} mt={2}>
                Track your progress and insights 📊
              </Text>
            </Box>
            <Button
              as={NextLink}
              href="/dashboard"
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <StatCard
              title="Total Habits"
              value={overallStats.totalHabits}
              color="blue"
            />
            <StatCard
              title="Total Check-ins"
              value={overallStats.totalCheckIns}
              color="green"
            />
            <StatCard
              title="Avg Completion Rate"
              value={`${overallStats.avgCompletionRate}%`}
              color="purple"
            />
            <StatCard
              title="Longest Streak"
              value={`${overallStats.longestStreak} days`}
              color="orange"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <Card bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color={textColor}>Weekly Completion Rate</Heading>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getWeeklyCompletionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="completion" fill="#3182CE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md" color={textColor}>30-Day Trend</Heading>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getDailyCompletionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completion" stroke="#3182CE" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color={textColor}>Habit Performance</Heading>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getHabitPerformanceData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="habit" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentStreak" fill="#ED8936" name="Current Streak" />
                      <Bar dataKey="longestStreak" fill="#48BB78" name="Longest Streak" />
                      <Bar dataKey="completionRate" fill="#3182CE" name="Completion Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color={textColor}>Best Performing Days</Heading>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBestDays()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completion" fill="#805AD5" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
      </motion.div>
    </Box>
  );
}

function StatCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const titleColor = useColorModeValue("gray.600", "gray.400");
  const valueColor = useColorModeValue(
    {
      blue: "blue.600",
      green: "green.600",
      purple: "purple.600",
      orange: "orange.600",
    }[color] || "blue.600",
    {
      blue: "blue.300",
      green: "green.300",
      purple: "purple.300",
      orange: "orange.300",
    }[color] || "blue.300"
  );

  return (
    <Card bg={cardBg}>
      <CardBody>
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" color={titleColor}>
            {title}
          </Text>
          <Heading size="lg" color={valueColor}>
            {value}
          </Heading>
        </VStack>
      </CardBody>
    </Card>
  );
}
