"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useQuery } from "@tanstack/react-query";
import { getHabitLogs } from "@/lib/habits";
import { Navbar } from "@/components/Navbar";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  Tooltip,
  SimpleGrid,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import NextLink from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths } from "date-fns";

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { habits, isLoading } = useHabits(user?.id);
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const { colorMode } = useColorMode();
  const textColor = useColorModeValue("gray.800", "white");
  const secTextColor = useColorModeValue("gray.600", "gray.400");
  const isDark = colorMode === "dark";

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const { data: allLogs = [] } = useQuery({
    queryKey: ["allHabitLogs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const logs = await Promise.all(
        habits.map(async (habit) => {
          const habitLogs = await getHabitLogs(habit.id);
          return habitLogs.map((log) => ({ ...log, color: habit.color }));
        })
      );
      return logs.flat();
    },
    enabled: !!user?.id && habits.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const getCompletionDataForDay = (day: Date) => {
    const dayLogs = allLogs.filter((log) =>
      isSameDay(new Date(log.date), day)
    );
    const completed = dayLogs.filter((log) => log.status === "completed").length;
    const total = habits.length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  };

  const getDayColor = (day: Date) => {
    const { percentage } = getCompletionDataForDay(day);
    if (percentage === 0) return isDark ? "gray.800" : "gray.100";
    if (percentage < 25) return isDark ? "red.900" : "red.100";
    if (percentage < 50) return isDark ? "orange.900" : "orange.100";
    if (percentage < 75) return isDark ? "yellow.900" : "yellow.100";
    if (percentage < 100) return isDark ? "green.900" : "green.100";
    return isDark ? "green.700" : "green.300";
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
        <Box maxW="6xl" mx="auto" px={4} py={8}>
          <VStack spacing={8} align="stretch">
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap={4}>
              <Box>
                <Heading size="xl" color={textColor}>Calendar View</Heading>
                <Text color={secTextColor} mt={2}>
                  Track your habit consistency over time 📅
                </Text>
              </Box>
              <Button
                as={NextLink}
                href="/dashboard"
                variant="outline"
                width={{ base: "full", md: "auto" }}
              >
                Back to Dashboard
              </Button>
            </Flex>

            <Card bg={cardBg}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
                    <HStack width={{ base: "full", md: "auto" }} justify="space-between">
                      <IconButton
                        aria-label="Previous month"
                        icon={<ChevronLeft size={20} />}
                        onClick={goToPreviousMonth}
                        variant="ghost"
                      />
                      <Button variant="ghost" onClick={goToToday}>
                        Today
                      </Button>
                      <IconButton
                        aria-label="Next month"
                        icon={<ChevronRight size={20} />}
                        onClick={goToNextMonth}
                        variant="ghost"
                      />
                    </HStack>

                    <Heading size="lg" textAlign="center" color={textColor}>
                      {format(currentDate, "MMMM yyyy")}
                    </Heading>

                    <Box w={{ base: "0", md: "120px" }} />
                  </Flex>

                  <Box>
                    <HStack mb={4}>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <Box key={day} flex="1" textAlign="center" fontWeight="bold" color={secTextColor} fontSize={{ base: "xs", md: "md" }}>
                          {day}
                        </Box>
                      ))}
                    </HStack>

                    <SimpleGrid columns={7} gap={{ base: 1, md: 2 }}>
                      {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <Box key={`empty-${i}`} />
                      ))}

                      {days.map((day) => {
                        const { completed, total, percentage } = getCompletionDataForDay(day);
                        const isToday = isSameDay(day, new Date());

                        return (
                          <Tooltip
                            key={day.toISOString()}
                            label={
                              total > 0
                                ? `${completed}/${total} habits completed (${Math.round(percentage)}%)`
                                : "No habits scheduled"
                            }
                          >
                            <Box
                              p={{ base: 1, md: 3 }}
                              borderRadius="md"
                              bg={getDayColor(day)}
                              textAlign="center"
                              cursor="pointer"
                              border={isToday ? "2px solid" : "none"}
                              borderColor="blue.500"
                              transition="all"
                              _hover={{
                                transform: "scale(1.05)",
                              }}
                              minH={{ base: "60px", md: "auto" }}
                              display="flex"
                              flexDirection="column"
                              justifyContent="center"
                              alignItems="center"
                            >
                              <Text fontWeight={isToday ? "bold" : "normal"} fontSize={{ base: "sm", md: "md" }} color={textColor}>
                                {format(day, "d")}
                              </Text>
                              {total > 0 && (
                                <Text fontSize={{ base: "2xs", md: "xs" }} color={secTextColor}>
                                  {completed}/{total}
                                </Text>
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </SimpleGrid>
                  </Box>

                  <HStack spacing={{ base: 2, md: 6 }} justify="center" wrap="wrap">
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "gray.800" : "gray.100"} border="1px solid" borderColor={isDark ? "gray.700" : "gray.200"} />
                      <Text fontSize="xs" color={secTextColor}>0%</Text>
                    </HStack>
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "red.900" : "red.100"} />
                      <Text fontSize="xs" color={secTextColor}>1-24%</Text>
                    </HStack>
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "orange.900" : "orange.100"} />
                      <Text fontSize="xs" color={secTextColor}>25-49%</Text>
                    </HStack>
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "yellow.900" : "yellow.100"} />
                      <Text fontSize="xs" color={secTextColor}>50-74%</Text>
                    </HStack>
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "green.900" : "green.100"} />
                      <Text fontSize="xs" color={secTextColor}>75-99%</Text>
                    </HStack>
                    <HStack>
                      <Box w="4" h="4" borderRadius="sm" bg={isDark ? "green.700" : "green.300"} />
                      <Text fontSize="xs" color={secTextColor}>100%</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </motion.div>
    </Box>
  );
}
