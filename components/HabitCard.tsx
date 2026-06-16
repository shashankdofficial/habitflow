import { useQueryClient } from "@tanstack/react-query";
import { useHabitLogs } from "@/hooks/useHabits";
import {
  Flex,
  IconButton,
  Text,
  VStack,
  Badge,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const MotionFlex = motion(Flex);

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

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const descColor = useColorModeValue("gray.600", "gray.400");

  const handleToggle = () => {
    if (status === "completed") {
      undoCheckIn(new Date(), { onSuccess: onToggle });
    } else {
      checkIn(new Date(), { onSuccess: onToggle });
    }
  };

  return (
    <MotionFlex
      p={4}
      border="1px"
      borderRadius="xl"
      borderColor={borderColor}
      bg={bg}
      align="center"
      justify="space-between"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      }}
      _hover={{
        borderColor: status === "completed" ? undefined : "blue.300"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <VStack align="start" spacing={2} maxW="400px">
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          {habit.title}
        </Text>
        {habit.description && (
          <Text fontSize="sm" color={descColor}>
            {habit.description}
          </Text>
        )}
        <HStack spacing={2}>
          {streak > 0 && (
            <Badge colorScheme="orange" display="flex" alignItems="center" gap={1} borderRadius="md" px={2} py={0.5}>
              🔥 {streak} day streak
            </Badge>
          )}
          <Badge colorScheme="blue" borderRadius="md" px={2} py={0.5}>{habit.frequency}</Badge>
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
        borderRadius="full"
        boxShadow="sm"
        _hover={{ transform: "scale(1.1)" }}
        _active={{ transform: "scale(0.95)" }}
        transition="all 0.2s"
      />
    </MotionFlex>
  );
}
