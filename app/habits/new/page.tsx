"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  Stack,
  useColorModeValue,
  Select,
  CheckboxGroup,
  Checkbox,
  Textarea,
  Card,
  CardBody,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import { Habit } from "@/types";

const ICONS = [
  { name: "Fitness", emoji: "💪" },
  { name: "Reading", emoji: "📚" },
  { name: "Meditation", emoji: "🧘" },
  { name: "Water", emoji: "💧" },
  { name: "Sleep", emoji: "😴" },
  { name: "Health", emoji: "🏃" },
  { name: "Learning", emoji: "🎯" },
  { name: "Work", emoji: "💼" },
];

export default function NewHabitPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createHabit, isCreating } = useHabits(user?.id);
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const secTextColor = useColorModeValue("gray.600", "gray.400");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState("");
  const [color, setColor] = useState("blue");
  const [icon, setIcon] = useState("💪");
  const [error, setError] = useState("");

  const DAYS = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a habit name");
      return;
    }

    const habitData: Omit<Habit, "id" | "created_at"> = {
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || undefined,
      frequency,
      days_of_week: frequency === "weekly" && daysOfWeek.length > 0 ? daysOfWeek : undefined,
      reminder_time: reminderTime || undefined,
      color,
      icon,
      is_active: true,
    };

    console.log("Creating habit:", habitData);

    createHabit(habitData, {
      onSuccess: () => {
        console.log("Habit created successfully");
        router.push("/dashboard");
      },
      onError: (error: any) => {
        console.error("Failed to create habit:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        const errorMsg = error?.message || "Failed to create habit. Please try again.";
        setError(errorMsg);
      },
    });
  };

  if (authLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg={bg}>
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box maxW="2xl" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
          <Button
            as={NextLink}
            href="/dashboard"
            variant="ghost"
            leftIcon={<ArrowLeft size={20} />}
            alignSelf="flex-start"
          >
            Back to Dashboard
          </Button>

          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="xl" color={textColor}>Create New Habit</Heading>
                  <Text color={secTextColor} mt={2}>
                    Start building positive habits today
                  </Text>
                </Box>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <VStack spacing={6} align="stretch">
                    <FormControl isRequired>
                      <FormLabel color={textColor}>Habit Name</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Exercise for 30 minutes"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textColor}>Description (optional)</FormLabel>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add some details about this habit..."
                        rows={3}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor}>Frequency</FormLabel>
                      <Select
                        value={frequency}
                        onChange={(e) =>
                          setFrequency(e.target.value as "daily" | "weekly")
                        }
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </Select>
                    </FormControl>

                    {frequency === "weekly" && (
                      <FormControl isRequired>
                        <FormLabel color={textColor}>Days of Week</FormLabel>
                        <CheckboxGroup
                          value={daysOfWeek.map(String)}
                          onChange={(values) =>
                            setDaysOfWeek(values.map(Number))
                          }
                        >
                          <Stack direction="row" spacing={4} wrap="wrap">
                            {DAYS.map((day) => (
                              <Checkbox key={day.value} value={String(day.value)}>
                                {day.label}
                              </Checkbox>
                            ))}
                          </Stack>
                        </CheckboxGroup>
                      </FormControl>
                    )}

                    <FormControl>
                      <FormLabel color={textColor}>Reminder Time (optional)</FormLabel>
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor}>Color</FormLabel>
                      <Stack direction="row" spacing={3} wrap="wrap">
                        {[{ name: "Blue", value: "blue" },
                        { name: "Green", value: "green" },
                        { name: "Purple", value: "purple" },
                        { name: "Red", value: "red" },
                        { name: "Orange", value: "orange" },
                        { name: "Pink", value: "pink" }].map((c) => (
                          <Button
                            key={c.value}
                            size="sm"
                            variant={color === c.value ? "solid" : "outline"}
                            colorScheme={c.value}
                            onClick={() => setColor(c.value)}
                          >
                            {c.name}
                          </Button>
                        ))}
                      </Stack>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor}>Icon</FormLabel>
                      <Stack direction="row" spacing={3} wrap="wrap">
                        {ICONS.map((i) => (
                          <Button
                            key={i.emoji}
                            size="sm"
                            variant={icon === i.emoji ? "solid" : "outline"}
                            onClick={() => setIcon(i.emoji)}
                            fontSize="2xl"
                            minW="50px"
                          >
                            {i.emoji}
                          </Button>
                        ))}
                      </Stack>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isLoading={isCreating}
                      loadingText="Creating habit..."
                    >
                      Create Habit
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
        </Box>
      </motion.div>
    </Box>
  );
}
