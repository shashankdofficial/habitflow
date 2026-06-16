import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  useDisclosure,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Home, Calendar, BarChart3, Settings, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue("white", "gray.800");

  const navItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Calendar", icon: Calendar, href: "/calendar" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (!user) return null;

  return (
    <Box bg={bg} borderBottom="1px" borderColor="gray.200" position="sticky" top={0} zIndex={10}>
      <Flex maxW="7xl" mx="auto" px={4} h={16} align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <Link href="/dashboard">
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              HabitFlow
            </Text>
          </Link>

          <HStack display={{ base: "none", md: "flex" }} spacing={6}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <Flex
                    align="center"
                    gap={2}
                    px={3}
                    py={2}
                    borderRadius="md"
                    color={isActive ? "blue.500" : "gray.600"}
                    bg={isActive ? "blue.50" : "transparent"}
                    transition="all"
                    _hover={{
                      bg: isActive ? "blue.50" : "gray.100",
                    }}
                  >
                    <Icon size={18} />
                    <Text fontSize="sm" fontWeight="medium">
                      {item.label}
                    </Text>
                  </Flex>
                </Link>
              );
            })}
          </HStack>
        </Flex>

        <Flex align="center" gap={4}>
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Menu"
            icon={<Menu size={20} />}
            onClick={onOpen}
            variant="ghost"
          />

          <Button
            display={{ base: "none", md: "flex" }}
            leftIcon={<LogOut size={18} />}
            variant="ghost"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      <Box display={{ base: isOpen ? "block" : "none", md: "none" }} borderBottom="1px" borderColor="gray.200">
        <VStack spacing={2} py={4} align="stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <Flex
                  align="center"
                  gap={3}
                  px={4}
                  py={3}
                  color={isActive ? "blue.500" : "gray.600"}
                  bg={isActive ? "blue.50" : "transparent"}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <Text fontWeight="medium">{item.label}</Text>
                </Flex>
              </Link>
            );
          })}

          <Flex align="center" gap={3} px={4} py={3} color="gray.600" onClick={() => { handleSignOut(); onClose(); }} cursor="pointer">
            <LogOut size={18} />
            <Text fontWeight="medium">Sign Out</Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
