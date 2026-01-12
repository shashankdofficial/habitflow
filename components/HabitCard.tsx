import { useQueryClient } from "@tanstack/react-query";
import { useHabitLogs } from "@/hooks/useHabits";
import {
  Flex,
  IconButton,
  Text,
  VStack,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { Check, X } from "lucide-react";

interface HabitCardProps {
  habit: {
    id: string;
    title: string;
    description?: string;
    color: string;
    frequency: "daily" | "weekly";
  };
  status: "completed" | "pending" | "missed";
  streak: number;
  onToggle: () => void;
}

export function HabitCard({ habit, status, streak, onToggle }: HabitCardProps) {
  const queryClient = useQueryClient();
  const { checkIn, undoCheckIn, isCheckingIn, isUndoing } = useHabitLogs(habit.id);

  const handleToggle = () => {
    if (status === "completed") {
      undoCheckIn(new Date(), { onSuccess: onToggle });
    } else {
      checkIn(new Date(), { onSuccess: onToggle });
    }
  };

  return (
    <Flex
      p={4}
      border="1px"
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      align="center"
      justify="space-between"
      transition="all"
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
      }}
    >
      <VStack align="start" spacing={1} maxW="400px">
        <Text fontSize="lg" fontWeight="semibold">
          {habit.title}
        </Text>
        {habit.description && (
          <Text fontSize="sm" color="gray.600">
            {habit.description}
          </Text>
        )}
        <HStack spacing={2}>
          {streak > 0 && (
            <Badge colorScheme="orange" display="flex" alignItems="center" gap={1}>
              🔥 {streak} day streak
            </Badge>
          )}
          <Badge colorScheme="blue">{habit.frequency}</Badge>
        </HStack>
      </VStack>

      <IconButton
        aria-label={status === "completed" ? "Mark as incomplete" : "Mark as complete"}
        icon={status === "completed" ? <X size={20} /> : <Check size={20} />}
        colorScheme={status === "completed" ? "gray" : "green"}
        variant={status === "completed" ? "outline" : "solid"}
        onClick={handleToggle}
        isLoading={isCheckingIn || isUndoing}
        size="lg"
      />
    </Flex>
  );
}
